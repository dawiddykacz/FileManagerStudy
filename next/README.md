# FileManagerStudy - Express

**FileManagerStudy** is a simple file manager built with Node.js, Express, Handlebars, and AWS S3 (locally via LocalStack).  
It supports user registration, file upload, preview, versioning, access control, and comments.

---

## Table of Contents

- [Requirements](#requirements)
- [Installation](#installation)
- [Project Structure](#project-structure)

---

### Users
- Register new users
- Login and logout
- User roles: `user` and `admin`
- Admin acount, user: admin, password: admin

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

- Node.js ≥ 20.9
- SQLite (`better-sqlite3`)
- AWS S3 (or LocalStack for local testing)
- npm

---

## Installation

Clone the repository:

git clone <repo-url>

cd FileManagerStudy/express

docker compose up --build

---

## Project-structure

```bash
src/app
├─ api/
│ ├─ add_acl/
| | └─ [id]/route.js # add share
│ ├─ comment/
| | └─ [id]/route.js # add comment
│ ├─ delete/
| | └─ [id]/route.js # delete file
│ ├─ files/
| | └─ [id]/visibility/route.js # change file's visibility
│ ├─ login/
| | └─ route.js # login user
│ └─ register/
|   └─ route.js # register user
├─ comments/
| └─ [id]/page.js # show comments
├─ filemanager/
| └─ page.js # show file page
├─ files/
| └─ [id]/page.js # preview file
├─ history/
| └─ [id]/page.js # preview file's history
├─ info/
| └─ [id]/page.js # show file's info
├─ login/
| └─ page.js # show login page
├─ logout/
| └─ page.js # logout user
├─ upload/
| └─ page.js # show upload page
├─ layout.js # show layout
└─ page.js # show main page
next/src/components
├─ acl.js - share component
├─ comment.js - comment component
├─ file.js - file component
└─ pa.js - preview component
next/src/lib - legacy domain code from express project
next/src/pages/api
├─ filemanager/[id].js - api update endpoint
└─ upload.js - api upload file endpoint
```
