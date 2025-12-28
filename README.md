# Gurusetu Frontend

## Overview
This is the frontend application for the Gurusetu platform, built with **Next.js**, **React**, **TypeScript**, and **Tailwind CSS**. It provides a modern, responsive user interface for students and faculty to collaborate, manage projects, and interact with the backend API.

---

## Table of Contents
- [Project Structure](#project-structure)
- [Features](#features)
- [Setup & Installation](#setup--installation)
- [Available Scripts](#available-scripts)
- [Key Files & Folders](#key-files--folders)
- [Development Notes](#development-notes)
- [Contributing](#contributing)
- [License](#license)

---

## Project Structure
```
frontend/
  public/           # Static assets (images, icons, etc.)
  src/
    app/            # Next.js app directory (routing, layouts, pages)
    components/     # Reusable React components
    context/        # React context providers (e.g., Auth)
    hooks/          # Custom React hooks
    services/       # API service functions
    types/          # TypeScript type definitions
  package.json      # Project metadata and scripts
  tailwind.config.js# Tailwind CSS configuration
  tsconfig.json     # TypeScript configuration
```

---

## Features
- **Authentication:** Login and signup for students and faculty
- **Dashboards:** Separate dashboards for students and faculty
- **Project Management:** View, create, and manage projects
- **Applications:** Apply to projects, view application status
- **Notifications:** Real-time notification system
- **Profile Management:** Edit and view user profiles
- **Support:** Support pages for help and feedback
- **Responsive Design:** Mobile-friendly UI with Tailwind CSS

---

## Setup & Installation
1. **Install Node.js (v18 or higher)**
2. Navigate to the frontend directory:
   ```sh
   cd frontend
   ```
3. Install dependencies:
   ```sh
   npm install
   ```
4. Start the development server:
   ```sh
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Available Scripts
- `npm run dev` — Start the development server
- `npm run build` — Build the app for production
- `npm start` — Start the production server
- `npm run lint` — Run ESLint for code quality

---

## Key Files & Folders
- **public/** — Static assets (e.g., images like amrita-buildings.png)
- **src/app/** — Next.js App Router directory:
   - **layout.tsx** — Root layout for all pages
   - **globals.css** — Global CSS (Tailwind base, custom utilities)
   - **page.tsx** — Landing page
   - **(auth)/** — Auth routes:
      - **login/page.tsx** — Login page
      - **signup/page.tsx** — Signup page
   - **dashboard/** — Main dashboard area:
      - **layout.tsx** — Dashboard layout
      - **faculty/** — Faculty dashboard:
         - **page.tsx** — Faculty dashboard home
         - **all-students/page.tsx** — List all students
         - **collaborations/page.tsx** — Faculty collaborations
         - **notifications/page.tsx** — Faculty notifications
         - **profile/page.tsx** — Faculty profile
         - **profile/research/page.tsx** — Faculty research section
         - **projects/page.tsx** — Faculty projects
         - **support/page.tsx** — Faculty support/help
      - **student/** — Student dashboard:
         - **page.tsx** — Student dashboard home
         - **all-faculty/page.tsx** — List all faculty
         - **applications/page.tsx** — Student project applications
         - **faculty/page.tsx** — Faculty list for students
         - **faculty/[id]/page.tsx** — Individual faculty profile
         - **notifications/page.tsx** — Student notifications
         - **profile/page.tsx** — Student profile
         - **profile/experience/page.tsx** — Student experience
         - **profile/interests/page.tsx** — Student interests
         - **projects/page.tsx** — Student projects
         - **support/page.tsx** — Student support/help
- **src/components/** — Reusable UI components:
   - **NotificationBell.tsx** — Notification bell with dropdown
   - **features/ProjectCard.tsx** — Project card display
- **src/context/AuthContext.tsx** — React context for authentication state and actions
- **src/hooks/useAuth.ts** — (Empty) Placeholder for custom authentication hook
- **src/services/** — API service modules:
   - **api.ts** — Axios instance with auth token handling
   - **authService.ts** — Signup and login API calls
   - **facultyDashboardService.ts** — Faculty dashboard data/services
   - **facultyProjectService.ts** — Faculty project management
   - **facultyService.ts** — Faculty info and summary
   - **notificationService.ts** — Notification API calls
   - **studentDashboardService.ts** — Student dashboard data/services
   - **userService.ts** — User profile management
- **src/types/** — TypeScript type definitions:
   - **user.ts** — User, Auth, Login, Signup types
   - **project.ts** — (Empty) Placeholder for project types
   - **dashboard.ts** — (Empty) Placeholder for dashboard types
- **package.json** — Project metadata, dependencies, and scripts
- **tailwind.config.js** — Tailwind CSS configuration
- **postcss.config.js** — PostCSS configuration for Tailwind
- **tsconfig.json** — TypeScript configuration and path aliases
- **next.config.mjs** — Next.js configuration
- **next-env.d.ts** — Next.js TypeScript environment declarations


## Development Notes
- **API Base URL:** Update the API base URL in `src/services/api.ts` if the backend runs on a different host/port.
- **Styling:** Uses Tailwind CSS for rapid UI development.
- **Routing:** Uses Next.js App Router (app directory structure).
- **Authentication:** Context-based authentication with JWT tokens.
- **Environment Variables:** Create a `.env.local` file for custom environment variables if needed.

---

## Contributing
1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Push to your branch
5. Open a Pull Request

---

## License
This project is licensed under the MIT License.
