import os
import logging
from datetime import datetime, timedelta
from typing import Optional

import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
from passlib.context import CryptContext

from fastapi import FastAPI, Depends, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from starlette.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from pydantic import BaseModel


# Load environment variables
load_dotenv()

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_env_list(name: str, default: str = ""):
    raw = os.getenv(name, default)
    return [o.strip() for o in raw.split(",") if o.strip()]


# Setup logging
log_level = os.getenv("LOG_LEVEL", "INFO").upper()
logging.basicConfig(
    level=getattr(logging, log_level, logging.INFO),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    filename=os.getenv("LOG_FILE", "library.log"),
)
logger = logging.getLogger(__name__)


# Create FastAPI app
app = FastAPI(title="Library Management API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_env_list("CORS_ORIGINS", "http://localhost:8080"),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Sessions
secret_key = os.getenv("SECRET_KEY", "change-me")
session_hours = int(os.getenv("SESSION_LIFETIME_HOURS", "2"))
app.add_middleware(SessionMiddleware, secret_key=secret_key, max_age=session_hours * 3600)


# Database connection manager
class Database:
    def __init__(self):
        self.host = os.getenv("DB_HOST", "localhost")
        self.port = int(os.getenv("DB_PORT", "5432"))
        self.database = os.getenv("DB_NAME", "library_db")
        self.user = os.getenv("DB_USER", "postgres")
        self.password = os.getenv("DB_PASSWORD", "")

    def get_connection(self):
        return psycopg2.connect(
            host=self.host,
            port=self.port,
            database=self.database,
            user=self.user,
            password=self.password,
            cursor_factory=RealDictCursor,
        )

    def execute_query(self, query, params=None, fetch_one: bool = False):
        conn = self.get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute(query, params)
            if query.strip().upper().startswith("SELECT"):
                return cursor.fetchone() if fetch_one else cursor.fetchall()
            else:
                conn.commit()
                return cursor.rowcount
        finally:
            cursor.close()
            conn.close()

    def execute_function(self, function_name, params=None):
        placeholders = ", ".join(["%s"] * len(params)) if params else ""
        query = f"SELECT * FROM library.{function_name}({placeholders})"
        return self.execute_query(query, params)


db = Database()


# Dependencies for auth
def require_login(request: Request):
    if "user_email" not in request.session:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    return {
        "email": request.session.get("user_email"),
        "role": request.session.get("user_role", "user"),
        "name": request.session.get("user_name"),
    }


def require_admin(user=Depends(require_login)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return user


# Request models
class LoginRequest(BaseModel):
    email: str
    password: str


class BorrowRequest(BaseModel):
    publication_id: int
    lab_id: int


class CanBorrowRequest(BaseModel):
    publication_id: int
    email: Optional[str] = None


class ProposalCreate(BaseModel):
    title: str
    authors: str
    publication_type: str
    publisher: Optional[str] = None
    year: int
    estimated_price: Optional[float] = None
    currency: Optional[str] = "EUR"
    justification: str


class ProposalUpdate(BaseModel):
    status: str
    comments: Optional[str] = None


# ============================================================================
# AUTHENTICATION ENDPOINTS
# ============================================================================


@app.post("/api/auth/login")
def login(payload: LoginRequest, request: Request):
    email = payload.email
    password = payload.password

    user = db.execute_query(
        "SELECT * FROM library.library_user WHERE email = %s AND active = true",
        (email,),
        fetch_one=True,
    )

    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Verify password (if hashed_password exists in database)
    # For now, check if hashed_password column exists and verify
    if "hashed_password" in user and user["hashed_password"]:
        if not pwd_context.verify(password, user["hashed_password"]):
            raise HTTPException(status_code=401, detail="Invalid credentials")
    else:
        # Temporary: accept any password if no hashed_password set
        # In production, this should be removed after migration
        logger.warning(f"User {email} has no hashed_password - accepting any password temporarily")

    # Set session
    request.session["user_email"] = user["email"]
    request.session["user_name"] = user["name"]
    request.session["user_role"] = "admin" if "admin" in email else "user"

    logger.info(f"User {email} logged in")

    return {
        "message": "Login successful",
        "user": {
            "email": user["email"],
            "name": user["name"],
            "role": request.session["user_role"],
        },
    }


@app.post("/api/auth/logout")
def logout(request: Request, user=Depends(require_login)):
    email = request.session.get("user_email")
    request.session.clear()
    logger.info(f"User {email} logged out")
    return {"message": "Logout successful"}


@app.get("/api/auth/me")
def get_current_user(request: Request, user=Depends(require_login)):
    email = request.session.get("user_email")
    user_row = db.execute_query(
        "SELECT * FROM library.library_user WHERE email = %s",
        (email,),
        fetch_one=True,
    )

    labs = db.execute_query(
        """
        SELECT l.id_lab, l.name 
        FROM library.lab l
        JOIN library.user_access ua ON l.id_lab = ua.id_lab
        WHERE ua.email = %s
        """,
        (email,),
    )

    return {"user": user_row, "labs": labs, "role": request.session.get("user_role")}


# ============================================================================
# PUBLICATION ENDPOINTS
# ============================================================================


@app.get("/api/publications")
def get_publications(
    page: int = 1,
    per_page: int = 20,
    search: Optional[str] = "",
    type: Optional[str] = "",
    lab_id: Optional[int] = None,
    available: bool = False,
):
    per_page = min(per_page, int(os.getenv("MAX_PAGE_SIZE", "100")))
    offset = (page - 1) * per_page

    query = """
        SELECT DISTINCT
            p.id_publication,
            p.title,
            p.year_publication,
            p.publication_type,
            p.edition,
            pub.name as publisher_name,
            STRING_AGG(DISTINCT a.name, ', ') as authors
        FROM library.publication p
        LEFT JOIN library.publisher pub ON p.id_publisher = pub.id_publisher
        LEFT JOIN library.publication_author pa ON p.id_publication = pa.id_publication
        LEFT JOIN library.author a ON pa.id_author = a.id_author
        LEFT JOIN library.publication_copy pc ON p.id_publication = pc.id_publication
        WHERE 1=1
    """

    params = []

    if search:
        query += " AND LOWER(p.title) LIKE LOWER(%s)"
        params.append(f"%{search}%")

    if type:
        query += " AND p.publication_type = %s"
        params.append(type)

    if lab_id is not None:
        query += " AND pc.id_lab = %s"
        params.append(lab_id)

    if available:
        query += " AND pc.status = 'on_rack'"

    query += """
        GROUP BY p.id_publication, p.title, p.year_publication, 
                 p.publication_type, p.edition, pub.name
        ORDER BY p.title
        LIMIT %s OFFSET %s
    """
    params.extend([per_page, offset])

    publications = db.execute_query(query, params)

    count_query = "SELECT COUNT(DISTINCT p.id_publication) FROM library.publication p"
    if search or type or lab_id is not None or available:
        count_query += " LEFT JOIN library.publication_copy pc ON p.id_publication = pc.id_publication WHERE 1=1"
        count_params = []
        if search:
            count_query += " AND LOWER(p.title) LIKE LOWER(%s)"
            count_params.append(f"%{search}%")
        if type:
            count_query += " AND p.publication_type = %s"
            count_params.append(type)
        if lab_id is not None:
            count_query += " AND pc.id_lab = %s"
            count_params.append(lab_id)
        if available:
            count_query += " AND pc.status = 'on_rack'"
        total = db.execute_query(count_query, count_params, fetch_one=True)["count"]
    else:
        total = db.execute_query(count_query, fetch_one=True)["count"]

    return {
        "publications": publications,
        "pagination": {
            "page": page,
            "per_page": per_page,
            "total": total,
            "pages": (total + per_page - 1) // per_page,
        },
    }


@app.get("/api/publications/{id}")
def get_publication(id: int):
    publication = db.execute_query(
        """
        SELECT 
            p.*,
            pub.name as publisher_name,
            rb.isbn,
            per.volume_number,
            ir.identification_number,
            ir.report_type
        FROM library.publication p
        LEFT JOIN library.publisher pub ON p.id_publisher = pub.id_publisher
        LEFT JOIN library.regular_book rb ON p.id_publication = rb.id_publication
        LEFT JOIN library.periodic per ON p.id_publication = per.id_publication
        LEFT JOIN library.internal_report ir ON p.id_publication = ir.id_publication
        WHERE p.id_publication = %s
        """,
        (id,),
        fetch_one=True,
    )

    if not publication:
        raise HTTPException(status_code=404, detail="Publication not found")

    authors = db.execute_query(
        """
        SELECT a.name, a.email
        FROM library.author a
        JOIN library.publication_author pa ON a.id_author = pa.id_author
        WHERE pa.id_publication = %s
        ORDER BY pa.author_order
        """,
        (id,),
    )

    categories = db.execute_query(
        """
        SELECT c.name
        FROM library.category c
        JOIN library.book_category bc ON c.id_category = bc.id_category
        WHERE bc.id_publication = %s
        """,
        (id,),
    )

    keywords = db.execute_query(
        """
        SELECT k.word
        FROM library.keyword k
        JOIN library.publication_keyword pk ON k.id_keyword = pk.id_keyword
        WHERE pk.id_publication = %s
        """,
        (id,),
    )

    copies = db.execute_query(
        """
        SELECT 
            pc.id_copy,
            l.name as lab_name,
            pc.status,
            pc.purchase_price,
            pc.currency,
            b.name as bookshop_name
        FROM library.publication_copy pc
        JOIN library.lab l ON pc.id_lab = l.id_lab
        LEFT JOIN library.bookshop b ON pc.id_bookshop = b.id_bookshop
        WHERE pc.id_publication = %s
        """,
        (id,),
    )

    publication["authors"] = authors
    publication["categories"] = [c["name"] for c in categories]
    publication["keywords"] = [k["word"] for k in keywords]
    publication["copies"] = copies

    return publication


# ============================================================================
# BORROWING ENDPOINTS
# ============================================================================


@app.get("/api/borrowings")
def get_borrowings(request: Request, user=Depends(require_login)):
    email = request.session.get("user_email")
    role = request.session.get("user_role")

    if role == "admin":
        borrowings = db.execute_query(
            """
            SELECT 
                b.id_borrowing,
                b.borrow_date,
                b.due_date,
                b.return_date,
                lu.email,
                lu.name as user_name,
                p.title,
                l.name as lab_name
            FROM library.borrowing b
            JOIN library.publication_copy pc ON b.id_copy = pc.id_copy
            JOIN library.publication p ON pc.id_publication = p.id_publication
            JOIN library.lab l ON pc.id_lab = l.id_lab
            JOIN library.library_user lu ON b.email = lu.email
            ORDER BY b.borrow_date DESC
            """
        )
    else:
        borrowings = db.execute_query(
            """
            SELECT 
                b.id_borrowing,
                b.borrow_date,
                b.due_date,
                b.return_date,
                p.title,
                l.name as lab_name
            FROM library.borrowing b
            JOIN library.publication_copy pc ON b.id_copy = pc.id_copy
            JOIN library.publication p ON pc.id_publication = p.id_publication
            JOIN library.lab l ON pc.id_lab = l.id_lab
            WHERE b.email = %s
            ORDER BY b.borrow_date DESC
            """,
            (email,),
        )

    return borrowings


@app.post("/api/borrowings", status_code=201)
def create_borrowing(payload: BorrowRequest, request: Request, user=Depends(require_login)):
    email = request.session.get("user_email")
    publication_id = payload.publication_id
    lab_id = payload.lab_id

    can_borrow = db.execute_function("can_user_borrow_publication", (email, publication_id))

    if not can_borrow or not can_borrow[0]["can_borrow"]:
        reason = can_borrow[0]["reason"] if can_borrow else "Cannot borrow this publication"
        raise HTTPException(status_code=403, detail=reason)

    copy = db.execute_query(
        """
        SELECT id_copy 
        FROM library.publication_copy 
        WHERE id_publication = %s 
        AND id_lab = %s 
        AND status = 'on_rack'
        LIMIT 1
        """,
        (publication_id, lab_id),
        fetch_one=True,
    )

    if not copy:
        raise HTTPException(status_code=404, detail="No available copy in this lab")

    due_date = datetime.now().date() + timedelta(days=14)
    result = db.execute_query(
        """
        INSERT INTO library.borrowing (id_copy, email, borrow_date, due_date)
        VALUES (%s, %s, CURRENT_DATE, %s)
        RETURNING id_borrowing
        """,
        (copy["id_copy"], email, due_date),
        fetch_one=True,
    )

    logger.info(f"User {email} borrowed publication {publication_id} from lab {lab_id}")

    return {"message": "Book borrowed successfully", "borrowing_id": result["id_borrowing"], "due_date": due_date.isoformat()}


@app.put("/api/borrowings/{id}/return")
def return_book(id: int, request: Request, user=Depends(require_login)):
    email = request.session.get("user_email")
    role = request.session.get("user_role")

    borrowing = db.execute_query(
        """
        SELECT * FROM library.borrowing 
        WHERE id_borrowing = %s AND return_date IS NULL
        """,
        (id,),
        fetch_one=True,
    )

    if not borrowing:
        raise HTTPException(status_code=404, detail="Borrowing not found or already returned")

    if role != "admin" and borrowing["email"] != email:
        raise HTTPException(status_code=403, detail="Unauthorized")

    db.execute_query(
        """
        UPDATE library.borrowing 
        SET return_date = CURRENT_DATE 
        WHERE id_borrowing = %s
        """,
        (id,),
    )

    logger.info(f"Borrowing {id} returned by {email}")

    return {"message": "Book returned successfully"}


# ============================================================================
# REPORTS ENDPOINTS
# ============================================================================


@app.get("/api/reports/all-publications")
def report_all_publications():
    publications = db.execute_query("SELECT * FROM library.all_unique_publications")
    return publications


@app.get("/api/reports/user-borrowings/{email}")
def report_user_borrowings(email: str, request: Request, user=Depends(require_login)):
    if request.session.get("user_role") != "admin" and request.session.get("user_email") != email:
        raise HTTPException(status_code=403, detail="Unauthorized")

    lab_id = request.query_params.get("lab_id")
    borrowings = db.execute_function(
        "get_user_borrowed_publications",
        (email, lab_id) if lab_id else (email,),
    )
    return borrowings


@app.get("/api/reports/lab-value/{lab_id}")
def report_lab_value(lab_id: int, user=Depends(require_admin)):
    value = db.execute_function("get_lab_total_value_in_euro", (lab_id,))
    return value[0] if value else {}


@app.post("/api/reports/can-borrow")
def report_can_borrow(payload: CanBorrowRequest, request: Request, user=Depends(require_login)):
    email = payload.email or request.session.get("user_email")
    publication_id = payload.publication_id

    result = db.execute_function("can_user_borrow_publication", (email, publication_id))
    return result[0] if result else {}


@app.get("/api/reports/lost-books")
def report_lost_books(user=Depends(require_admin)):
    lost_books = db.execute_query("SELECT * FROM library.lost_books_report")
    return lost_books


# ============================================================================
# LAB ENDPOINTS
# ============================================================================


@app.get("/api/labs")
def get_labs():
    labs = db.execute_query(
        """
        SELECT 
            l.*,
            COUNT(DISTINCT pc.id_copy) as total_copies,
            COUNT(DISTINCT CASE WHEN pc.status = 'on_rack' THEN pc.id_copy END) as available_copies
        FROM library.lab l
        LEFT JOIN library.publication_copy pc ON l.id_lab = pc.id_lab
        GROUP BY l.id_lab
        ORDER BY l.name
        """
    )
    return labs


# ============================================================================
# USER ENDPOINTS
# ============================================================================


@app.get("/api/users")
def get_users(user=Depends(require_admin)):
    users = db.execute_query(
        """
        SELECT 
            lu.*,
            COUNT(DISTINCT ua.id_lab) as lab_access_count,
            COUNT(DISTINCT b.id_borrowing) FILTER (WHERE b.return_date IS NULL) as active_borrowings
        FROM library.library_user lu
        LEFT JOIN library.user_access ua ON lu.email = ua.email
        LEFT JOIN library.borrowing b ON lu.email = b.email
        GROUP BY lu.email
        ORDER BY lu.name
        """
    )
    return users


# ============================================================================
# STATISTICS ENDPOINT
# ============================================================================


@app.get("/api/stats")
def get_statistics():
    stats = db.execute_query("SELECT * FROM library.library_statistics", fetch_one=True)
    return stats


# ============================================================================
# PROPOSALS ENDPOINTS
# ============================================================================


@app.get("/api/proposals")
def get_proposals(user=Depends(require_login)):
    """Get all proposals. Admin sees all, regular users see only their own."""
    email = user["email"]
    role = user["role"]

    if role == "admin":
        # Admin sees all proposals
        proposals = db.execute_query(
            """
            SELECT
                pp.*,
                lu.name as submitted_by_name
            FROM library.proposed_publication pp
            LEFT JOIN library.library_user lu ON pp.email = lu.email
            ORDER BY pp.date_proposal DESC
            """
        )
    else:
        # Regular users see only their proposals
        proposals = db.execute_query(
            """
            SELECT
                pp.*,
                lu.name as submitted_by_name
            FROM library.proposed_publication pp
            LEFT JOIN library.library_user lu ON pp.email = lu.email
            WHERE pp.email = %s
            ORDER BY pp.date_proposal DESC
            """,
            (email,)
        )

    return proposals


@app.post("/api/proposals")
def create_proposal(proposal: ProposalCreate, user=Depends(require_login)):
    """Create a new publication proposal."""
    email = user["email"]

    # Build details JSONB
    details = {
        "authors": proposal.authors,
        "publisher": proposal.publisher,
        "year": proposal.year,
        "estimated_price": proposal.estimated_price,
        "currency": proposal.currency,
        "justification": proposal.justification
    }

    result = db.execute_query(
        """
        INSERT INTO library.proposed_publication
        (email, title, publication_type, details, status)
        VALUES (%s, %s, %s, %s, 'pending')
        RETURNING id_proposal, date_proposal
        """,
        (email, proposal.title, proposal.publication_type, psycopg2.extras.Json(details))
    )

    return {
        "message": "Proposal created successfully",
        "id_proposal": result[0]["id_proposal"] if result else None,
        "date_proposal": result[0]["date_proposal"] if result else None
    }


@app.put("/api/proposals/{proposal_id}")
def update_proposal(proposal_id: int, update: ProposalUpdate, user=Depends(require_admin)):
    """Update proposal status (admin only)."""
    email = user["email"]

    db.execute_query(
        """
        UPDATE library.proposed_publication
        SET status = %s,
            reviewed_by = %s,
            reviewed_at = CURRENT_TIMESTAMP
        WHERE id_proposal = %s
        """,
        (update.status, email, proposal_id)
    )

    return {"message": "Proposal updated successfully"}


# ============================================================================
# ERROR HANDLERS
# ============================================================================


@app.exception_handler(StarletteHTTPException)
def http_exception_handler(request: Request, exc: StarletteHTTPException):
    if exc.status_code == 404:
        return JSONResponse(status_code=404, content={"error": "Endpoint not found"})
    return JSONResponse(status_code=exc.status_code, content={"error": exc.detail})


@app.exception_handler(Exception)
def unhandled_exception_handler(request: Request, exc: Exception):
    logger.error(f"Internal server error: {exc}")
    return JSONResponse(status_code=500, content={"error": "Internal server error"})


# ============================================================================
# MAIN
# ============================================================================


if __name__ == "__main__":
    import uvicorn
    import sys
    from pathlib import Path

    # Test database connection
    try:
        test_conn = db.get_connection()
        test_conn.close()
        print("✓ Database connection successful")
    except Exception as e:
        print(f"✗ Database connection failed: {e}")
        raise SystemExit(1)

    # Configure server
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "5001"))
    reload = os.getenv("ENV", "development") == "development"

    # Add backend dir to path for module resolution
    backend_dir = Path(__file__).parent
    sys.path.insert(0, str(backend_dir))

    # Run server
    if reload:
        uvicorn.run("app:app", host=host, port=port, reload=reload, reload_dirs=[str(backend_dir)])
    else:
        uvicorn.run(app, host=host, port=port)

