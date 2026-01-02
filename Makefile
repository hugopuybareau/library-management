# Library Management System Makefile
# Usage: make [command]

# Variables
PYTHON := python3
VENV := .venv
VENV_BIN := $(VENV)/bin
PIP := $(VENV_BIN)/pip
PYTHON_VENV := $(VENV_BIN)/python
DB_USER := postgres
DB_NAME := library_db
DB_HOST := localhost
DB_PORT := 5432
BACKEND_PORT := 5001
FRONTEND_PORT := 8080

# Colors for output
RED := \033[0;31m
GREEN := \033[0;32m
YELLOW := \033[1;33m
NC := \033[0m # No Color

.PHONY: help venv install frontend-install setup-all db-create db-init db-seed db-drop db-reset test clean backend frontend dev backup restore

help: ## Show this help message
	@echo "$(GREEN)Library Management System - Available Commands$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(YELLOW)%-15s$(NC) %s\n", $$1, $$2}'

venv: ## Create Python virtual environment
	@if [ ! -d "$(VENV)" ]; then \
		echo "$(GREEN)Creating virtual environment...$(NC)"; \
		$(PYTHON) -m venv $(VENV); \
		echo "$(GREEN)✓ Virtual environment created$(NC)"; \
	else \
		echo "$(YELLOW)Virtual environment already exists$(NC)"; \
	fi

install: venv ## Install Python backend dependencies
	@echo "$(GREEN)Installing Python dependencies...$(NC)"
	@$(PIP) install --upgrade pip
	@$(PIP) install -r backend/requirements.txt
	@echo "$(GREEN)✓ Python dependencies installed$(NC)"

frontend-install: ## Install frontend dependencies
	@echo "$(GREEN)Installing frontend dependencies...$(NC)"
	@cd frontend && pnpm install
	@echo "$(GREEN)✓ Frontend dependencies installed$(NC)"

setup-all: ## Complete project setup (backend + frontend + database)
	@echo "$(GREEN)Setting up Library Management System...$(NC)"
	@make install
	@make frontend-install
	@make db-init
	@echo "$(GREEN)✓ Complete setup done!$(NC)"
	@echo ""
	@echo "$(YELLOW)Next steps:$(NC)"
	@echo "  1. Run '$(GREEN)make backend$(NC)' to start the backend server"
	@echo "  2. Run '$(GREEN)make frontend$(NC)' in another terminal to start the frontend"
	@echo "  3. Or run '$(GREEN)make dev$(NC)' to start both (requires tmux or separate terminals)"

db-create: install ## Create the database
	@echo "$(GREEN)Creating database...$(NC)"
	@$(PYTHON_VENV) backend/db_tools.py --user $(DB_USER) create
	@echo "$(GREEN)✓ Database created$(NC)"

db-init: install ## Initialize database with schema and seed data
	@echo "$(GREEN)Initializing database...$(NC)"
	@$(PYTHON_VENV) backend/db_tools.py --user $(DB_USER) init
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

db-stats: install ## Show database statistics
	@echo "$(GREEN)Database Statistics:$(NC)"
	@$(PYTHON_VENV) backend/db_tools.py --user $(DB_USER) stats

db-test: install ## Test database connection
	@echo "$(GREEN)Testing database connection...$(NC)"
	@$(PYTHON_VENV) backend/test_connection.py

test: ## Run all tests
	@echo "$(GREEN)Running tests...$(NC)"
	@make db-test
	pytest tests/ -v --cov=.
	@echo "$(GREEN)✓ Tests complete$(NC)"

test-function: install ## Test a specific database function (use: make test-function FUNC=function_name PARAMS="param1 param2")
	@$(PYTHON_VENV) backend/test_connection.py --function $(FUNC) --params $(PARAMS)

add-borrowings: install ## Add test borrowings
	@echo "$(GREEN)Adding test borrowings...$(NC)"
	@$(PYTHON_VENV) backend/db_tools.py --user $(DB_USER) test-borrow --count 5
	@echo "$(GREEN)✓ Test borrowings added$(NC)"

overdue: install ## List overdue books
	@echo "$(GREEN)Checking overdue books...$(NC)"
	@$(PYTHON_VENV) backend/db_tools.py --user $(DB_USER) overdue

backup: ## Backup the database
	@echo "$(GREEN)Creating database backup...$(NC)"
	@mkdir -p backups
	@BACKUP_FILE="backups/library_backup_$$(date +%Y%m%d_%H%M%S).sql" && \
	pg_dump -U $(DB_USER) -d $(DB_NAME) -f $$BACKUP_FILE && \
	echo "$(GREEN)✓ Backup saved to $$BACKUP_FILE$(NC)"

restore: install ## Restore database from latest backup
	@LATEST_BACKUP=$$(ls -t backups/*.sql 2>/dev/null | head -1); \
	if [ -z "$$LATEST_BACKUP" ]; then \
		echo "$(RED)No backup files found$(NC)"; \
	else \
		echo "$(YELLOW)Restoring from $$LATEST_BACKUP...$(NC)"; \
		$(PYTHON_VENV) backend/db_tools.py --user $(DB_USER) restore $$LATEST_BACKUP; \
		echo "$(GREEN)✓ Database restored$(NC)"; \
	fi

clean: ## Clean temporary files and caches
	@echo "$(GREEN)Cleaning temporary files...$(NC)"
	find . -type f -name "*.pyc" -delete
	find . -type d -name "__pycache__" -delete
	find . -type f -name ".DS_Store" -delete
	rm -f library.log
	@echo "$(GREEN)✓ Cleanup complete$(NC)"

psql: ## Connect to database with psql
	psql -U $(DB_USER) -d $(DB_NAME)

query: ## Run a custom SQL query (use: make query SQL="SELECT * FROM library.lab")
	@psql -U $(DB_USER) -d $(DB_NAME) -c "$(SQL)"

backend: install ## Start the backend server
	@echo "$(GREEN)Starting backend server on port $(BACKEND_PORT)...$(NC)"
	@$(PYTHON_VENV) backend/app.py

frontend: ## Start the frontend development server
	@echo "$(GREEN)Starting frontend server on port $(FRONTEND_PORT)...$(NC)"
	@cd frontend && pnpm run dev

dev: ## Start both backend and frontend (requires 2 terminals or tmux)
	@echo "$(YELLOW)Starting development servers...$(NC)"
	@echo "$(GREEN)Run these commands in separate terminals:$(NC)"
	@echo "  Terminal 1: $(YELLOW)make backend$(NC)"
	@echo "  Terminal 2: $(YELLOW)make frontend$(NC)"

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