-- Drop existing schema if exists
DROP SCHEMA IF EXISTS library CASCADE;
CREATE SCHEMA library;
SET search_path TO library;

-- Create ENUM types
CREATE TYPE publication_status AS ENUM ('on_rack', 'issued_to', 'lost', 'to_be_bought');
CREATE TYPE publication_type AS ENUM ('book', 'periodic', 'thesis', 'scientific_report');
CREATE TYPE currency_code AS ENUM ('EUR', 'USD', 'GBP');

-- Table: Publisher
CREATE TABLE publisher (
    id_publisher SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: Author
CREATE TABLE author (
    id_author SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: Lab
CREATE TABLE lab (
    id_lab SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    department VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: Bookshop
CREATE TABLE bookshop (
    id_bookshop SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: Currency Exchange Rates
CREATE TABLE currency (
    code currency_code PRIMARY KEY,
    rate_to_euro DECIMAL(10, 4) NOT NULL CHECK (rate_to_euro > 0),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: Category
CREATE TABLE category (
    id_category SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);

-- Table: Keyword
CREATE TABLE keyword (
    id_keyword SERIAL PRIMARY KEY,
    word VARCHAR(50) NOT NULL UNIQUE
);

-- Table: Library User
CREATE TABLE library_user (
    email VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    registration_date DATE DEFAULT CURRENT_DATE,
    active BOOLEAN DEFAULT TRUE
);

-- Table: Publication (Main entity with inheritance)
CREATE TABLE publication (
    id_publication SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    year_publication INTEGER CHECK (year_publication >= 1450 AND year_publication <= EXTRACT(YEAR FROM CURRENT_DATE) + 1),
    publication_type publication_type NOT NULL,
    id_publisher INTEGER REFERENCES publisher(id_publisher),
    edition VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: Regular Book (inherits from Publication)
CREATE TABLE regular_book (
    id_publication INTEGER PRIMARY KEY REFERENCES publication(id_publication) ON DELETE CASCADE,
    isbn VARCHAR(20) UNIQUE NOT NULL
);

-- Table: Periodic (inherits from Publication)
CREATE TABLE periodic (
    id_publication INTEGER PRIMARY KEY REFERENCES publication(id_publication) ON DELETE CASCADE,
    volume_number VARCHAR(50) NOT NULL
);

-- Table: Internal Report (inherits from Publication)
CREATE TABLE internal_report (
    id_publication INTEGER PRIMARY KEY REFERENCES publication(id_publication) ON DELETE CASCADE,
    identification_number VARCHAR(100) UNIQUE NOT NULL,
    report_type VARCHAR(20) CHECK (report_type IN ('thesis', 'scientific_report'))
);

-- Table: Publication Copy (each lab owns copies)
CREATE TABLE publication_copy (
    id_copy SERIAL PRIMARY KEY,
    id_publication INTEGER NOT NULL REFERENCES publication(id_publication) ON DELETE CASCADE,
    id_lab INTEGER NOT NULL REFERENCES lab(id_lab) ON DELETE CASCADE,
    id_bookshop INTEGER REFERENCES bookshop(id_bookshop),
    purchase_price DECIMAL(10, 2),
    currency currency_code DEFAULT 'EUR',
    purchase_date DATE,
    status publication_status DEFAULT 'on_rack',
    UNIQUE(id_publication, id_lab) -- One copy per publication per lab
);

-- Table: Publication Authors (N:M relationship)
CREATE TABLE publication_author (
    id_publication INTEGER REFERENCES publication(id_publication) ON DELETE CASCADE,
    id_author INTEGER REFERENCES author(id_author) ON DELETE CASCADE,
    author_order INTEGER NOT NULL DEFAULT 1,
    PRIMARY KEY (id_publication, id_author)
);

-- Table: Book Categories (N:M relationship, max 4 per book)
CREATE TABLE book_category (
    id_publication INTEGER REFERENCES regular_book(id_publication) ON DELETE CASCADE,
    id_category INTEGER REFERENCES category(id_category) ON DELETE CASCADE,
    PRIMARY KEY (id_publication, id_category)
);

-- Table: Publication Keywords (N:M relationship)
CREATE TABLE publication_keyword (
    id_publication INTEGER REFERENCES publication(id_publication) ON DELETE CASCADE,
    id_keyword INTEGER REFERENCES keyword(id_keyword) ON DELETE CASCADE,
    PRIMARY KEY (id_publication, id_keyword)
);

-- Table: User Access Rights (N:M relationship)
CREATE TABLE user_access (
    email VARCHAR(255) REFERENCES library_user(email) ON DELETE CASCADE,
    id_lab INTEGER REFERENCES lab(id_lab) ON DELETE CASCADE,
    granted_date DATE DEFAULT CURRENT_DATE,
    PRIMARY KEY (email, id_lab)
);

-- Table: User Interests (N:M relationship)
CREATE TABLE user_interest (
    email VARCHAR(255) REFERENCES library_user(email) ON DELETE CASCADE,
    id_keyword INTEGER REFERENCES keyword(id_keyword) ON DELETE CASCADE,
    PRIMARY KEY (email, id_keyword)
);

-- Table: Borrowing Records
CREATE TABLE borrowing (
    id_borrowing SERIAL PRIMARY KEY,
    id_copy INTEGER REFERENCES publication_copy(id_copy),
    email VARCHAR(255) REFERENCES library_user(email),
    borrow_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '14 days'),
    return_date DATE,
    CONSTRAINT valid_dates CHECK (due_date >= borrow_date AND (return_date IS NULL OR return_date >= borrow_date))
);

-- Table: Proposed Publications
CREATE TABLE proposed_publication (
    id_proposal SERIAL PRIMARY KEY,
    email VARCHAR(255) REFERENCES library_user(email),
    title VARCHAR(500) NOT NULL,
    publication_type publication_type NOT NULL,
    details JSONB, -- Store all publication-specific details as JSON
    date_proposal DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'ordered'))
);

-- Indexes for performance
CREATE INDEX idx_publication_year ON publication(year_publication);
CREATE INDEX idx_publication_type ON publication(publication_type);
CREATE INDEX idx_publication_title ON publication(LOWER(title));
CREATE INDEX idx_copy_status ON publication_copy(status);
CREATE INDEX idx_copy_lab ON publication_copy(id_lab);
CREATE INDEX idx_borrowing_email ON borrowing(email);
CREATE INDEX idx_borrowing_copy ON borrowing(id_copy);
CREATE INDEX idx_borrowing_return ON borrowing(return_date);
CREATE INDEX idx_author_name ON author(LOWER(name));
CREATE INDEX idx_book_isbn ON regular_book(isbn);

-- Views for common queries
CREATE VIEW available_publications AS
SELECT 
    p.id_publication,
    p.title,
    p.year_publication,
    p.publication_type,
    pub.name as publisher,
    l.name as lab_name,
    pc.status
FROM publication p
JOIN publication_copy pc ON p.id_publication = pc.id_publication
JOIN lab l ON pc.id_lab = l.id_lab
LEFT JOIN publisher pub ON p.id_publisher = pub.id_publisher
WHERE pc.status = 'on_rack';

CREATE VIEW user_borrowed_books AS
SELECT 
    lu.email,
    lu.name as user_name,
    p.title,
    l.name as lab_name,
    b.borrow_date,
    b.due_date,
    b.return_date
FROM borrowing b
JOIN publication_copy pc ON b.id_copy = pc.id_copy
JOIN publication p ON pc.id_publication = p.id_publication
JOIN lab l ON pc.id_lab = l.id_lab
JOIN library_user lu ON b.email = lu.email
WHERE b.return_date IS NULL;

-- Functions and Triggers

-- Function to check max authors constraint
CREATE OR REPLACE FUNCTION check_max_authors()
RETURNS TRIGGER AS $$
DECLARE
    author_count INTEGER;
    is_thesis BOOLEAN;
BEGIN
    -- Count existing authors for this publication
    SELECT COUNT(*) INTO author_count
    FROM publication_author
    WHERE id_publication = NEW.id_publication;
    
    -- Check if it's a thesis
    SELECT EXISTS(
        SELECT 1 FROM internal_report ir
        JOIN publication p ON ir.id_publication = p.id_publication
        WHERE ir.id_publication = NEW.id_publication
        AND ir.report_type = 'thesis'
    ) INTO is_thesis;
    
    -- Thesis can have only 1 author
    IF is_thesis AND author_count >= 1 THEN
        RAISE EXCEPTION 'A thesis can have only one author';
    -- Regular books can have max 4 authors
    ELSIF author_count >= 4 THEN
        RAISE EXCEPTION 'A publication can have maximum 4 authors';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_authors_limit
BEFORE INSERT ON publication_author
FOR EACH ROW EXECUTE FUNCTION check_max_authors();

-- Function to check max categories for books
CREATE OR REPLACE FUNCTION check_max_categories()
RETURNS TRIGGER AS $$
DECLARE
    category_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO category_count
    FROM book_category
    WHERE id_publication = NEW.id_publication;
    
    IF category_count >= 4 THEN
        RAISE EXCEPTION 'A book can belong to maximum 4 categories';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_categories_limit
BEFORE INSERT ON book_category
FOR EACH ROW EXECUTE FUNCTION check_max_categories();

-- Function to update copy status when borrowed
CREATE OR REPLACE FUNCTION update_copy_status_on_borrow()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.return_date IS NULL THEN
        UPDATE publication_copy 
        SET status = 'issued_to' 
        WHERE id_copy = NEW.id_copy;
    ELSE
        UPDATE publication_copy 
        SET status = 'on_rack' 
        WHERE id_copy = NEW.id_copy;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_status_on_borrow
AFTER INSERT OR UPDATE ON borrowing
FOR EACH ROW EXECUTE FUNCTION update_copy_status_on_borrow();

-- Function to check user access rights before borrowing
CREATE OR REPLACE FUNCTION check_user_access()
RETURNS TRIGGER AS $$
DECLARE
    has_access BOOLEAN;
BEGIN
    SELECT EXISTS(
        SELECT 1 
        FROM user_access ua
        JOIN publication_copy pc ON ua.id_lab = pc.id_lab
        WHERE ua.email = NEW.email 
        AND pc.id_copy = NEW.id_copy
    ) INTO has_access;
    
    IF NOT has_access THEN
        RAISE EXCEPTION 'User does not have access to borrow from this lab';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_access_before_borrow
BEFORE INSERT ON borrowing
FOR EACH ROW EXECUTE FUNCTION check_user_access();