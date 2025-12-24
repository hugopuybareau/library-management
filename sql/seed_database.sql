SET search_path TO library;

-- Insert Currency Exchange Rates
INSERT INTO currency (code, rate_to_euro) VALUES
('EUR', 1.0000),
('USD', 0.9434),  -- 1 USD = 0.9434 EUR
('GBP', 1.1628);  -- 1 GBP = 1.1628 EUR

-- Insert Publishers
INSERT INTO publisher (name) VALUES
('Pearson Education'),
('O''Reilly Media'),
('MIT Press'),
('Springer'),
('IEEE Press'),
('Elsevier'),
('Wiley'),
('Cambridge University Press'),
('Oxford University Press'),
('McGraw-Hill');

-- Insert Authors
INSERT INTO author (name, email) VALUES
('Andrew Tanenbaum', 'tanenbaum@cs.vu.nl'),
('Martin Fowler', 'mfowler@thoughtworks.com'),
('Donald Knuth', 'knuth@stanford.edu'),
('Bjarne Stroustrup', 'bjarne@research.att.com'),
('Gang of Four', 'gof@patterns.org'),
('Robert C. Martin', 'uncle.bob@cleancoder.com'),
('Steve McConnell', 'stevemcc@construx.com'),
('Thomas Cormen', 'thc@cs.dartmouth.edu'),
('Pierre Dupont', 'pierre.dupont@ec-lyon.fr'),
('Marie Curie', 'marie.curie@ec-lyon.fr'),
('Jean Martin', 'jean.martin@ec-lyon.fr'),
('Sophie Bernard', 'sophie.bernard@ec-lyon.fr'),
('Luc Moreau', 'luc.moreau@ec-lyon.fr'),
('Claire Dubois', 'claire.dubois@ec-lyon.fr');

-- Insert Labs
INSERT INTO lab (name, department) VALUES
('LIRIS', 'Computer Science'),
('AMPERE', 'Electrical Engineering'),
('LTDS', 'Mechanical Engineering'),
('LMFA', 'Fluid Mechanics'),
('INL', 'Nanotechnology'),
('CREATIS', 'Medical Imaging');

-- Insert Bookshops
INSERT INTO bookshop (name, address, phone) VALUES
('Amazon', 'Online', '+1-888-280-4331'),
('FNAC Lyon', '85 Rue de la République, Lyon', '+33-4-72-40-49-49'),
('Decitre', '6 Place Bellecour, Lyon', '+33-4-78-92-92-92'),
('University Bookstore', 'ECL Campus', '+33-4-72-18-60-00'),
('Technical Books Ltd', 'London, UK', '+44-20-7946-0958');

-- Insert Categories
INSERT INTO category (name, description) VALUES
('Computer Science', 'Books about programming, algorithms, and software'),
('Mathematics', 'Mathematical theory and applications'),
('Physics', 'Classical and modern physics'),
('Engineering', 'Various engineering disciplines'),
('Database Systems', 'Database design and management'),
('Operating Systems', 'OS concepts and implementation'),
('Networks', 'Computer networking and protocols'),
('Software Engineering', 'Software development methodologies'),
('Artificial Intelligence', 'AI and machine learning'),
('Algorithms', 'Algorithm design and analysis');

-- Insert Keywords
INSERT INTO keyword (word) VALUES
('database'), ('SQL'), ('programming'), ('algorithms'), ('networks'),
('operating systems'), ('software engineering'), ('machine learning'),
('distributed systems'), ('cloud computing'), ('security'), ('optimization'),
('physics'), ('mathematics'), ('engineering'), ('research'), ('thesis'),
('data structures'), ('python'), ('java'), ('C++'), ('design patterns'),
('agile'), ('microservices'), ('docker'), ('kubernetes');

