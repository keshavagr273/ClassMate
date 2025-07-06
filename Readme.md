# ClassMate

**ClassMate** is a comprehensive, full-stack campus management platform designed to streamline and enhance the student experience. Built with a modern technology stack, ClassMate integrates essential academic, social, and utility tools into a single, user-friendly web application.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Setup & Installation](#setup--installation)
- [Implemented Modules](#implemented-modules)
- [Authentication & Security](#authentication--security)
- [Contribution Guidelines](#contribution-guidelines)
- [License](#license)

---

## Project Overview

ClassMate is engineered to be the digital backbone of a modern campus, offering a suite of tools for students, faculty, and administrators. The platform is modular, scalable, and optimized for both performance and usability. It supports real-time collaboration, secure authentication, and seamless integration with third-party services.

---

## Key Features

- **SkillSwap**: Peer-to-peer skill exchange platform. Teach what you know, learn what you want.
- **InternConnect**: Aggregates top internships from trusted platforms like Internshala, with advanced filtering.
- **ClassPulse**: Effortless attendance tracking and analytics for students and faculty.
- **CampusBazaar**: Secure campus marketplace for buying and selling goods.
- **FoundIt!**: Lost and found management for reporting and recovering items.
- **RideLoop**: Smart carpooling and ride-sharing within the campus community.
- **Notifications**: Real-time notification system for important updates and alerts.
- **Admin Dashboard**: Powerful admin tools for user management, analytics, and moderation.
- **Profile Management**: Rich user profiles with role-based access and customization.
- **Quick Links**: Easy access to academic calendars, contacts, clubs, and more.

---

## Tech Stack

**Frontend:**
- React 18 (with Hooks and Context API)
- Redux Toolkit for state management
- React Router v7 for navigation
- Tailwind CSS for modern, responsive UI
- Framer Motion for animations
- Axios for API communication
- React Hot Toast & Toastify for notifications

**Backend:**
- Node.js with Express.js
- Sequelize ORM (PostgreSQL)
- JWT-based authentication (secure, stateless)
- CORS with credentials support
- Cloudinary for media uploads
- Nodemailer for email services
- Apify for internship scraping
- Socket.io for real-time features (future-ready)
- Helmet, rate limiting, and profanity filtering for security

**DevOps & Tooling:**
- Vite for fast frontend builds
- Nodemon for backend hot-reloading
- ESLint for code quality
- Environment-based configuration

---

## Architecture

- **Monorepo**: Separate `client` (frontend) and `server` (backend) directories.
- **RESTful API**: Modular route structure for scalability.
- **JWT Authentication**: Secure, cookie-based session management.
- **Role-Based Access Control**: Admin, student, and faculty roles.
- **Database**: Relational schema with associations for users, roles, attendance, marketplace, rides, notifications, and more.
- **Cloud Integration**: Media storage and email services.

---

## Setup & Installation

### Prerequisites

- Node.js (v18+ recommended)
- PostgreSQL database
- Cloudinary account (for media uploads)
- (Optional) Apify account for internship scraping

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/classmate.git
cd classmate
```

### 2. Install Dependencies

```bash
cd server
npm install
cd ../client
npm install
```

### 3. Configure Environment Variables

- Copy `.env.example` to `.env` in both `client` and `server` directories.
- Fill in your database, JWT secret, Cloudinary, and other credentials.

### 4. Run the Application

**Backend:**
```bash
cd server
npm run dev
```

**Frontend:**
```bash
cd client
npm run dev
```

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend: [http://localhost:5000](http://localhost:5000)

---

## Implemented Modules

### 1. **Authentication & Authorization**
- Secure JWT-based login, registration, and session management.
- Role-based access for admin, student, and faculty.
- Password hashing with bcrypt.
- Email verification and password reset (via Nodemailer).

### 2. **Attendance Management (ClassPulse)**
- Daily and subject-wise attendance tracking.
- Visual analytics and summary cards.
- Faculty tools for marking and editing attendance.

### 3. **Skill Exchange (SkillSwap)**
- Post, request, and manage skill exchange offers.
- Peer-to-peer learning and teaching.

### 4. **Internship Aggregator (InternConnect)**
- Fetches and filters internships from Internshala using Apify.
- Advanced search and filtering.

### 5. **Marketplace (CampusBazaar)**
- Buy and sell items within the campus.
- Moderation tools for admins.
- Secure contact and transaction management.

### 6. **Lost & Found (FoundIt!)**
- Report lost items or found items.
- Admin moderation and notifications.

### 7. **Ride Sharing (RideLoop)**
- Post, join, and manage carpool rides.
- Smart filters for date, direction, and price.

### 8. **Notifications**
- Real-time notification panel.
- Mark as read, delete, and manage notifications.

### 9. **Admin Dashboard**
- User management, analytics, and moderation.
- Role assignment and permission management.

### 10. **Profile Management**
- Edit profile, view roles, and manage personal data.

### 11. **Quick Links & Utilities**
- Academic calendar, contacts, clubs, and more.
- 404 and 500 error pages.

---

## Authentication & Security

- **JWT tokens** stored in HTTP-only cookies for security.
- **CORS** configured for cross-origin requests with credentials.
- **Helmet** and **rate limiting** for API protection.
- **Profanity filtering** for user-generated content.
- **Cloudinary** for secure media uploads.

---

## Contribution Guidelines

1. Fork the repository and create a new branch.
2. Follow the existing code style and naming conventions.
3. Write clear, descriptive commit messages.
4. Test your changes locally before submitting a pull request.
5. For major changes, open an issue first to discuss your proposal.

---

## License

This project is licensed under the [MIT License](LICENSE).

---

## Keywords

Campus Management, Student Portal, Attendance Tracking, Skill Exchange, Internship Aggregator, Marketplace, Lost and Found, Ride Sharing, Notifications, Admin Dashboard, React, Node.js, Express, PostgreSQL, JWT, Cloudinary, Apify, Vite, Tailwind CSS, Redux, Full Stack, Modern Web App

---

**ClassMate** — Empowering campus life, one tool at a time. 