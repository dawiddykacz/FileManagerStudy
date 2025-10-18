# FileManagerStudy

**FileManagerStudy** is a simple file manager built with Node.js, Express, Handlebars, and AWS S3 (locally via LocalStack).  
It supports user registration, file upload, preview, versioning, access control, and comments.

---

## Table of Contents

- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Project Structure](#project-structure)

---

## Features

### Users
- Register new users
- Login and logout
- User roles: `user` and `admin`

### Files
- Upload multiple files at once
- Preview files (images, PDF, text, JSON, CSV)
- File versioning – each update creates a new version
- View version history and preview previous versions
- Manage visibility: `public` / `private`
- ACL management – share access with other users
- Delete files (owner or admin only)

### Comments
- Add comments to files
- View comments

---

## Requirements

- Node.js ≥ 18
- SQLite (`better-sqlite3`)
- AWS S3 (or LocalStack for local testing)
- npm

---

## Installation

Clone the repository:

```bash
git clone <repo-url>
cd FileManagerStudy/express
docker compose up --build```

## Project Structure
express/
├─ config/
│ └─ db.js # SQLite configuration
├─ data/
│ ├─ data.js # CRUD operations for files
│ ├─ fileStorage.js # S3 / LocalStack integration
│ ├─ users.js # User management
│ ├─ init.js # DB initialization and default admin
│ └─ icons.js # Helpers for icons and file types
├─ static/ # CSS/JS static files
├─ uploads/ # Uploaded files (created automatically)
├─ views/
│ ├─ layouts/
│ │ └─ main.hbs # Main layout
│ ├─ partials/ # Handlebars partials
│ ├─ home.hbs
│ ├─ login.hbs
│ ├─ upload.hbs
│ ├─ filemanager.hbs
│ ├─ preview.hbs
│ ├─ comments.hbs
│ └─ versions.hbs
└─ index.js # Main server file

