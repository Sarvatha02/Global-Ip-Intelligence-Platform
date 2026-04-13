# Global IP Intelligence Platform – Frontend

A **production-ready React frontend application** for the **Global IP Intelligence Platform**, built using **React 18 + Vite**, integrated with **Firebase Authentication (Google OAuth)**, a **JWT-secured Spring Boot backend**, and **AI-powered patent analysis**.

This frontend handles **UI, routing, authentication initiation, and API communication**.
All **authentication validation, authorization, and security enforcement** are handled by the backend.

---

## 📌 Project Information

* **Project Name:** Global IP Intelligence Platform
* **Module:** Frontend
* **Framework:** React 18
* **Build Tool:** Vite
* **Styling:** Tailwind CSS
* **Authentication:** Firebase (Google OAuth)
* **Authorization:** JWT (Backend generated)
* **Backend:** Spring Boot (Port `5001`)
* **AI Integration:** Google Gemini (via backend service layer) ⭐ **NEW**
* **Last Updated:** January 2026
* **Project Type:** Academic – Infosys Springboard
* **Status:** ✅ Complete & Stable

---

## 👥 Frontend Team Members

| Name               | Responsibility                                   |
| ------------------ | ------------------------------------------------ |
| **Abhay Tripathi** | Frontend–Backend Auth Flow, Firebase Integration, **AI Analysis UI** ⭐ |
| **Sarvatha R**     | UI Pages & Layout Structure                      |
| **Aarthi**         | Dashboard, Profile & Patent UI                   |

---

## 🎯 Purpose of Frontend

The frontend is responsible for:

* Rendering responsive UI
* Handling Google OAuth via Firebase
* Managing JWT lifecycle on client
* Calling secured backend APIs
* Displaying patent data & AI insights
* Protecting routes from unauthorized access
* **Natural language AI patent analysis** ⭐ **NEW**

⚠️ **Security Rule:**
Frontend never decides user validity – backend always verifies JWT.

---

## ✨ Key Features

### 🔐 Authentication

* Email/Password login
* Google Sign-In (Firebase)
* Backend-verified JWT tokens
* Auto logout on token expiry

### 📊 Dashboard

* User-specific dashboard
* Protected layout

### 🔍 Patent Module

* Patent listing
* New filing UI
* AI-based analysis page ⭐ **NEW**

### 👤 Profile & Settings

* View & update profile
* User settings management

### 🤖 AI Analysis ⭐ **NEW**

* **Natural language queries** - Ask questions about patents in plain English
* **Context-aware responses** - AI analyzes your actual database (filings, assets, jurisdictions)
* **Query history** - Review past AI conversations with timestamps
* **Rate limiting** - 20 queries per hour with visual feedback
* **Real-time analysis** - Sub-3-second response times
* **Smart error handling** - Graceful fallback on API failures

### 📱 Responsive Design

* Mobile-first UI
* Tailwind CSS based

---

## 🧠 High-Level Architecture

```
React UI
   ↓
Axios Client (JWT Interceptor)
   ↓
Spring Boot REST APIs
   ↓
PostgreSQL / Firebase
   ↓
Google Gemini AI ⭐ NEW
```

---

## 🛠️ Technology Stack

| Layer      | Technology      |
| ---------- | --------------- |
| UI         | React 18        |
| Build Tool | Vite            |
| Styling    | Tailwind CSS    |
| Routing    | React Router    |
| API Client | Axios           |
| Auth       | Firebase JS SDK |
| Tokens     | JWT             |
| AI         | Google Gemini ⭐ |

---

## 📋 Prerequisites

* Node.js ≥ 18
* npm or yarn
* Backend running on `http://localhost:5001`
* Firebase project with Google Sign-In enabled

---

## 📁 FRONTEND FOLDER STRUCTURE (UPDATED)

```
frontend/
│
├── node_modules/                # Installed dependencies (auto-generated)
│
├── src/
│   │
│   ├── api/
│   │   ├── ai.js                # ⭐ AI service integration (NEW)
│   │   ├── analytics.js         # Analytics API calls
│   │   ├── client.js            # Axios instance + JWT interceptor
│   │   ├── geoAPI.js            # Geographic data API
│   │   ├── ipAssets.js          # IP asset operations
│   │   ├── notifications.js     # Notification API
│   │   └── searchAPI.js         # Search functionality
│   │
│   ├── components/              # Application pages & layouts
│   │   ├── AdminMonitoringDashboard.jsx  # Admin system monitoring
│   │   ├── AnalysisPage.jsx              # ⭐ AI patent analysis UI (NEW)
│   │   ├── AuthLayout.jsx                # Public auth layout
│   │   ├── DashboardHome.jsx             # Dashboard landing
│   │   ├── DashboardLayout.jsx           # Protected layout
│   │   ├── FilingTrackerPage.jsx         # Filing status tracking
│   │   ├── LandingPage.jsx               # Public landing
│   │   ├── LandscapeVisualizationPage.jsx # IP landscape view
│   │   ├── LegalDashboardPage.jsx        # Legal analytics
│   │   ├── LoginPage.jsx                 # Login & OAuth
│   │   ├── MapViewPage.jsx               # Geographic visualization
│   │   ├── NewFilingPage.jsx             # New filing form
│   │   ├── PatentDetailsPage.jsx         # Patent details view
│   │   ├── PatentsPage.jsx               # Patent listing
│   │   ├── PaymentModal.jsx              # Subscription payment
│   │   ├── PricingPage.jsx               # Pricing plans
│   │   ├── ProfilePage.jsx               # User profile
│   │   ├── RegisterPage.jsx              # User registration
│   │   ├── SearchPage.jsx                # Search interface
│   │   ├── SearchResultsPage.jsx         # Search results display
│   │   └── SettingsPage.jsx              # User settings
│   │
│   ├── services/
│   │   └── ai.js                # ⭐ AI analysis service (NEW)
│   │
│   ├── utils/
│   │   ├── chartHelpers.jsx     # Chart utility functions
│   │   └── exportHelpers.js     # Data export utilities
│   │
│   ├── App.jsx                  # Route definitions & layouts
│   ├── firebase.js              # Firebase initialization
│   └── main.jsx                 # React entry point
│
├── .env                         # Environment variables (ignored)
├── .gitignore                   # Git ignore rules
├── index.html                   # Root HTML template
├── package.json                 # Scripts & dependencies
├── package-lock.json            # Dependency lock
├── postcss.config.js            # PostCSS config
├── tailwind.config.js           # Tailwind config
└── README.md                    # Frontend documentation
```