-- Insert Library Users
INSERT INTO library_user (email, name, hashed_password, phone) VALUES
-- Demo users with known passwords
('admin@ec-lyon.fr', 'Admin User', '$2b$12$12/u8ZYKaexrDnbuBdgAEOCJ6sY.tjDYWl3ptefJxROf63UxV.Hq6', '+33-6-00-00-00-01'),
('manager@ec-lyon.fr', 'Lab Manager', '$2b$12$Pquhe8s969cPcmV6KmPAoOazHNJEj1tRKZjqb2cp9fEAy3m5iINuq', '+33-6-00-00-00-02'),
('user@ec-lyon.fr', 'Regular User', '$2b$12$OELgeD0f5pO7ZTIAHOi7w.aBd29R6Wn4HUBgZUzVNpr1a5R.3/G5.', '+33-6-00-00-00-03'),
-- Additional users
('alice.johnson@ec-lyon.fr', 'Alice Johnson', '$2b$12$OELgeD0f5pO7ZTIAHOi7w.aBd29R6Wn4HUBgZUzVNpr1a5R.3/G5.', '+33-6-12-34-56-78'),
('bob.smith@ec-lyon.fr', 'Bob Smith', '$2b$12$OELgeD0f5pO7ZTIAHOi7w.aBd29R6Wn4HUBgZUzVNpr1a5R.3/G5.', '+33-6-23-45-67-89'),
('carol.white@ec-lyon.fr', 'Carol White', '$2b$12$OELgeD0f5pO7ZTIAHOi7w.aBd29R6Wn4HUBgZUzVNpr1a5R.3/G5.', '+33-6-34-56-78-90'),
('david.brown@ec-lyon.fr', 'David Brown', '$2b$12$OELgeD0f5pO7ZTIAHOi7w.aBd29R6Wn4HUBgZUzVNpr1a5R.3/G5.', '+33-6-45-67-89-01'),
('emma.davis@ec-lyon.fr', 'Emma Davis', '$2b$12$OELgeD0f5pO7ZTIAHOi7w.aBd29R6Wn4HUBgZUzVNpr1a5R.3/G5.', '+33-6-56-78-90-12');

-- Insert Publications

-- Regular Books
INSERT INTO publication (title, year_publication, publication_type, id_publisher, edition) VALUES
('Modern Operating Systems', 2019, 'book', 1, '4th'),
('Design Patterns: Elements of Reusable Object-Oriented Software', 1994, 'book', 1, '1st'),
('Clean Code: A Handbook of Agile Software Craftsmanship', 2008, 'book', 1, '1st'),
('Introduction to Algorithms', 2022, 'book', 2, '4th'),
('The C++ Programming Language', 2013, 'book', 1, '4th'),
('Database System Concepts', 2019, 'book', 9, '7th'),
('Computer Networks', 2021, 'book', 1, '6th'),
('Artificial Intelligence: A Modern Approach', 2020, 'book', 1, '4th'),
('The Art of Computer Programming, Volume 1', 2011, 'book', 1, '3rd'),
('Refactoring: Improving the Design of Existing Code', 2019, 'book', 1, '2nd');

-- Insert into regular_book table
INSERT INTO regular_book (id_publication, isbn) VALUES
(1, '978-0-13-505337-5'),
(2, '978-0-201-63361-0'),
(3, '978-0-13-235088-4'),
(4, '978-0-262-04693-7'),
(5, '978-0-321-56384-2'),
(6, '978-0-07-339881-1'),
(7, '978-0-13-359414-1'),
(8, '978-0-13-461099-3'),
(9, '978-0-201-89683-1'),
(10, '978-0-13-475759-9');

-- Periodics
INSERT INTO publication (title, year_publication, publication_type, id_publisher, edition) VALUES
('IEEE Computer Magazine', 2024, 'periodic', 5, 'Vol. 57'),
('Communications of the ACM', 2024, 'periodic', NULL, 'Vol. 67'),
('IEEE Software', 2024, 'periodic', 5, 'Vol. 41'),
('Journal of Database Management', 2024, 'periodic', NULL, 'Vol. 35');

-- Insert into periodic table
INSERT INTO periodic (id_publication, volume_number) VALUES
(11, '57-1'),
(12, '67-3'),
(13, '41-2'),
(14, '35-4');

