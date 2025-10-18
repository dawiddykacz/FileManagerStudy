FileManagerStudy

FileManagerStudy is a simple file manager built with Node.js, Express, Handlebars, and AWS S3 (locally via LocalStack). It allows you to:

Register and log in users.

Upload, preview, and version files.

Manage file access (ACL) and visibility (public/private).

Comment on files and view version history.

Support different file types: images, PDF, text files, JSON, CSV.

Table of Contents

Requirements

Installation

Configuration

Running the App

Features

Project Structure

Technologies Used

Requirements

Node.js ≥ 18

SQLite (better-sqlite3)

AWS S3 (LocalStack can be used for local testing)

npm

Installation

Clone the repository:

git clone <repo-url>
cd FileManagerStudy/express


Install dependencies:

npm install


Create an uploads folder (if it doesn’t exist, it will be automatically created on the first upload):

mkdir uploads

Configuration

Set environment variables in a .env file in the project root:

AWS_ACCESS_KEY_ID=<your_key>
AWS_SECRET_ACCESS_KEY=<your_secret>
AWS_REGION=eu-central-1
S3_ENDPOINT=http://localhost:4566
S3_BUCKET=file-manager
DATABASE_FILE=data.db


S3_ENDPOINT – S3 endpoint (e.g., LocalStack for local testing)

S3_BUCKET – bucket name, automatically created at startup

DATABASE_FILE – path to SQLite database

Running the App
node index.js


By default, the server runs at: http://localhost:3000.

On first run, a default admin user is created:

username: admin
password: admin

Features
Users

Register new users.

Login and logout.

User roles: user and admin.

Files

Upload multiple files at once.

Preview files (images, PDF, text, JSON, CSV).

File versioning – each update creates a new version.

View version history and preview previous versions.

Manage visibility: public / private.

ACL management – share access with other users.

Delete files (owner or admin only).

Comments

Add comments to files.

Display a list of comments.

Project Structure
express/
├─ config/
│  └─ db.js                 # SQLite database configuration
├─ data/
│  ├─ data.js               # CRUD operations for files
│  ├─ fileStorage.js        # S3 / LocalStack integration
│  ├─ users.js              # User management
│  ├─ init.js               # Database initialization and default admin creation
│  └─ icons.js              # Helpers for file icons and types
├─ static/                  # Static files (CSS/JS)
├─ uploads/                 # Upload directory (auto-created)
├─ views/
│  ├─ layouts/
│  │  └─ main.hbs           # Main layout
│  ├─ partials/             # HBS partials
│  ├─ home.hbs
│  ├─ login.hbs
│  ├─ upload.hbs
│  ├─ filemanager.hbs
│  ├─ preview.hbs
│  ├─ comments.hbs
│  └─ versions.hbs
└─ index.js                 # Main server file

Technologies Used

Node.js / Express

Handlebars (HBS) – template engine

SQLite (better-sqlite3) – local database

AWS S3 / LocalStack – file storage

Formidable / Multer – file uploads

bcrypt – password hashing

UUID – unique ID generation

CORS – browser support for pre-signed URLs
