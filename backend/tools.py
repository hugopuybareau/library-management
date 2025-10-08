import psycopg2
from psycopg2 import sql
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from datetime import datetime, timedelta
import os
from typing import Dict
import argparse
import sys

class LibraryDatabaseAdmin:
    """Administration tools for the library database"""
    
    def __init__(self, host='localhost', port=5432, user='postgres', password=''):
        """Initialize database connection parameters"""
        self.host = host
        self.port = port
        self.user = user
        self.password = password
        self.db_name = 'library_db'
        self.conn = None
        self.cursor = None
    
    def create_database(self):
        """Create the library database if it doesn't exist"""
        try:
            # Connect to PostgreSQL server
            conn = psycopg2.connect(
                host=self.host,
                port=self.port,
                user=self.user,
                password=self.password,
                database='postgres'
            )
            conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
            cursor = conn.cursor()
            
            # Check if database exists
            cursor.execute(
                "SELECT 1 FROM pg_database WHERE datname = %s",
                (self.db_name,)
            )
            exists = cursor.fetchone()
            
            if not exists:
                cursor.execute(
                    sql.SQL("CREATE DATABASE {}").format(
                        sql.Identifier(self.db_name)
                    )
                )
                print(f"Database '{self.db_name}' created successfully")
            else:
                print(f"Database '{self.db_name}' already exists")
            
            cursor.close()
            conn.close()
            
        except psycopg2.Error as e:
            print(f"Error creating database: {e}")
            sys.exit(1)
    
    def connect(self):
        """Connect to the library database"""
        try:
            self.conn = psycopg2.connect(
                host=self.host,
                port=self.port,
                user=self.user,
                password=self.password,
                database=self.db_name
            )
            self.cursor = self.conn.cursor()
            print(f"Connected to database '{self.db_name}'")
        except psycopg2.Error as e:
            print(f"Error connecting to database: {e}")
            sys.exit(1)
    
    def disconnect(self):
        """Disconnect from the database"""
        if self.cursor:
            self.cursor.close()
        if self.conn:
            self.conn.close()
        print("Disconnected from database")
    
    def execute_sql_file(self, filename: str):
        """Execute SQL commands from a file"""
        try:
            with open(filename, 'r', encoding='utf-8') as f:
                sql_commands = f.read()
            
            self.cursor.execute(sql_commands)
            self.conn.commit()
            print(f"Successfully executed {filename}")
            
        except FileNotFoundError:
            print(f"File {filename} not found")
        except psycopg2.Error as e:
            self.conn.rollback()
            print(f"Error executing {filename}: {e}")
    
    def init_database(self):
        """Initialize the database with schema and seed data"""
        print("Initializing database schema...")
        self.execute_sql_file('create_database.sql')
        
        print("Seeding database with sample data...")
        self.execute_sql_file('seed_database.sql')
        
        print("Creating queries and functions...")
        self.execute_sql_file('queries.sql')
        
        print("Database initialization complete!")
    
    def backup_database(self, backup_file: str = None):
        """Create a backup of the database"""
        if not backup_file:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            backup_file = f'library_backup_{timestamp}.sql'
        
        try:
            os.system(
                f'pg_dump -h {self.host} -p {self.port} -U {self.user} '
                f'-d {self.db_name} -f {backup_file}'
            )
            print(f"Database backed up to {backup_file}")
        except Exception as e:
            print(f"Error creating backup: {e}")
    
    def restore_database(self, backup_file: str):
        """Restore database from a backup file"""
        if not os.path.exists(backup_file):
            print(f"Backup file {backup_file} not found")
            return
        
        try:
            # Drop and recreate the database
            self.disconnect()
            self.create_database()
            
            # Restore from backup
            os.system(
                f'psql -h {self.host} -p {self.port} -U {self.user} '
                f'-d {self.db_name} -f {backup_file}'
            )
            print(f"Database restored from {backup_file}")
            
            # Reconnect
            self.connect()
        except Exception as e:
            print(f"Error restoring database: {e}")
    
    def get_statistics(self) -> Dict:
        """Get database statistics"""
        stats = {}
        
        queries = {
            'total_publications': "SELECT COUNT(*) FROM library.publication",
            'total_copies': "SELECT COUNT(*) FROM library.publication_copy",
            'available_copies': "SELECT COUNT(*) FROM library.publication_copy WHERE status = 'on_rack'",
            'borrowed_copies': "SELECT COUNT(*) FROM library.publication_copy WHERE status = 'issued_to'",
            'lost_copies': "SELECT COUNT(*) FROM library.publication_copy WHERE status = 'lost'",
            'total_users': "SELECT COUNT(*) FROM library.library_user",
            'active_borrowings': "SELECT COUNT(*) FROM library.borrowing WHERE return_date IS NULL",
            'total_labs': "SELECT COUNT(*) FROM library.lab",
            'pending_proposals': "SELECT COUNT(*) FROM library.proposed_publication WHERE status = 'pending'"
        }
        
        for key, query in queries.items():
            self.cursor.execute(query)
            stats[key] = self.cursor.fetchone()[0]
        
        return stats
    
    def print_statistics(self):
        """Print database statistics"""
        stats = self.get_statistics()
        
        print("\n" + "="*50)
        print("LIBRARY DATABASE STATISTICS")
        print("="*50)
        print(f"Total Publications:    {stats['total_publications']:>10}")
        print(f"Total Copies:         {stats['total_copies']:>10}")
        print(f"  - Available:        {stats['available_copies']:>10}")
        print(f"  - Borrowed:         {stats['borrowed_copies']:>10}")
        print(f"  - Lost:             {stats['lost_copies']:>10}")
        print(f"Total Users:          {stats['total_users']:>10}")
        print(f"Active Borrowings:    {stats['active_borrowings']:>10}")
        print(f"Total Labs:           {stats['total_labs']:>10}")
        print(f"Pending Proposals:    {stats['pending_proposals']:>10}")
        print("="*50 + "\n")
    
    def add_test_borrowings(self, count: int = 5):
        """Add random test borrowings"""
        try:
            # Get available copies and users with access
            self.cursor.execute("""
                SELECT pc.id_copy, lu.email
                FROM library.publication_copy pc
                JOIN library.user_access ua ON pc.id_lab = ua.id_lab
                JOIN library.library_user lu ON ua.email = lu.email
                WHERE pc.status = 'on_rack'
                ORDER BY RANDOM()
                LIMIT %s
            """, (count,))
            
            available = self.cursor.fetchall()
            
            for id_copy, email in available:
                borrow_date = datetime.now().date()
                due_date = borrow_date + timedelta(days=14)
                
                self.cursor.execute("""
                    INSERT INTO library.borrowing (id_copy, email, borrow_date, due_date)
                    VALUES (%s, %s, %s, %s)
                """, (id_copy, email, borrow_date, due_date))
            
            self.conn.commit()
            print(f"Added {len(available)} test borrowings")
            
        except psycopg2.Error as e:
            self.conn.rollback()
            print(f"Error adding test borrowings: {e}")
    
    def return_book(self, borrowing_id: int):
        """Return a borrowed book"""
        try:
            self.cursor.execute("""
                UPDATE library.borrowing
                SET return_date = CURRENT_DATE
                WHERE id_borrowing = %s AND return_date IS NULL
            """, (borrowing_id,))
            
            if self.cursor.rowcount > 0:
                self.conn.commit()
                print(f"Book returned (borrowing ID: {borrowing_id})")
            else:
                print(f"No active borrowing found with ID {borrowing_id}")
                
        except psycopg2.Error as e:
            self.conn.rollback()
            print(f"Error returning book: {e}")
    
    def list_overdue_books(self):
        """List all overdue borrowings"""
        self.cursor.execute("""
            SELECT 
                b.id_borrowing,
                lu.email,
                lu.name,
                p.title,
                b.due_date,
                CURRENT_DATE - b.due_date AS days_overdue
            FROM library.borrowing b
            JOIN library.publication_copy pc ON b.id_copy = pc.id_copy
            JOIN library.publication p ON pc.id_publication = p.id_publication
            JOIN library.library_user lu ON b.email = lu.email
            WHERE b.return_date IS NULL AND b.due_date < CURRENT_DATE
            ORDER BY days_overdue DESC
        """)
        
        overdues = self.cursor.fetchall()
        
        if overdues:
            print("\n" + "="*80)
            print("OVERDUE BOOKS")
            print("="*80)
            print(f"{'ID':<5} {'User':<30} {'Title':<30} {'Days Overdue':<10}")
            print("-"*80)
            for row in overdues:
                print(f"{row[0]:<5} {row[2][:28]:<30} {row[3][:28]:<30} {row[5]:<10}")
            print("="*80 + "\n")
        else:
            print("No overdue books found")