-- Internal Reports (Thesis and Scientific Reports)
INSERT INTO publication (title, year_publication, publication_type) VALUES
('Machine Learning Approaches for Network Optimization', 2023, 'thesis'),
('Study on Distributed Database Performance', 2023, 'scientific_report'),
('Quantum Computing Applications in Cryptography', 2024, 'thesis'),
('Analysis of Cloud Computing Security Patterns', 2024, 'scientific_report');

-- Insert into internal_report table
INSERT INTO internal_report (id_publication, identification_number, report_type) VALUES
(15, 'ECL-TH-2023-001', 'thesis'),
(16, 'ECL-SR-2023-047', 'scientific_report'),
(17, 'ECL-TH-2024-003', 'thesis'),
(18, 'ECL-SR-2024-012', 'scientific_report');

-- Associate Authors with Publications
INSERT INTO publication_author (id_publication, id_author, author_order) VALUES
-- Books
(1, 1, 1), -- Tanenbaum - Modern OS
(2, 5, 1), -- Gang of Four - Design Patterns
(3, 6, 1), -- Uncle Bob - Clean Code
(4, 8, 1), -- Cormen - Algorithms
(5, 4, 1), -- Stroustrup - C++
(6, 1, 1), -- Database Systems (multiple authors)
(6, 8, 2),
(7, 1, 1), -- Computer Networks
(8, 8, 1), -- AI: Modern Approach
(8, 4, 2),
(9, 3, 1), -- Knuth - Art of Programming
(10, 2, 1), -- Fowler - Refactoring
-- Thesis (single author)
(15, 9, 1), -- Pierre Dupont
(17, 11, 1), -- Jean Martin
-- Scientific Reports (multiple authors)
(16, 10, 1), -- Marie Curie
(16, 12, 2), -- Sophie Bernard
(18, 13, 1), -- Luc Moreau
(18, 14, 2); -- Claire Dubois

-- Associate Books with Categories
INSERT INTO book_category (id_publication, id_category) VALUES
(1, 6), -- Modern OS -> Operating Systems
(1, 1), -- Modern OS -> Computer Science
(2, 8), -- Design Patterns -> Software Engineering
(2, 1), -- Design Patterns -> Computer Science
(3, 8), -- Clean Code -> Software Engineering
(4, 10), -- Algorithms -> Algorithms
(4, 1), -- Algorithms -> Computer Science
(4, 2), -- Algorithms -> Mathematics
(5, 1), -- C++ -> Computer Science
(6, 5), -- Database Systems -> Database Systems
(6, 1), -- Database Systems -> Computer Science
(7, 7), -- Computer Networks -> Networks
(7, 1), -- Computer Networks -> Computer Science
(8, 9), -- AI -> Artificial Intelligence
(8, 1), -- AI -> Computer Science
(9, 10), -- Art of Programming -> Algorithms
(9, 2), -- Art of Programming -> Mathematics
(10, 8); -- Refactoring -> Software Engineering

-- Associate Publications with Keywords
INSERT INTO publication_keyword (id_publication, id_keyword) VALUES
(1, 6), (1, 9), (1, 11), -- Modern OS
(2, 21), (2, 7), (2, 3), -- Design Patterns
(3, 7), (3, 3), (3, 22), -- Clean Code
(4, 4), (4, 18), (4, 2), -- Algorithms
(5, 20), (5, 3), -- C++
(6, 1), (6, 2), -- Database Systems
(7, 5), (7, 11), -- Computer Networks
(8, 8), (8, 3), -- AI
(9, 4), (9, 18), (9, 14), -- Art of Programming
(10, 7), (10, 22), -- Refactoring
(15, 8), (15, 5), (15, 12), -- ML Thesis
(16, 1), (16, 9), -- Database Report
(17, 11), (17, 13), -- Quantum Thesis
(18, 10), (18, 11); -- Cloud Report

