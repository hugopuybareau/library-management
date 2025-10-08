# Library Management System Makefile
# Usage: make [command]

# Variables
PYTHON := python3
PIP := pip
DB_USER := postgres
DB_NAME := library_db
DB_HOST := localhost
DB_PORT := 5432

# Colors for output
RED := \033[0;31m
GREEN := \033[0;32m
YELLOW := \033[1;33m
NC := \033[0m # No Color

.PHONY: help install setup db-create db-init db-seed db-drop db-reset test clean run backup restore

help: ## Show this help message
	@echo "$(GREEN)Library Management System - Available Commands$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(YELLOW)%-15s$(NC) %s\n", $$1, $$2}'

install: ## Install Python dependencies
	@echo "$(GREEN)Installing Python dependencies...$(NC)"
	$(PYTHON) -m venv .venv && source .venv/bin/activate
	$(PIP) install -r backend/requirements.txt
	@echo "$(GREEN)Dependencies installed$(NC)"

setup: ## Complete project setup (install + database)
	@echo "$(GREEN)Setting up Library Management System...$(NC)"
	@make install
	@make db-init
	@echo "$(GREEN)✓ Setup complete!$(NC)"

db-create: ## Create the database
	@echo "$(GREEN)Creating database...$(NC)"
	$(PYTHON) admin_tools.py create --user $(DB_USER)
	@echo "$(GREEN)✓ Database created$(NC)"

db-init: ## Initialize database with schema and seed data
	@echo "$(GREEN)Initializing database...$(NC)"
	$(PYTHON) admin_tools.py init --user $(DB_USER)
	@echo "$(GREEN)✓ Database initialized$(NC)"

db-seed: ## Seed database with sample data
	@echo "$(GREEN)Seeding database...$(NC)"
	psql -U $(DB_USER) -d $(DB_NAME) -f seed_database.sql
	@echo "$(GREEN)✓ Database seeded$(NC)"

db-drop: ## Drop the db
	@echo "$(RED)WARNING: This will delete all data!$(NC)"
	@read -p "Are you sure? (y/N): " confirm && \
	if [ "$$confirm" = "y" ]; then \
		psql -U $(DB_USER) -c "DROP DATABASE IF EXISTS $(DB_NAME);" && \
		echo "$(GREEN)✓ Database dropped$(NC)"; \
	else \
		echo "$(YELLOW)Operation cancelled$(NC)"; \
	fi

db-reset: ## Reset database (drop and recreate)
	@echo "$(YELLOW)Resetting database...$(NC)"
	@make db-drop
	@make db-init
	@echo "$(GREEN)✓ Database reset complete$(NC)"

db-stats: ## Show database statistics
	@echo "$(GREEN)Database Statistics:$(NC)"
	$(PYTHON) admin_tools.py stats --user $(DB_USER)

db-test: ## Test database connection
	@echo "$(GREEN)Testing database connection...$(NC)"
	$(PYTHON) test_connection.py

test: ## Run all tests
	@echo "$(GREEN)Running tests...$(NC)"
	@make db-test
	pytest tests/ -v --cov=.
	@echo "$(GREEN)✓ Tests complete$(NC)"

test-function: ## Test a specific database function (use: make test-function FUNC=function_name PARAMS="param1 param2")
	$(PYTHON) test_connection.py --function $(FUNC) --params $(PARAMS)

add-borrowings: ## Add test borrowings
	@echo "$(GREEN)Adding test borrowings...$(NC)"
	$(PYTHON) admin_tools.py test-borrow --count 5 --user $(DB_USER)
	@echo "$(GREEN)✓ Test borrowings added$(NC)"

overdue: ## List overdue books
	@echo "$(GREEN)Checking overdue books...$(NC)"
	$(PYTHON) admin_tools.py overdue --user $(DB_USER)

backup: ## Backup the database
	@echo "$(GREEN)Creating database backup...$(NC)"
	@mkdir -p backups
	@BACKUP_FILE="backups/library_backup_$$(date +%Y%m%d_%H%M%S).sql" && \
	pg_dump -U $(DB_USER) -d $(DB_NAME) -f $$BACKUP_FILE && \
	echo "$(GREEN)✓ Backup saved to $$BACKUP_FILE$(NC)"

restore: ## Restore database from latest backup
	@LATEST_BACKUP=$$(ls -t backups/*.sql 2>/dev/null | head -1); \
	if [ -z "$$LATEST_BACKUP" ]; then \
		echo "$(RED)No backup files found$(NC)"; \
	else \
		echo "$(YELLOW)Restoring from $$LATEST_BACKUP...$(NC)"; \
		$(PYTHON) admin_tools.py restore $$LATEST_BACKUP --user $(DB_USER); \
		echo "$(GREEN)✓ Database restored$(NC)"; \
	fi

clean: ## Clean temporary files and caches
	@echo "$(GREEN)Cleaning temporary files...$(NC)"
	find . -type f -name "*.pyc" -delete
	find . -type d -name "__pycache__" -delete
	find . -type f -name ".DS_Store" -delete
	rm -f library.log
	@echo "$(GREEN)✓ Cleanup complete$(NC)"

run-api: ## Run the Flask API server
	@echo "$(GREEN)Starting Flask API server...$(NC)"
	FLASK_ENV=development $(PYTHON) app.py

run-frontend: ## Instructions for running the frontend
	@echo "$(YELLOW)To run the frontend:$(NC)"
	@echo "1. Go to Lovable.dev"
	@echo "2. Create a new project"
	@echo "3. Copy the content from lovable_prompt.md"
	@echo "4. Let Lovable generate the interface"
	@echo ""
	@echo "Or if you have a local React app:"
	@echo "  cd frontend && npm start"

logs: ## Show application logs
	@if [ -f library.log ]; then \
		tail -f library.log; \
	else \
		echo "$(YELLOW)No log file found$(NC)"; \
	fi

psql: ## Connect to database with psql
	psql -U $(DB_USER) -d $(DB_NAME)

query: ## Run a custom SQL query (use: make query SQL="SELECT * FROM library.lab")
	@psql -U $(DB_USER) -d $(DB_NAME) -c "$(SQL)"

info: ## Show project information
	@echo "$(GREEN)Library Management System$(NC)"
	@echo "========================="
	@echo "Database: $(DB_NAME)"
	@echo "Host: $(DB_HOST):$(DB_PORT)"
	@echo "User: $(DB_USER)"
	@echo ""
	@echo "Python version: $$($(PYTHON) --version)"
	@echo "PostgreSQL version: $$(psql --version)"
	@echo ""
	@echo "Run 'make help' for available commands"

# Default target
.DEFAULT_GOAL := help