---

## ⚙️ Environment Configuration

Create a `.env` file in `frontend/`:

```env
VITE_API_BASE_URL=http://localhost:5001

VITE_FIREBASE_API_KEY=xxxx
VITE_FIREBASE_AUTH_DOMAIN=xxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=xxxx
VITE_FIREBASE_STORAGE_BUCKET=xxxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=xxxx
VITE_FIREBASE_APP_ID=1:xxx:web:xxx
```

⚠️ **Never commit `.env`**

---

## 🔐 Authentication Flow

### Google Login

```
User clicks Google Login
↓
Firebase signInWithPopup()
↓
Firebase ID Token generated
↓
POST /api/auth/firebase-login
↓
Backend verifies token
↓
Backend returns JWT
↓
JWT stored in localStorage
```

---

## 🔑 JWT Handling

* Stored in `localStorage`
* Auto-attached via Axios interceptor (`client.js`)
* Removed on:
  * Logout
  * 401 Unauthorized response

---

## 🛡️ Route Protection

Protected pages:

* Dashboard
* Patents
* Profile
* **Analysis (AI)** ⭐ **NEW**

Handled using:

* `DashboardLayout.jsx`
* JWT presence check
* Backend validation per request

---

## 🤖 AI Integration Details ⭐ **NEW**

### AI Service (`src/api/ai.js` & `src/services/ai.js`)

```javascript
import client from './client';

/**
 * Submit AI query for patent analysis
 * @param {string} query - Natural language question
 * @param {string} userId - Current user ID
 * @returns {Promise<Object>} AI response
 */
export const analyzeQuery = async (query, userId) => {
  try {
    const response = await client.post('/api/ai/analyze', {
      query,
      userId
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'AI analysis failed'
    };
  }
};

/**
 * Get user's AI query history
 * @param {string} userId - Current user ID
 */
export const getQueryHistory = async (userId) => {
  const response = await client.get(`/api/ai/history/${userId}`);
  return response.data;
};

/**
 * Delete specific query from history
 * @param {number} queryId - Query ID
 */
export const deleteQuery = async (queryId) => {
  await client.delete(`/api/ai/history/${queryId}`);
};
```

### AnalysisPage Component (`src/components/AnalysisPage.jsx`)

**Key Features:**
- Natural language input field (500 char limit)
- Real-time AI response display
- Query history with timestamps
- Rate limit indicator (20/hour)
- Error handling with user-friendly messages
- Loading states during API calls

**Example Usage:**
```javascript
import { analyzeQuery, getQueryHistory } from '../api/ai';

const AnalysisPage = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await analyzeQuery(query, userId);
    
    if (result.success) {
      setResponse(result.data.response);
      // Refresh history
    }
    
    setLoading(false);
  };

  // UI renders input, submit button, response, and history
};
```

### Backend API Endpoints Used

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/ai/analyze` | POST | Submit AI query |
| `/api/ai/history/{userId}` | GET | Get query history |
| `/api/ai/history/{queryId}` | DELETE | Delete query |

### AI Features

✅ **Natural Language Processing** - Ask questions like "What are my filing trends?"  
✅ **Context-Aware** - AI analyzes real database data (filings, assets, users)  
✅ **Query History** - All past queries saved with timestamps  
✅ **Rate Limiting** - 20 queries per hour per user  
✅ **Error Handling** - Graceful fallback on API failures  
✅ **Real-time** - Sub-3-second response times

---

## 🔗 Backend API Mapping

| Feature | Endpoint                 |
| ------- | ------------------------ |
| Auth    | `/api/auth/**`           |
| Users   | `/api/users/**`          |
| Patents | `/api/patents/**`        |
| Profile | `/api/profile/**`        |
| **AI Analysis** | `/api/ai/**` ⭐ **NEW** |
| Swagger | `/swagger-ui/index.html` |

---

## 🚀 Running the Application

```bash
npm install
npm run dev
```

Open browser:

```
http://localhost:5173
```

---

## 📦 Production Build

```bash
npm run build
npm run preview
```

Build output:

```
dist/
```

Deployable on:

* Vercel
* Netlify
* Nginx
* AWS S3

---

## 🔒 Security Best Practices

* No secrets in code
* JWT validated server-side
* Firebase used only for OAuth
* CORS restricted
* HTTPS required in production
* **AI queries rate-limited server-side** ⭐ **NEW**

---

## 📊 Final Status

| Module           | Status |
| ---------------- | ------ |
| UI Pages         | ✅      |
| Auth             | ✅      |
| Firebase         | ✅      |
| Backend Sync     | ✅      |
| **AI Integration**   | ✅ **NEW** |
| Production Ready | ✅      |

---

**Last Updated:** January 2026  
**Version:** 1.0.0  
**License:** Academic – Infosys Springboard  
**Status:** ✅ COMPLETE