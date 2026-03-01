# SkillHive — Recruitment Management System

A full-stack recruitment management platform that streamlines the hiring process — from candidate registration and job posting to application tracking, shortlisting, and automated notifications.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Login Credentials (Demo)](#login-credentials-demo)
- [User Roles & Permissions](#user-roles--permissions)
- [Complete Workflow](#complete-workflow)
  - [1. Registration](#1-registration)
  - [2. Login & Authentication](#2-login--authentication)
  - [3. Admin — HR Approval](#3-admin--hr-approval)
  - [4. HR — Job Posting](#4-hr--job-posting)
  - [5. Candidate — Browsing & Applying](#5-candidate--browsing--applying)
  - [6. HR — Reviewing Applications](#6-hr--reviewing-applications)
  - [7. Shortlisting & Auto-Close](#7-shortlisting--auto-close)
  - [8. Candidate — Tracking Applications](#8-candidate--tracking-applications)
  - [9. HR — Analytics](#9-hr--analytics)
- [Application Status Flow](#application-status-flow)
- [Job Lifecycle](#job-lifecycle)
- [Email Notifications](#email-notifications)
- [API Endpoints Reference](#api-endpoints-reference)
- [Project Structure](#project-structure)

---

## Tech Stack

| Layer        | Technology                                                                 |
| ------------ | -------------------------------------------------------------------------- |
| **Frontend** | React 19, React Router 7, Tailwind CSS 4, Framer Motion, Vite 7, Axios   |
| **Backend**  | Express 5, Mongoose 9, MongoDB, JWT, bcryptjs, Multer 2, Nodemailer      |
| **Storage**  | Cloudinary (cloud) with automatic local fallback for resume uploads       |
| **Deploy**   | Vercel (client), configurable Node.js server (port 5000)                  |

---

## Login Credentials (Demo)

| Role      | Email                          | Password    |
| --------- | ------------------------------ | ----------- |
| **Admin** | `admin@gmail.com`              | `admin@123` |
| **HR**    | `manojmanojvv123@gmail.com`    | `123456`    |
| **User**  | `manojv7689@gmail.com`         | `123456`    |

---

## User Roles & Permissions

### Admin
- **Cannot self-register** — must be seeded directly in the database.
- Views and manages all HR accounts (approve / disapprove).
- Views all jobs posted across the platform.
- Has access to the Admin dashboard at `/admin`.

### HR (Human Resources)
- Registers freely but **must be approved by an Admin** before gaining full access.
- Creates and manages job postings (title, description, skills, experience, location, type, vacancies).
- Reviews applications for their own job postings.
- Views candidate resumes (inline PDF viewer or download).
- Updates application statuses — **Shortlist**, **Reject**, or revert to **Applied**.
- Manually closes job postings.
- Views hiring analytics and conversion rates at `/hr-analytics`.

### Candidate (User)
- Registers freely with **immediate access** — no approval required.
- Browses all open job listings (public, no login required to view).
- Applies to jobs by uploading a PDF resume (max 5 MB).
- Tracks the status of all submitted applications at `/my-applications`.

---

## Complete Workflow

### 1. Registration

```
Candidate registers ──► isApproved = true ──► Immediate access
HR registers        ──► isApproved = false ──► Awaits Admin approval
Admin               ──► Cannot register (seeded in DB)
```

1. The user navigates to the **Register** page and fills in: `username`, `email`, `password`, and selects a `role` (Candidate or HR).
2. The server validates all fields, checks for duplicate emails, and **blocks** any attempt to register with the `admin` role.
3. The password is hashed using **bcryptjs** (10 salt rounds) before storage.
4. A User document is created in MongoDB:
   - **Candidates** get `isApproved: true` — they can log in and use the platform immediately.
   - **HR users** get `isApproved: false` — they receive a message: *"Registration successful! Awaiting admin approval."*

### 2. Login & Authentication

1. The user enters their `email` and `password` on the **Login** page.
2. The server finds the user, compares the bcrypt hash, and on success returns:
   - A **JWT token** (1-day expiry) containing `{ id, role }`.
   - The user's profile info including `isApproved` status.
3. The client stores the `token` and `user` object in `localStorage`.
4. **HR-specific guard:** If an HR user's `isApproved` is `false`, login is rejected on the client side with a *"Pending admin approval"* message, and the token is cleared.
5. Based on the role, the user is redirected:
   - **Admin** → `/admin`
   - **HR** → `/hr`
   - **Candidate** → `/jobs`

**Route Protection:**
- All protected routes are wrapped in a `<Protected allowed={[...roles]}>` component that verifies the token and role from `localStorage`.
- The Axios interceptor automatically attaches the Bearer token to every request and redirects to `/login` on a `401` response.

### 3. Admin — HR Approval

1. The Admin logs in and lands on the **Admin Dashboard** (`/admin`).
2. The dashboard displays:
   - **Total HRs**, **Approved count**, and **Pending count**.
   - A searchable, filterable list of all HR users.
3. For each pending HR, the Admin can:
   - **Approve** → sets `isApproved: true` → the HR receives an **approval email** and can now log in.
   - **Disapprove** → sets `isApproved: false` → the HR receives a **disapproval email** and is locked out.
4. Approval status is **reversible** — the Admin can disapprove a previously approved HR at any time.

### 4. HR — Job Posting

1. An **approved HR** logs in and lands on the **HR Dashboard** (`/hr`).
2. The dashboard shows stats: Jobs Posted, Open Jobs, Closed Jobs, Total Vacancies.
3. The HR fills out the **Create Job** form with:
   - **Title**, **Description**, **Skills** (comma-separated), **Experience**, **Location**, **Job Type** (Full-Time / Part-Time / Internship), **Vacancies**.
4. On submission, the job is created with `isOpen: true` and linked to the HR's user ID.
5. **Jobs go live immediately** — there is no admin approval step for job postings.
6. The HR can view all their jobs in the **My Jobs** section with search and filter capabilities (by title, location, type, open/closed status).

### 5. Candidate — Browsing & Applying

1. Open jobs are listed on the **Jobs** page (`/jobs`) — this page is publicly accessible (no login required to browse).
2. The candidate clicks **"View Details"** on a job → a **Job Details Modal** opens showing the full job description, required skills, experience, location, and type.
3. To apply, the candidate:
   - Uploads a **PDF resume** (max 5 MB, PDF format enforced).
   - Checks the confirmation checkbox.
   - Clicks **Submit Application**.
4. **Resume storage:**
   - If **Cloudinary** environment variables are configured → the resume is uploaded to Cloudinary as a raw resource.
   - Otherwise → the resume is saved locally to `server/uploads/resumes/` with the filename format `{userId}_{timestamp}_{originalName}`.
5. An **Application** document is created in MongoDB with status `applied`.
6. A **confirmation email** is sent to the candidate.

### 6. HR — Reviewing Applications

1. From the HR Dashboard, the HR clicks **"View Applications"** on any of their posted jobs.
2. This navigates to the **Job Applications** page (`/job-applications`) showing all applications for that specific job (or all their jobs).
3. For each application, the HR can see:
   - Candidate name and email.
   - Current application status (Applied / Shortlisted / Rejected).
   - Date of application.
4. The HR can:
   - **View Resume** — opens an inline PDF viewer in a modal (streams the resume from Cloudinary or local storage).
   - **Download Resume** — downloads the PDF file.
   - **Update Status** — mark the application as **Shortlisted**, **Rejected**, or revert to **Applied**.
5. On every status change, a **status update email** is sent to the candidate.

### 7. Shortlisting & Auto-Close

This is the core decision-making step in the recruitment pipeline:

1. The HR reviews each application and marks candidates as **Shortlisted** or **Rejected**.
2. Statuses are **fully reversible** — the HR can move an application from `rejected` back to `applied` or `shortlisted` at any time.
3. **Auto-Close Mechanism:**
   - Every time an application is marked as `shortlisted`, the server counts all shortlisted applications for that job.
   - If the **shortlisted count ≥ job vacancies** and the job is still open → the job is **automatically closed**.
   - A **job closure email** is sent to **all candidates** who applied for that job, informing them that *"all vacancies have been filled."*
4. **Manual Close:**
   - The HR can also manually close a job at any time from the HR Dashboard.
   - This also triggers a **job closure email** to all applicants.

```
              ┌─────────────────────────────────────────────────────────┐
              │                   SHORTLISTING FLOW                     │
              │                                                         │
              │   Application Created (status: applied)                 │
              │        │                                                │
              │        ▼                                                │
              │   HR Reviews Resume                                     │
              │        │                                                │
              │        ├──► Mark "Shortlisted" ──► Email to Candidate   │
              │        │         │                                      │
              │        │         ▼                                      │
              │        │   Check: shortlisted ≥ vacancies?              │
              │        │         │                                      │
              │        │         ├── YES ──► Auto-close job             │
              │        │         │           ──► Email all applicants   │
              │        │         │                                      │
              │        │         └── NO  ──► Job remains open           │
              │        │                                                │
              │        ├──► Mark "Rejected"   ──► Email to Candidate    │
              │        │                                                │
              │        └──► Revert to "Applied" (undo decision)         │
              │                                                         │
              └─────────────────────────────────────────────────────────┘
```

### 8. Candidate — Tracking Applications

1. The candidate navigates to **My Applications** (`/my-applications`).
2. This page lists all their submitted applications with:
   - Job title and details.
   - Current status: **Applied** (pending), **Shortlisted** (selected), or **Rejected**.
   - The uploaded resume (viewable).
3. Candidates also receive **email notifications** at every status change, so they are kept informed even without checking the portal.

### 9. HR — Analytics

1. The HR navigates to the **Analytics** page (`/hr-analytics`).
2. The dashboard shows aggregated metrics:
   - **Summary Cards:** Jobs Posted, Total Applied, Shortlisted, Pending, Rejected, Closed Jobs, Shortlist Rate (%).
   - **Job-wise Breakdown Table:** For each job — counts of applied, shortlisted, pending, and rejected applications, plus open/closed status.
3. This helps HR measure hiring efficiency and track conversion rates.

---

## Application Status Flow

```
┌──────────┐       ┌──────────────┐       ┌──────────┐
│  Applied  │ ◄───► │  Shortlisted │ ◄───► │ Rejected │
└──────────┘       └──────────────┘       └──────────┘
     ▲                                          │
     └──────────────────────────────────────────┘
         (All transitions are reversible)
```

| Status         | Meaning                                      |
| -------------- | -------------------------------------------- |
| **Applied**    | Default status when a candidate applies       |
| **Shortlisted**| HR has selected the candidate for the role    |
| **Rejected**   | HR has decided not to proceed with candidate  |

---

## Job Lifecycle

```
Job Created (isOpen: true)
     │
     ├──► HR Manually Closes ──► isOpen: false ──► Notify all applicants
     │
     └──► Shortlisted count ≥ Vacancies ──► Auto-close ──► isOpen: false
                                                          ──► Notify all applicants
```

---

## Email Notifications

All emails use **branded HTML templates** with gradient headers and are sent via **Nodemailer** with configurable SMTP settings.

| Trigger                       | Recipient          | Content                                      |
| ----------------------------- | ------------------ | -------------------------------------------- |
| Admin approves HR             | HR user            | Approval confirmation                        |
| Admin disapproves HR          | HR user            | Disapproval notification                     |
| Candidate submits application | Candidate          | Application submission confirmation           |
| HR changes application status | Candidate          | Status update (shortlisted/rejected)          |
| Job is closed (manual)        | All job applicants | Job closure notification                      |
| Job auto-closes (filled)      | All job applicants | Vacancies filled notification                 |

> **Note:** If SMTP is not configured, emails are gracefully skipped (logged as warnings, not errors).

---

## API Endpoints Reference

### Authentication (`/auth`)

| Method  | Endpoint                  | Auth     | Access     | Description                  |
| ------- | ------------------------- | -------- | ---------- | ---------------------------- |
| `POST`  | `/auth/register`          | None     | Public     | Register candidate or HR     |
| `POST`  | `/auth/login`             | None     | Public     | Login and receive JWT        |
| `GET`   | `/auth/hrs`               | JWT      | Admin only | List all HR users            |
| `PATCH` | `/auth/approve-hr/:hrId`  | JWT      | Admin only | Approve an HR account        |
| `PATCH` | `/auth/disapprove-hr/:hrId` | JWT   | Admin only | Disapprove an HR account     |

### Jobs (`/jobs`)

| Method  | Endpoint              | Auth     | Access       | Description                  |
| ------- | --------------------- | -------- | ------------ | ---------------------------- |
| `POST`  | `/jobs`               | JWT      | Approved HR  | Create a new job posting     |
| `GET`   | `/jobs/my`            | JWT      | Any auth'd   | Get current user's jobs      |
| `GET`   | `/jobs`               | JWT      | Admin only   | Get all jobs                 |
| `GET`   | `/jobs/open`          | None     | Public       | Get all open job listings    |
| `PATCH` | `/jobs/close/:jobId`  | JWT      | HR (own)     | Close a job posting          |

### Applications (`/applications`)

| Method  | Endpoint                              | Auth     | Access       | Description                        |
| ------- | ------------------------------------- | -------- | ------------ | ---------------------------------- |
| `POST`  | `/applications/apply/:jobId`          | JWT      | Candidate    | Apply for a job (multipart form)   |
| `GET`   | `/applications/my`                    | JWT      | Candidate    | Get own applications               |
| `GET`   | `/applications/job/all`               | JWT      | HR           | Get all apps for HR's jobs         |
| `GET`   | `/applications/job/:jobId`            | JWT      | HR (own)     | Get apps for a specific job        |
| `PATCH` | `/applications/status/:applicationId` | JWT      | HR (own)     | Update application status          |

### Resume (`/resume`)

| Method | Endpoint                          | Auth         | Access              | Description              |
| ------ | --------------------------------- | ------------ | ------------------- | ------------------------ |
| `GET`  | `/resume/view/:applicationId`    | JWT or query | HR / own candidate  | View resume inline (PDF) |
| `GET`  | `/resume/download/:applicationId`| JWT or query | HR / own candidate  | Download resume file     |

---

## Project Structure

```
Recruitment Management System/
├── README.md                    ← You are here
│
├── client/                      ← React Frontend (Vite)
│   ├── public/
│   ├── src/
│   │   ├── api/                 ← Axios API layer
│   │   │   ├── applicationApi.js
│   │   │   ├── authApi.js
│   │   │   ├── axios.js         ← Base Axios config with interceptors
│   │   │   └── jobApi.js
│   │   ├── components/          ← Reusable UI components
│   │   │   ├── Footer.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── JobDetailsModal.jsx
│   │   │   └── ResumeViewerModal.jsx
│   │   ├── pages/               ← Route-level page components
│   │   │   ├── Admin.jsx        ← Admin dashboard (HR management)
│   │   │   ├── HR.jsx           ← HR dashboard (job management)
│   │   │   ├── HRAnalytics.jsx  ← HR analytics & metrics
│   │   │   ├── JobApplications.jsx ← Application review (HR)
│   │   │   ├── Jobs.jsx         ← Public job listings
│   │   │   ├── Login.jsx
│   │   │   ├── MyApplications.jsx ← Candidate application tracker
│   │   │   └── Register.jsx
│   │   ├── App.jsx              ← Route definitions & protection
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── vercel.json
│
├── server/                      ← Express Backend
│   ├── config/
│   │   ├── cloudinary.js        ← Cloudinary configuration
│   │   ├── db.js                ← MongoDB connection
│   │   └── localStorage.js      ← Local file storage setup
│   ├── contollers/
│   │   ├── applicationController.js
│   │   ├── authController.js
│   │   └── jobController.js
│   ├── middleware/
│   │   ├── authMiddleware.js    ← JWT verification, role guards
│   │   └── resumeUpload.js     ← Multer config (PDF, 5MB max)
│   ├── models/
│   │   ├── Application.js
│   │   ├── Job.js
│   │   └── User.js
│   ├── routes/
│   │   ├── applicationRoutes.js
│   │   ├── authRoutes.js
│   │   ├── jobRoutes.js
│   │   └── resumeRoutes.js
│   ├── services/
│   │   └── notificationService.js ← Email templates & sending
│   ├── uploads/
│   │   └── resumes/             ← Local resume storage fallback
│   ├── server.js                ← Express app entry point
│   └── package.json
```

---

## End-to-End Flow Summary

```
┌─────────────┐     ┌─────────────┐     ┌─────────────────┐
│  CANDIDATE   │     │     HR      │     │     ADMIN       │
│  registers   │     │  registers  │     │  (seeded in DB) │
│  (auto-      │     │  (pending   │     │                 │
│   approved)  │     │   approval) │     │                 │
└──────┬───────┘     └──────┬──────┘     └────────┬────────┘
       │                    │                      │
       │                    │    ┌─────────────────┘
       │                    │    │ Approves HR
       │                    │    ▼
       │                    │  ┌──────────────┐
       │                    └─►│ HR Approved  │
       │                       │ (can log in) │
       │                       └──────┬───────┘
       │                              │
       │                              │ Creates Job
       │                              ▼
       │                       ┌──────────────┐
       │                       │  Job Posted  │
       │              ┌───────►│  (isOpen)    │
       │              │        └──────┬───────┘
       │              │               │
       ▼              │               ▼
┌──────────────┐      │    ┌────────────────────┐
│ Browse Jobs  │      │    │ Candidates Apply   │
│ (public)     │──────┘    │ (upload resume)    │
└──────────────┘           └─────────┬──────────┘
                                     │
                                     ▼
                           ┌────────────────────┐
                           │  HR Reviews Apps   │
                           │  (view resumes)    │
                           └─────────┬──────────┘
                                     │
                          ┌──────────┼──────────┐
                          ▼          ▼          ▼
                    ┌──────────┐ ┌────────┐ ┌──────────┐
                    │Shortlist │ │ Reject │ │  Revert  │
                    └────┬─────┘ └────────┘ └──────────┘
                         │
                         ▼
                  Shortlisted ≥ Vacancies?
                    │            │
                   YES          NO
                    │            │
                    ▼            ▼
              Job Auto-     Job Stays
              Closes        Open
                    │
                    ▼
              All Applicants
              Notified via Email
```

---

> **SkillHive** — Connecting talent with opportunity.