-- Create Publication Copies for different labs
INSERT INTO publication_copy (id_publication, id_lab, id_bookshop, purchase_price, currency, purchase_date, status) VALUES
-- LIRIS Lab copies
(1, 1, 1, 89.99, 'USD', '2023-01-15', 'on_rack'),
(2, 1, 2, 65.00, 'EUR', '2023-02-20', 'issued_to'),
(3, 1, 1, 45.99, 'USD', '2023-03-10', 'on_rack'),
(4, 1, 4, 120.00, 'EUR', '2023-04-05', 'issued_to'),
(5, 1, 1, 79.99, 'USD', '2023-05-12', 'on_rack'),
(6, 1, 3, 95.00, 'EUR', '2023-06-18', 'on_rack'),
(15, 1, NULL, NULL, NULL, '2023-07-01', 'on_rack'),
(16, 1, NULL, NULL, NULL, '2023-08-01', 'on_rack'),

-- AMPERE Lab copies
(1, 2, 2, 75.00, 'EUR', '2023-01-20', 'on_rack'),
(3, 2, 3, 42.00, 'EUR', '2023-02-25', 'issued_to'),
(7, 2, 1, 89.99, 'USD', '2023-03-15', 'on_rack'),
(8, 2, 5, 68.00, 'GBP', '2023-04-10', 'lost'),
(11, 2, NULL, 15.00, 'EUR', '2024-01-10', 'on_rack'),
(17, 2, NULL, NULL, NULL, '2024-01-15', 'on_rack'),

-- LTDS Lab copies
(4, 3, 2, 110.00, 'EUR', '2023-02-15', 'on_rack'),
(5, 3, 3, 72.00, 'EUR', '2023-03-20', 'issued_to'),
(9, 3, 5, 95.00, 'GBP', '2023-04-25', 'on_rack'),
(10, 3, 1, 59.99, 'USD', '2023-05-30', 'on_rack'),
(12, 3, NULL, 20.00, 'EUR', '2024-02-01', 'on_rack'),

-- LMFA Lab copies
(6, 4, 4, 88.00, 'EUR', '2023-03-05', 'on_rack'),
(7, 4, 2, 78.00, 'EUR', '2023-04-12', 'issued_to'),
(8, 4, 1, 105.99, 'USD', '2023-05-18', 'on_rack'),
(13, 4, NULL, 18.00, 'EUR', '2024-03-01', 'on_rack'),
(18, 4, NULL, NULL, NULL, '2024-03-15', 'on_rack'),

-- INL Lab copies
(2, 5, 3, 58.00, 'EUR', '2023-02-10', 'on_rack'),
(3, 5, 2, 40.00, 'EUR', '2023-03-25', 'on_rack'),
(10, 5, 4, 62.00, 'EUR', '2023-06-05', 'issued_to'),
(14, 5, NULL, 25.00, 'EUR', '2024-04-01', 'on_rack'),

-- CREATIS Lab copies
(8, 6, 3, 92.00, 'EUR', '2023-04-20', 'on_rack'),
(9, 6, 1, 125.99, 'USD', '2023-05-25', 'on_rack'),
(11, 6, NULL, 15.00, 'EUR', '2024-01-10', 'on_rack'),
(12, 6, NULL, 20.00, 'EUR', '2024-02-01', 'on_rack');

-- Grant User Access to Labs
INSERT INTO user_access (email, id_lab) VALUES
-- Admin has access to all labs
('admin@ec-lyon.fr', 1),
('admin@ec-lyon.fr', 2),
('admin@ec-lyon.fr', 3),
('admin@ec-lyon.fr', 4),
('admin@ec-lyon.fr', 5),
('admin@ec-lyon.fr', 6),
-- Manager has access to LIRIS, AMPERE, LTDS
('manager@ec-lyon.fr', 1),
('manager@ec-lyon.fr', 2),
('manager@ec-lyon.fr', 3),
-- Regular user has access to LIRIS
('user@ec-lyon.fr', 1),
-- Alice has access to LIRIS and AMPERE
('alice.johnson@ec-lyon.fr', 1),
('alice.johnson@ec-lyon.fr', 2),
-- Bob has access to all labs
('bob.smith@ec-lyon.fr', 1),
('bob.smith@ec-lyon.fr', 2),
('bob.smith@ec-lyon.fr', 3),
('bob.smith@ec-lyon.fr', 4),
('bob.smith@ec-lyon.fr', 5),
('bob.smith@ec-lyon.fr', 6),
-- Carol has access to LIRIS, LTDS, and LMFA
('carol.white@ec-lyon.fr', 1),
('carol.white@ec-lyon.fr', 3),
('carol.white@ec-lyon.fr', 4),
-- David has access to AMPERE and INL
('david.brown@ec-lyon.fr', 2),
('david.brown@ec-lyon.fr', 5),
-- Emma has access to CREATIS
('emma.davis@ec-lyon.fr', 6);

