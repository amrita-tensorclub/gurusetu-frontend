
# GuruSetu Frontend 💻

> **The immersive, responsive interface for GuruSetu: The AI-Academic Talent Marketplace.**

## 📖 Overview

This repository contains the client-side application for **GuruSetu**. Built with **Next.js (App Router)** and **TypeScript**, it delivers a high-performance, Server-Side Rendered (SSR) experience. It serves as the bridge between students and faculty, offering real-time dashboards, interactive project discovery, and seamless integration with our AI-powered backend.

## 🏗 Architecture

The frontend uses a modular, component-driven architecture designed for scalability and speed.

* **Next.js App Router:** Utilizes React Server Components for faster initial page loads and improved SEO.
* **Service Layer Pattern:** API calls are abstracted into a dedicated `services/` directory, ensuring clean separation of concerns.
* **Context API:** Manages global state for user authentication and UI themes.
* **Responsive Design:** Fully optimized for desktop, tablet, and mobile views.

## 🛠 Tech Stack

* **Framework:** Next.js 14 (App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS / CSS Modules (Global styles in `globals.css`)
* **State Management:** React Context API
* **Data Fetching:** Axios / Fetch API (via Service Layer)
* **Icons:** Lucide React / React Icons

---

## 📂 Project Structure

Based on our production deployment:

```bash
frontend/
├── src/
│   ├── app/
│   │   ├── (auth)/            # Login & Register route groups
│   │   ├── dashboard/
│   │   │   ├── faculty/       # Faculty: Create projects, view applicants
│   │   │   └── student/       # Student: Profile, find mentors, track apps
│   │   ├── globals.css        # Global styling
│   │   └── layout.tsx         # Root layout structure
│   ├── components/            # Reusable UI (Buttons, Cards, Modals)
│   ├── context/               # AuthContext, NotificationContext
│   ├── hooks/                 # Custom React hooks
│   └── services/              # API Integration Layer
│       ├── api.ts             # Axios instance & interceptors
│       ├── authService.ts     # Login/Signup logic
│       ├── facultyService.ts  # Project & student management
│       └── facultyDashboardService.ts
├── public/                    # Static assets
└── package.json               # Dependencies

```

---

## ⚡ Key Modules

### 1. The Faculty Dashboard (`/dashboard/faculty`)

A command center for professors to manage their research lab.

* **Talent Scout:** View AI-recommended students sorted by compatibility score.
* **Project Management:** Create and edit research openings.
* **Incoming Applications:** Review and accept/reject student applications in real-time.

### 2. The Student Hub (`/dashboard/student`)

A unified profile and discovery platform for students.

* **Smart Feed:** Personalized project recommendations based on the user's skillset.
* **Application Tracker:** Live status updates (Applied -> Under Review -> Accepted).
* **Profile Builder:** Dynamic resume creation that feeds into the backend vector engine.

### 3. Service Integration (`/services`)

We use a centralized service pattern to handle communication with the FastAPI backend.

* `api.ts`: Configures base URLs and attaches JWT tokens to requests automatically.
* `facultyService.ts`: Handles data fetching for research collaborations.

---

## 🚀 Getting Started

### Prerequisites

* Node.js 18+
* npm or yarn

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/yourusername/gurusetu-frontend.git
cd gurusetu-frontend

```


2. **Install Dependencies:**
```bash
npm install
# or
yarn install

```


3. **Environment Configuration:**
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000  # URL of your FastAPI Backend

```



### Running the Application

Start the development server:

```bash
npm run dev

```

Visit `http://localhost:3000` to see the application live.

---

## 🤝 Integration with Backend

This frontend is designed to work seamlessly with the [GuruSetu Backend](https://www.google.com/search?q=https://github.com/yourusername/gurusetu-backend). Ensure the backend server is running on port `8000` (or update the `.env` file accordingly) for full functionality, including AI recommendations and authentication.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

*Built with ❤️ by Team GuruSetu*
