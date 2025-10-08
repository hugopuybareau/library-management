-- Library Database Queries
-- 9 required queries for the library system

SET search_path TO library;

-- Query 1: List all publications registered in the library system (no duplicates)
-- Shows unique publications regardless of which labs own them
CREATE OR REPLACE VIEW all_unique_publications AS
SELECT DISTINCT
    p.id_publication,
    p.title,
    p.year_publication,
    p.publication_type,
    p.edition,
    pub.name AS publisher_name,
    CASE
        WHEN p.publication_type = 'book' THEN rb.isbn
        WHEN p.publication_type = 'periodic' THEN per.volume_number
        WHEN p.publication_type IN ('thesis', 'scientific_report') THEN ir.identification_number
    END AS identifier,
    STRING_AGG(DISTINCT a.name, ', ' ORDER BY a.name) AS authors
FROM publication p
LEFT JOIN publisher pub ON p.id_publisher = pub.id_publisher
LEFT JOIN regular_book rb ON p.id_publication = rb.id_publication
LEFT JOIN periodic per ON p.id_publication = per.id_publication
LEFT JOIN internal_report ir ON p.id_publication = ir.id_publication
LEFT JOIN publication_author pa ON p.id_publication = pa.id_publication
LEFT JOIN author a ON pa.id_author = a.id_author
GROUP BY p.id_publication, p.title, p.year_publication, p.publication_type, 
         p.edition, pub.name, rb.isbn, per.volume_number, ir.identification_number
ORDER BY p.title;

-- Test Query 1
SELECT * FROM all_unique_publications;