-- Set User Interests
INSERT INTO user_interest (email, id_keyword) VALUES
-- Alice interested in databases and SQL
('alice.johnson@ec-lyon.fr', 1),
('alice.johnson@ec-lyon.fr', 2),
('alice.johnson@ec-lyon.fr', 18),
-- Bob interested in AI and ML
('bob.smith@ec-lyon.fr', 8),
('bob.smith@ec-lyon.fr', 4),
('bob.smith@ec-lyon.fr', 19),
-- Carol interested in networks and security
('carol.white@ec-lyon.fr', 5),
('carol.white@ec-lyon.fr', 11),
('carol.white@ec-lyon.fr', 9),
-- David interested in software engineering
('david.brown@ec-lyon.fr', 7),
('david.brown@ec-lyon.fr', 21),
('david.brown@ec-lyon.fr', 22),
-- Emma interested in research and thesis
('emma.davis@ec-lyon.fr', 16),
('emma.davis@ec-lyon.fr', 17),
('emma.davis@ec-lyon.fr', 14);

-- Create Borrowing Records (for books with status 'issued_to')
INSERT INTO borrowing (id_copy, email, borrow_date, due_date, return_date) VALUES
-- Copy 2 (Design Patterns from LIRIS) borrowed by Alice
(2, 'alice.johnson@ec-lyon.fr', '2024-10-01', '2024-10-15', NULL),
-- Copy 4 (Algorithms from LIRIS) borrowed by Bob
(4, 'bob.smith@ec-lyon.fr', '2024-10-05', '2024-10-19', NULL),
-- Copy 10 (Clean Code from AMPERE) borrowed by David
(10, 'david.brown@ec-lyon.fr', '2024-10-03', '2024-10-17', NULL),
-- Copy 20 (Computer Networks from LMFA) borrowed by Carol
(20, 'carol.white@ec-lyon.fr', '2024-10-02', '2024-10-16', NULL);

-- Some historical borrowings (returned)
INSERT INTO borrowing (id_copy, email, borrow_date, due_date, return_date) VALUES
(1, 'alice.johnson@ec-lyon.fr', '2024-09-01', '2024-09-15', '2024-09-14'),
(3, 'bob.smith@ec-lyon.fr', '2024-09-05', '2024-09-19', '2024-09-18'),
(5, 'carol.white@ec-lyon.fr', '2024-09-10', '2024-09-24', '2024-09-23');

-- Proposed Publications
INSERT INTO proposed_publication (email, title, publication_type, details, date_proposal, status) VALUES
('alice.johnson@ec-lyon.fr', 'NoSQL Databases: Theory and Practice', 'book', 
 '{"authors": ["Pramod J. Sadalage", "Martin Fowler"], "isbn": "978-0321826626", "publisher": "Addison-Wesley", "year": 2024}', 
 '2024-09-15', 'approved'),
('bob.smith@ec-lyon.fr', 'Deep Learning', 'book', 
 '{"authors": ["Ian Goodfellow", "Yoshua Bengio", "Aaron Courville"], "isbn": "978-0262035613", "publisher": "MIT Press", "year": 2023}', 
 '2024-09-20', 'pending'),
('carol.white@ec-lyon.fr', 'Network Security Essentials', 'book', 
 '{"authors": ["William Stallings"], "isbn": "978-0134527178", "publisher": "Pearson", "year": 2024}', 
 '2024-09-25', 'ordered');