def main():
    """Main function to handle command line arguments"""
    parser = argparse.ArgumentParser(description='Library Database Administration Tool')
    parser.add_argument('--host', default='localhost', help='Database host')
    parser.add_argument('--port', default=5432, type=int, help='Database port')
    parser.add_argument('--user', default='postgres', help='Database user')
    parser.add_argument('--password', default='', help='Database password')
    
    subparsers = parser.add_subparsers(dest='command', help='Commands')
    
    # Commands
    subparsers.add_parser('create', help='Create the database')
    subparsers.add_parser('init', help='Initialize database with schema and data')
    subparsers.add_parser('stats', help='Show database statistics')
    subparsers.add_parser('overdue', help='List overdue books')
    
    backup_parser = subparsers.add_parser('backup', help='Backup the database')
    backup_parser.add_argument('--file', help='Backup file name')
    
    restore_parser = subparsers.add_parser('restore', help='Restore from backup')
    restore_parser.add_argument('file', help='Backup file to restore')
    
    borrow_parser = subparsers.add_parser('test-borrow', help='Add test borrowings')
    borrow_parser.add_argument('--count', type=int, default=5, help='Number of borrowings')
    
    return_parser = subparsers.add_parser('return', help='Return a book')
    return_parser.add_argument('id', type=int, help='Borrowing ID')
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return
    
    # Create admin instance
    admin = LibraryDatabaseAdmin(
        host=args.host,
        port=args.port,
        user=args.user,
        password=args.password
    )
    
    # Execute command
    if args.command == 'create':
        admin.create_database()
    
    elif args.command == 'init':
        admin.create_database()
        admin.connect()
        admin.init_database()
        admin.print_statistics()
        admin.disconnect()
    
    elif args.command == 'stats':
        admin.connect()
        admin.print_statistics()
        admin.disconnect()
    
    elif args.command == 'overdue':
        admin.connect()
        admin.list_overdue_books()
        admin.disconnect()
    
    elif args.command == 'backup':
        admin.connect()
        admin.backup_database(args.file)
        admin.disconnect()
    
    elif args.command == 'restore':
        admin.restore_database(args.file)
    
    elif args.command == 'test-borrow':
        admin.connect()
        admin.add_test_borrowings(args.count)
        admin.disconnect()
    
    elif args.command == 'return':
        admin.connect()
        admin.return_book(args.id)
        admin.disconnect()


if __name__ == '__main__':
    main()