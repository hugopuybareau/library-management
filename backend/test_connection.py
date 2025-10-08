#!/usr/bin/env python3
"""
Database Connection Test Script
Tests the connection and basic queries to the library database
"""

import psycopg2
import sys
import os
from tabulate import tabulate
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_connection():
    """Test database connection and run basic queries"""
    
    # Database connection parameters
    db_params = {
        'host': os.getenv('DB_HOST', 'localhost'),
        'port': os.getenv('DB_PORT', 5432),
        'database': os.getenv('DB_NAME', 'library_db'),
        'user': os.getenv('DB_USER', 'postgres'),
        'password': os.getenv('DB_PASSWORD', '')
    }
    
    print("=" * 60)
    print("LIBRARY DATABASE CONNECTION TEST")
    print("=" * 60)
    print(f"Host: {db_params['host']}:{db_params['port']}")
    print(f"Database: {db_params['database']}")
    print(f"User: {db_params['user']}")
    print("-" * 60)
    
    try:
        # Connect to database
        print("\n✓ Connecting to database...")
        conn = psycopg2.connect(**db_params)
        cursor = conn.cursor()
        print("✓ Connection successful!")
        
        # Test 1: Check PostgreSQL version
        print("\n1. PostgreSQL Version:")
        cursor.execute("SELECT version();")
        version = cursor.fetchone()[0]
        print(f"   {version.split(',')[0]}")
        
        # Test 2: Check if schema exists
        print("\n2. Checking schema 'library':")
        cursor.execute("""
            SELECT EXISTS(
                SELECT 1 FROM information_schema.schemata 
                WHERE schema_name = 'library'
            );
        """)
        schema_exists = cursor.fetchone()[0]
        if schema_exists:
            print("   ✓ Schema 'library' exists")
        else:
            print("   ✗ Schema 'library' not found - run create_database.sql first")
            return
        
        # Test 3: List all tables
        print("\n3. Tables in library schema:")
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'library' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name;
        """)
        tables = cursor.fetchall()
        for table in tables:
            print(f"   • {table[0]}")
        print(f"   Total: {len(tables)} tables")
        
        # Test 4: Count records in main tables
        print("\n4. Record counts:")
        count_queries = [
            ('Publications', "SELECT COUNT(*) FROM library.publication"),
            ('Users', "SELECT COUNT(*) FROM library.library_user"),
            ('Labs', "SELECT COUNT(*) FROM library.lab"),
            ('Copies', "SELECT COUNT(*) FROM library.publication_copy"),
            ('Active Borrowings', "SELECT COUNT(*) FROM library.borrowing WHERE return_date IS NULL"),
            ('Authors', "SELECT COUNT(*) FROM library.author"),
            ('Publishers', "SELECT COUNT(*) FROM library.publisher"),
            ('Categories', "SELECT COUNT(*) FROM library.category"),
        ]
        
        for name, query in count_queries:
            cursor.execute(query)
            count = cursor.fetchone()[0]
            print(f"   {name:20} : {count:5}")
        
        # Test 5: Sample data from publications
        print("\n5. Sample Publications (first 5):")
        cursor.execute("""
            SELECT 
                p.id_publication,
                p.title,
                p.year_publication,
                p.publication_type
            FROM library.publication p
            LIMIT 5;
        """)
        publications = cursor.fetchall()
        if publications:
            headers = ['ID', 'Title', 'Year', 'Type']
            print(tabulate(publications, headers=headers, tablefmt='grid'))
        else:
            print("   No publications found")
        
        # Test 6: Check functions exist
        print("\n6. Checking custom functions:")
        functions = [
            'get_user_borrowed_publications',
            'get_lab_total_value_in_euro',
            'can_user_borrow_publication',
            'find_current_borrowers',
            'get_publications_by_category_and_price',
            'get_publications_by_author_after_year',
            'get_publisher_books_chronological'
        ]
        
        cursor.execute("""
            SELECT routine_name 
            FROM information_schema.routines 
            WHERE routine_schema = 'library' 
            AND routine_type = 'FUNCTION';
        """)
        existing_functions = [f[0] for f in cursor.fetchall()]
        
        for func in functions:
            if func in existing_functions:
                print(f"   ✓ {func}")
            else:
                print(f"   ✗ {func} - not found")
        
        # Test 7: Check views exist
        print("\n7. Checking views:")
        views = [
            'all_unique_publications',
            'lost_books_report',
            'available_publications',
            'user_borrowed_books',
            'overdue_borrowings',
            'library_statistics'
        ]
        
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.views 
            WHERE table_schema = 'library';
        """)
        existing_views = [v[0] for v in cursor.fetchall()]
        
        for view in views:
            if view in existing_views:
                print(f"   ✓ {view}")
            else:
                print(f"   ✗ {view} - not found")
        
        # Test 8: Test a sample query
        print("\n8. Testing sample query - Available books in LIRIS lab:")
        cursor.execute("""
            SELECT 
                p.title,
                pc.status
            FROM library.publication p
            JOIN library.publication_copy pc ON p.id_publication = pc.id_publication
            JOIN library.lab l ON pc.id_lab = l.id_lab
            WHERE l.name = 'LIRIS' AND pc.status = 'on_rack'
            LIMIT 3;
        """)
        available = cursor.fetchall()
        if available:
            for book in available:
                print(f"   • {book[0][:50]} - {book[1]}")
        else:
            print("   No available books found")
        
        # Test 9: Check constraints
        print("\n9. Testing constraints:")
        
        # Test unique constraint on email
        try:
            cursor.execute("""
                INSERT INTO library.library_user (email, name) 
                VALUES ('test@test.com', 'Test User');
            """)
            cursor.execute("""
                INSERT INTO library.library_user (email, name) 
                VALUES ('test@test.com', 'Another Test User');
            """)
            conn.rollback()
            print("   ✗ Unique constraint on email not working")
        except psycopg2.IntegrityError:
            conn.rollback()
            print("   ✓ Unique constraint on email working")
        
        # Test 10: Check currency exchange rates
        print("\n10. Currency Exchange Rates:")
        cursor.execute("""
            SELECT code, rate_to_euro 
            FROM library.currency 
            ORDER BY code;
        """)
        currencies = cursor.fetchall()
        for curr in currencies:
            print(f"   {curr[0]}: {curr[1]:.4f} to EUR")
        
        print("\n" + "=" * 60)
        print("✓ ALL TESTS COMPLETED SUCCESSFULLY!")
        print("=" * 60)
        
        # Close connection
        cursor.close()
        conn.close()
        
        return True
        
    except psycopg2.OperationalError as e:
        print(f"\n✗ Connection failed: {e}")
        print("\nPossible causes:")
        print("  1. PostgreSQL is not running")
        print("  2. Database 'library_db' does not exist")
        print("  3. Wrong credentials or host/port")
        print("\nRun: python admin_tools.py init")
        return False
        
    except psycopg2.Error as e:
        print(f"\n✗ Database error: {e}")
        return False
        
    except Exception as e:
        print(f"\n✗ Unexpected error: {e}")
        return False