-- Query 2: For a given user, list all publications issued to them
-- Function that takes user email and optional lab id
CREATE OR REPLACE FUNCTION get_user_borrowed_publications(
    p_user_email VARCHAR(255),
    p_lab_id INTEGER DEFAULT NULL
)
RETURNS TABLE (
    publication_id INTEGER,
    title VARCHAR(500),
    publication_type publication_type,
    lab_name VARCHAR(100),
    borrow_date DATE,
    due_date DATE,
    identifier VARCHAR(100)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id_publication,
        p.title,
        p.publication_type,
        l.name AS lab_name,
        b.borrow_date,
        b.due_date,
        COALESCE(rb.isbn, per.volume_number, ir.identification_number) AS identifier
    FROM borrowing b
    JOIN publication_copy pc ON b.id_copy = pc.id_copy
    JOIN publication p ON pc.id_publication = p.id_publication
    JOIN lab l ON pc.id_lab = l.id_lab
    LEFT JOIN regular_book rb ON p.id_publication = rb.id_publication
    LEFT JOIN periodic per ON p.id_publication = per.id_publication
    LEFT JOIN internal_report ir ON p.id_publication = ir.id_publication
    WHERE b.email = p_user_email 
    AND b.return_date IS NULL
    AND (p_lab_id IS NULL OR pc.id_lab = p_lab_id);
END;
$$ LANGUAGE plpgsql;

-- Test Query 2
SELECT * FROM get_user_borrowed_publications('alice.johnson@ec-lyon.fr');
SELECT * FROM get_user_borrowed_publications('alice.johnson@ec-lyon.fr', 1);

-- Query 3: Evaluate the price of all publications owned by a particular lab in EUR
CREATE OR REPLACE FUNCTION get_lab_total_value_in_euro(p_lab_id INTEGER)
RETURNS TABLE (
    lab_name VARCHAR(100),
    total_value_euro DECIMAL(10, 2),
    number_of_publications BIGINT,
    breakdown JSONB
) AS $$
BEGIN
    RETURN QUERY
    WITH converted_prices AS (
        SELECT 
            pc.id_copy,
            pc.id_publication,
            p.title,
            pc.purchase_price,
            pc.currency,
            CASE 
                WHEN pc.purchase_price IS NULL THEN 0
                ELSE pc.purchase_price * c.rate_to_euro
            END AS price_in_euro
        FROM publication_copy pc
        LEFT JOIN currency c ON pc.currency = c.code
        JOIN publication p ON pc.id_publication = p.id_publication
        WHERE pc.id_lab = p_lab_id
    )
    SELECT 
        l.name AS lab_name,
        ROUND(SUM(cp.price_in_euro), 2) AS total_value_euro,
        COUNT(*) AS number_of_publications,
        JSONB_AGG(
            JSONB_BUILD_OBJECT(
                'title', cp.title,
                'original_price', cp.purchase_price,
                'currency', cp.currency,
                'price_in_euro', ROUND(cp.price_in_euro, 2)
            ) ORDER BY cp.price_in_euro DESC
        ) AS breakdown
    FROM converted_prices cp
    CROSS JOIN lab l
    WHERE l.id_lab = p_lab_id
    GROUP BY l.name;
END;
$$ LANGUAGE plpgsql;

-- Test Query 3
SELECT * FROM get_lab_total_value_in_euro(1);

-- Query 4: Check if a user can borrow a particular publication
CREATE OR REPLACE FUNCTION can_user_borrow_publication(
    p_user_email VARCHAR(255),
    p_publication_id INTEGER
)
RETURNS TABLE (
    can_borrow BOOLEAN,
    reason TEXT,
    available_copies JSONB
) AS $$
DECLARE
    v_has_access BOOLEAN;
    v_available_count INTEGER;
BEGIN
    -- Check if user has access to any lab that owns this publication
    SELECT EXISTS(
        SELECT 1
        FROM user_access ua
        JOIN publication_copy pc ON ua.id_lab = pc.id_lab
        WHERE ua.email = p_user_email
        AND pc.id_publication = p_publication_id
    ) INTO v_has_access;
    
    -- Count available copies the user has access to
    SELECT COUNT(*)
    FROM publication_copy pc
    JOIN user_access ua ON pc.id_lab = ua.id_lab
    WHERE pc.id_publication = p_publication_id
    AND ua.email = p_user_email
    AND pc.status = 'on_rack'
    INTO v_available_count;
    
    RETURN QUERY
    SELECT 
        (v_has_access AND v_available_count > 0) AS can_borrow,
        CASE 
            WHEN NOT v_has_access THEN 'User does not have access to any lab owning this publication'
            WHEN v_available_count = 0 THEN 'No available copies in accessible labs'
            ELSE 'Can borrow - ' || v_available_count || ' copy(ies) available'
        END AS reason,
        (
            SELECT JSONB_AGG(
                JSONB_BUILD_OBJECT(
                    'lab', l.name,
                    'status', pc.status,
                    'has_access', EXISTS(SELECT 1 FROM user_access WHERE email = p_user_email AND id_lab = pc.id_lab)
                )
            )
            FROM publication_copy pc
            JOIN lab l ON pc.id_lab = l.id_lab
            WHERE pc.id_publication = p_publication_id
        ) AS available_copies;
END;
$$ LANGUAGE plpgsql;

-- Test Query 4
SELECT * FROM can_user_borrow_publication('alice.johnson@ec-lyon.fr', 1);

-- Query 5: Find who borrowed a publication that a user wants but can't get
CREATE OR REPLACE FUNCTION find_current_borrowers(
    p_user_email VARCHAR(255),
    p_publication_id INTEGER
)
RETURNS TABLE (
    borrower_email VARCHAR(255),
    borrower_name VARCHAR(255),
    lab_name VARCHAR(100),
    borrow_date DATE,
    due_date DATE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.email AS borrower_email,
        lu.name AS borrower_name,
        l.name AS lab_name,
        b.borrow_date,
        b.due_date
    FROM borrowing b
    JOIN publication_copy pc ON b.id_copy = pc.id_copy
    JOIN lab l ON pc.id_lab = l.id_lab
    JOIN library_user lu ON b.email = lu.email
    WHERE pc.id_publication = p_publication_id
    AND b.return_date IS NULL
    AND pc.id_lab IN (
        -- Only show borrowers from labs the requesting user has access to
        SELECT ua.id_lab 
        FROM user_access ua 
        WHERE ua.email = p_user_email
    )
    ORDER BY b.due_date;
END;
$$ LANGUAGE plpgsql;

-- Test Query 5
SELECT * FROM find_current_borrowers('carol.white@ec-lyon.fr', 4);

-- Query 6: List publications by category and max price
CREATE OR REPLACE FUNCTION get_publications_by_category_and_price(
    p_category_name VARCHAR(100),
    p_max_price_euro DECIMAL
)
RETURNS TABLE (
    publication_id INTEGER,
    title VARCHAR(500),
    isbn VARCHAR(20),
    min_price_euro DECIMAL,
    publishers VARCHAR,
    categories VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id_publication,
        p.title,
        rb.isbn,
        MIN(pc.purchase_price * c.rate_to_euro) AS min_price_euro,
        STRING_AGG(DISTINCT pub.name, ', ') AS publishers,
        STRING_AGG(DISTINCT cat.name, ', ') AS categories
    FROM publication p
    JOIN regular_book rb ON p.id_publication = rb.id_publication
    JOIN book_category bc ON rb.id_publication = bc.id_publication
    JOIN category cat ON bc.id_category = cat.id_category
    JOIN publication_copy pc ON p.id_publication = pc.id_publication
    LEFT JOIN currency c ON pc.currency = c.code
    LEFT JOIN publisher pub ON p.id_publisher = pub.id_publisher
    WHERE cat.name = p_category_name
    AND pc.purchase_price IS NOT NULL
    GROUP BY p.id_publication, p.title, rb.isbn
    HAVING MIN(pc.purchase_price * c.rate_to_euro) <= p_max_price_euro
    ORDER BY min_price_euro;
END;
$$ LANGUAGE plpgsql;

-- Test Query 6
SELECT * FROM get_publications_by_category_and_price('Computer Science', 100);

-- Query 7: List publications by author and year
CREATE OR REPLACE FUNCTION get_publications_by_author_after_year(
    p_author_name VARCHAR(255),
    p_year INTEGER
)
RETURNS TABLE (
    publication_id INTEGER,
    title VARCHAR(500),
    year_publication INTEGER,
    publication_type publication_type,
    all_authors VARCHAR,
    publisher VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id_publication,
        p.title,
        p.year_publication,
        p.publication_type,
        STRING_AGG(a.name, ', ' ORDER BY pa.author_order) AS all_authors,
        pub.name AS publisher
    FROM publication p
    JOIN publication_author pa ON p.id_publication = pa.id_publication
    JOIN author a ON pa.id_author = a.id_author
    LEFT JOIN publisher pub ON p.id_publisher = pub.id_publisher
    WHERE p.id_publication IN (
        SELECT DISTINCT pa2.id_publication
        FROM publication_author pa2
        JOIN author a2 ON pa2.id_author = a2.id_author
        WHERE LOWER(a2.name) LIKE LOWER('%' || p_author_name || '%')
    )
    AND p.year_publication > p_year
    GROUP BY p.id_publication, p.title, p.year_publication, p.publication_type, pub.name
    ORDER BY p.year_publication;
END;
$$ LANGUAGE plpgsql;

-- Test Query 7
SELECT * FROM get_publications_by_author_after_year('Tanenbaum', 2015);

-- Query 8: Chronological list of books by publisher
CREATE OR REPLACE FUNCTION get_publisher_books_chronological(p_publisher_name VARCHAR(255))
RETURNS TABLE (
    year INTEGER,
    title VARCHAR(500),
    isbn VARCHAR(20),
    authors VARCHAR,
    edition VARCHAR(50)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.year_publication AS year,
        p.title,
        rb.isbn,
        STRING_AGG(a.name, ', ' ORDER BY pa.author_order) AS authors,
        p.edition
    FROM publication p
    JOIN publisher pub ON p.id_publisher = pub.id_publisher
    JOIN regular_book rb ON p.id_publication = rb.id_publication
    LEFT JOIN publication_author pa ON p.id_publication = pa.id_publication
    LEFT JOIN author a ON pa.id_author = a.id_author
    WHERE LOWER(pub.name) LIKE LOWER('%' || p_publisher_name || '%')
    GROUP BY p.year_publication, p.title, rb.isbn, p.edition, p.id_publication
    ORDER BY p.year_publication, p.title;
END;
$$ LANGUAGE plpgsql;

-- Test Query 8
SELECT * FROM get_publisher_books_chronological('Pearson');

-- Query 9: List all lost regular books with details
CREATE OR REPLACE VIEW lost_books_report AS
SELECT 
    l.name AS owner_lab,
    rb.isbn,
    p.title,
    pub.name AS publisher,
    ROUND(pc.purchase_price * c.rate_to_euro, 2) AS price_euro,
    pc.purchase_price AS original_price,
    pc.currency AS original_currency,
    pc.purchase_date
FROM publication_copy pc
JOIN publication p ON pc.id_publication = p.id_publication
JOIN regular_book rb ON p.id_publication = rb.id_publication
JOIN lab l ON pc.id_lab = l.id_lab
LEFT JOIN publisher pub ON p.id_publisher = pub.id_publisher
LEFT JOIN currency c ON pc.currency = c.code
WHERE pc.status = 'lost'
ORDER BY l.name, rb.isbn;

-- Test Query 9
SELECT * FROM lost_books_report;

-- Additional useful queries for the application

-- Get recently added publications (last 30 days)
CREATE OR REPLACE VIEW recent_publications AS
SELECT 
    p.id_publication,
    p.title,
    p.publication_type,
    p.created_at,
    l.name AS lab_name
FROM publication p
JOIN publication_copy pc ON p.id_publication = pc.id_publication
JOIN lab l ON pc.id_lab = l.id_lab
WHERE p.created_at >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY p.created_at DESC;

-- Get overdue borrowings
CREATE OR REPLACE VIEW overdue_borrowings AS
SELECT 
    lu.email,
    lu.name AS user_name,
    p.title,
    l.name AS lab_name,
    b.borrow_date,
    b.due_date,
    CURRENT_DATE - b.due_date AS days_overdue
FROM borrowing b
JOIN publication_copy pc ON b.id_copy = pc.id_copy
JOIN publication p ON pc.id_publication = p.id_publication
JOIN lab l ON pc.id_lab = l.id_lab
JOIN library_user lu ON b.email = lu.email
WHERE b.return_date IS NULL
AND b.due_date < CURRENT_DATE
ORDER BY days_overdue DESC;

-- Statistics view for dashboard
CREATE OR REPLACE VIEW library_statistics AS
SELECT 
    (SELECT COUNT(*) FROM publication) AS total_publications,
    (SELECT COUNT(*) FROM publication_copy) AS total_copies,
    (SELECT COUNT(*) FROM publication_copy WHERE status = 'on_rack') AS available_copies,
    (SELECT COUNT(*) FROM publication_copy WHERE status = 'issued_to') AS borrowed_copies,
    (SELECT COUNT(*) FROM publication_copy WHERE status = 'lost') AS lost_copies,
    (SELECT COUNT(*) FROM library_user WHERE active = true) AS active_users,
    (SELECT COUNT(*) FROM borrowing WHERE return_date IS NULL) AS active_borrowings,
    (SELECT COUNT(*) FROM proposed_publication WHERE status = 'pending') AS pending_proposals;