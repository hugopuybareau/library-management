#!/bin/bash
# Reset and recreate the library database

echo "🗑️  Dropping existing database..."
psql -h localhost -U postgres -c "DROP DATABASE IF EXISTS library_db;"

echo "📦 Creating new database..."
psql -h localhost -U postgres -c "CREATE DATABASE library_db;"

echo "🏗️  Creating schema..."
psql -h localhost -U postgres -d library_db -f sql/create_database.sql

echo "🌱 Seeding database..."
psql -h localhost -U postgres -d library_db -f sql/seed_database.sql

echo "✅ Database reset complete!"
echo ""
echo "Demo credentials:"
echo "  Admin:       admin@ec-lyon.fr / admin123"
echo "  Lab Manager: manager@ec-lyon.fr / manager123"
echo "  User:        user@ec-lyon.fr / user123"
