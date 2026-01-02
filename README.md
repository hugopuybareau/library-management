# Library Management System

Pour que ce soit simple à mettre en place : 

## Prérequis

- Python 3.8+
- Node.js 16+ and pnpm
- PostgreSQL 12+
- Make (command-line tool)

### Setup complet (Recommandé)

Pour tout setup de 0 :

```bash
make setup-all
```

Ça va:

1. Créer une venv python
2. Installer toutes les deps du backend
3. Même chose pour le front
4. Créer et initialiser la DB
5. Seed la DB

### Pour faire marcher l'app

Faire tourner le back et le front dans des terminals séparés.

**Terminal 1 - Backend:**
```bash
make backend
```
Ça tournera sur http://localhost:5001

**Terminal 2 - Frontend:**
```bash
make frontend
```
Même chose sur http://localhost:8080

### Plus

Voir toutes les commandes simples:
```bash
make help
```