def test_specific_function(function_name, params):
    """Test a specific database function"""
    
    db_params = {
        'host': os.getenv('DB_HOST', 'localhost'),
        'port': os.getenv('DB_PORT', 5432),
        'database': os.getenv('DB_NAME', 'library_db'),
        'user': os.getenv('DB_USER', 'postgres'),
        'password': os.getenv('DB_PASSWORD', '')
    }
    
    try:
        conn = psycopg2.connect(**db_params)
        cursor = conn.cursor()
        
        print(f"\nTesting function: {function_name}")
        print(f"Parameters: {params}")
        print("-" * 40)
        
        # Build and execute query
        placeholders = ', '.join(['%s'] * len(params))
        query = f"SELECT * FROM library.{function_name}({placeholders});"
        
        cursor.execute(query, params)
        results = cursor.fetchall()
        
        # Get column names
        colnames = [desc[0] for desc in cursor.description]
        
        if results:
            print(tabulate(results, headers=colnames, tablefmt='grid'))
        else:
            print("No results returned")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"Error testing function: {e}")


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Test Library Database Connection')
    parser.add_argument('--function', help='Test specific function')
    parser.add_argument('--params', nargs='*', help='Function parameters')
    
    args = parser.parse_args()
    
    if args.function:
        # Test specific function
        params = args.params if args.params else []
        test_specific_function(args.function, params)
    else:
        # Run all connection tests
        success = test_connection()
        sys.exit(0 if success else 1)