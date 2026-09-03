# RecruitHub

RecruitHub is a full-stack recruitment platform that connects candidates and recruiters through a centralized job recruitment system.

The platform allows candidates to create profiles, upload resumes, discover job opportunities, save jobs, submit applications, and track application progress. Recruiters can create and manage job postings, view candidate applications, manage their company profile, and update application statuses.

## 🚀 Features

### 👤 Candidate Features

- Candidate registration and login
- JWT-based authentication
- Candidate profile management
- Resume upload and management
- Browse job opportunities
- Apply for jobs
- Prevent duplicate applications
- Save jobs for later
- View saved jobs
- Track application status
- View interview status
- Account settings
- Change password
- Logout

### 🏢 Recruiter Features

- Recruiter registration and login
- JWT-based authentication
- Company profile management
- Create job postings
- View and manage posted jobs
- Delete recruiter-owned jobs
- View candidate applications
- Track recruitment statistics
- Update candidate application status
- Application workflow management

### 🔐 Authentication & Security

- JWT access and refresh tokens
- Role-based access control
- Candidate and recruiter permissions
- Protected API endpoints
- Duplicate application prevention
- Resume file validation
- Resume file size validation
- User-specific data access

## 🛠️ Tech Stack

### Frontend

- React
- TypeScript
- Vite
- React Router
- Lucide React
- CSS

### Backend

- Python
- Django
- Django REST Framework
- Simple JWT

### Database

- PostgreSQL

### Development Tools

- Git
- GitHub
- Visual Studio Code
- npm

## 🏗️ Project Architecture

```text
RecruitHub
│
├── backend/
│   ├── config/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── asgi.py
│   │   └── wsgi.py
│   │
│   ├── users/
│   │   ├── migrations/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── admin.py
│   │
│   └── manage.py
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.tsx
│   │   ├── App.css
│   │   └── main.tsx
│   │
│   ├── package.json
│   └── vite.config.ts
│
├── .gitignore
└── README.md
```
