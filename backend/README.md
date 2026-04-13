# 🌐 Global IP Intelligence Platform

> A full-stack platform for monitoring global intellectual property activity with AI-powered analytics and hybrid intelligence architecture.

![Java](https://img.shields.io/badge/Java-17+-orange.svg)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.3-brightgreen.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue.svg)
![License](https://img.shields.io/badge/license-Academic-lightgrey.svg)

---

## ✨ Features

- 🔍 **Dual-Source Search** - Toggle between live global patents (SerpAPI) and local repository
- 🔐 **Secure Authentication** - Email/Password + Google OAuth via Firebase
- 📊 **Real-Time Analytics** - Interactive dashboards with geographic visualization
- 🌍 **Multi-Jurisdictional** - Access USPTO, EPO, and WIPO patent data
- ⚡ **Smart Deduplication** - Automatic elimination of redundant records
- 🗺️ **Geographic Intelligence** - Regional patent cluster mapping
- 🔄 **Auto-Sync** - High-velocity API synchronization to local database

---

## 🏗️ System Architecture

### Hybrid Intelligence Design

```
┌─────────────────────────────────────────────────────────┐
│              User Search Query                           │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────▼───────────┐
         │  Source Selection     │
         │  (API vs Local)       │
         └───────────┬───────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
┌───────────────┐         ┌──────────────┐
│  source=api   │         │ source=local │
│               │         │              │
│  SerpAPI      │         │  PostgreSQL  │
│  Connector    │────────►│  Repository  │
│               │  Sync   │              │
│  • USPTO      │         │  • Cached    │
│  • EPO        │         │  • Fast      │
│  • WIPO       │         │  • Offline   │
└───────────────┘         └──────────────┘
```

---

## 👥 Team & Contributions

### 🔹 Module 1: Data Persistence & Integrity
**Lead Developer: Selvabarani K**

- **JPA Entity Modeling** - Designed schemas for `IPAsset`, `Filing`, `User`, and `Role`
- **Database Integration** - Configured PostgreSQL with automated schema migrations
- **Deduplication Logic** - Implemented `existsByAssetNumber` protocols
- **APIs Development** - Built RESTful endpoints with JWT/OAuth2 authentication

### 🔹 Module 2: External API & Analysis Engine
**Lead Developer: Bhuvaneswari N**

- **SerpAPI Connector** - Integrated Google Patents API via `ExternalIPService`
- **The Switch Alternative** - Developed source toggle in `SearchController`
- **Analytics Node** - Engineered `/analysis` endpoint and `DashboardService`
- **Backend Architecture** - Set up Spring Boot structure and configurations

### 🔹 Module 3: Firebase Authentication
**Lead Developer: Abhay Tripathi**

- **Firebase Integration** - Implemented Firebase Admin SDK
- **Google OAuth** - Set up Google Sign-In flow
- **Token Verification** - Server-side Firebase token validation

*Academic Project - Infosys Springboard 2025*

---

## 📂 Project Structure

```text
global-ip-backend/
├── src/main/java/com/project/backend/
│   ├── config/
│   │   ├── FirebaseConfig.java          # Firebase Admin SDK
│   │   ├── SecurityConfig.java          # Spring Security + JWT
│   │   └── CorsConfig.java              # CORS for port 5173
│   ├── controller/
│   │   ├── AuthController.java          # Authentication endpoints
│   │   ├── SearchController.java        # Unified Search & Analysis
│   │   ├── GeoController.java           # Geographic distribution
│   │   ├── DashboardController.java     # KPI metrics
│   │   └── UserController.java          # User management
│   ├── dto/
│   │   ├── LoginRequest.java
│   │   ├── RegisterRequest.java
│   │   ├── PatentDTO.java
│   │   └── GeoLocationDTO.java
│   ├── entity/
│   │   ├── User.java                    # User entity
│   │   ├── IPAsset.java                 # Patent/IP entity
│   │   ├── Filing.java                  # Filing records
│   │   └── Role.java                    # User roles
│   ├── repository/
│   │   ├── UserRepository.java
│   │   ├── IPAssetRepository.java       # Deduplication queries
│   │   └── FilingRepository.java
│   ├── service/
│   │   ├── UserService.java
│   │   ├── IPAssetService.java          # Sync & deduplication
│   │   ├── ExternalIPService.java       # SerpAPI client
│   │   ├── UnifiedSearchService.java    # Multi-source coordinator
│   │   └── DashboardService.java        # Analytics aggregation
│   └── util/
│       └── JwtUtil.java                 # JWT token utility
├── src/main/resources/
│   ├── application.properties           # Configuration
│   └── serviceAccountKey.json           # Firebase credentials (gitignored)
└── pom.xml                              # Maven dependencies
```

---

## 🚀 Quick Start

### Prerequisites
- Java 17+ (LTS)
- Maven 3.8+
- PostgreSQL 15+
- [SerpAPI Key](https://serpapi.com)
- Firebase Project (for OAuth)

### Installation

```bash
# Clone repository
git clone https://github.com/your-org/global-ipi-platform.git
cd global-ipi-platform/backend

# Create database
psql -U postgres -c "CREATE DATABASE ip_intelligence;"

# Configure application.properties
server.port=5001
api.serp.key=YOUR_SERPAPI_KEY_HERE
spring.datasource.url=jdbc:postgresql://localhost:5432/ip_intelligence
spring.datasource.username=postgres
spring.datasource.password=your_password
jwt.secret=your-256-bit-secret-key

# Build and run
mvn clean install
mvn spring-boot:run
```

Server starts at `http://localhost:5001` ✅

---

## 📡 API Endpoints

### Authentication APIs

```bash
# Register new user
POST /api/auth/register
Content-Type: application/json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "userType": "Individual"
}

# Login (Email/Password)
POST /api/auth/login
{ "email": "john@example.com", "password": "SecurePass123" }

# Login (Google OAuth)
POST /api/auth/firebase-login
{ "idToken": "firebase-token..." }
```

### IP Intelligence APIs

| Endpoint | Method | Parameters | Description |
|----------|--------|------------|-------------|
| `/api/search` | GET | `source=api&q=keyword` | Query SerpAPI (live global data) |
| `/api/search` | GET | `source=local&q=keyword` | Query local repository |
| `/api/search/analysis` | GET | - | Full dataset for analytics |
| `/api/geo/distribution` | GET | `q=keyword` | Geographic clusters for maps |
| `/api/dashboard/metrics` | GET | - | KPI and statistics |

**Example Requests:**

```bash
# Search via SerpAPI (auto-syncs to DB)
GET /api/search?source=api&q=artificial+intelligence
Authorization: Bearer {token}

# Search local repository
GET /api/search?source=local&q=blockchain
Authorization: Bearer {token}

# Get analytics for charts
GET /api/search/analysis
Authorization: Bearer {token}

# Geographic distribution
GET /api/geo/distribution?q=patents
Authorization: Bearer {token}
```

**Response Example:**

```json
{
  "results": [
    {
      "assetNumber": "US10123456B2",
      "title": "Machine Learning System",
      "inventor": "John Smith",
      "assignee": "Tech Corp",
      "filingDate": "2023-01-15",
      "status": "Granted",
      "jurisdiction": "US"
    }
  ],
  "totalCount": 42,
  "source": "api"
}
```

---

## 🗄️ Database Schema

### Core Tables

```sql
-- Users Table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    user_type VARCHAR(50) DEFAULT 'Individual',
    auth_provider VARCHAR(20) DEFAULT 'LOCAL',
    firebase_uid VARCHAR(255) UNIQUE,
    role VARCHAR(20) DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- IP Assets Table
CREATE TABLE ip_assets (
    id BIGSERIAL PRIMARY KEY,
    asset_number VARCHAR(255) UNIQUE NOT NULL,
    title TEXT NOT NULL,
    inventor VARCHAR(500),
    assignee VARCHAR(500),
    filing_date DATE,
    publication_date DATE,
    status VARCHAR(50),
    jurisdiction VARCHAR(10),
    abstract TEXT,
    source VARCHAR(20) DEFAULT 'API',
    synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Filings Table
CREATE TABLE filings (
    id BIGSERIAL PRIMARY KEY,
    asset_id BIGINT REFERENCES ip_assets(id),
    filing_type VARCHAR(100),
    filing_date DATE NOT NULL,
    office VARCHAR(50),
    status VARCHAR(50)
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX idx_asset_number ON ip_assets(asset_number);
CREATE INDEX idx_status ON ip_assets(status);
CREATE INDEX idx_jurisdiction ON ip_assets(jurisdiction);
```

---

## 🛡️ Security & Validation

### Security Features

- **JWT Authentication** - 24-hour token expiry with HMAC-SHA256
- **BCrypt Encryption** - Secure password hashing (10 salt rounds)
- **Firebase Verification** - Server-side token validation
- **CORS Protection** - Configured for React frontend (port 5173)
- **Role-Based Access** - USER, ADMIN, PATENT_EXAMINER roles

### Data Validation

- **Duplicate Guard** - `existsByAssetNumber` prevents redundant records
- **Zero-State Protection** - Frontend handles empty search results
- **Input Sanitization** - JPA prepared statements prevent SQL injection
- **Token Expiry** - Automatic session management

---

## 🧪 Testing

### Quick Tests with cURL

```bash
# 1. Register user
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"Test123"}'

# 2. Login and get token
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123"}'

# 3. Search patents (replace {TOKEN})
curl -X GET "http://localhost:5001/api/search?source=api&q=AI" \
  -H "Authorization: Bearer {TOKEN}"

# 4. Get analytics
curl -X GET http://localhost:5001/api/search/analysis \
  -H "Authorization: Bearer {TOKEN}"
```

### Run Unit Tests

```bash
mvn test
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 5001 already in use | `lsof -ti:5001 \| xargs kill -9` or change port |
| Database connection failed | `sudo service postgresql start` |
| Firebase initialization error | Verify project ID in `FirebaseConfig.java` |
| JWT token expired | Re-login to get new token (24hr expiry) |
| CORS error | Add frontend URL to `cors.allowed-origins` |
| SerpAPI quota exceeded | Wait for reset or upgrade plan |
| Duplicate entries | Check `existsByAssetNumber` logic |

**Enable debug logging:**

```properties
logging.level.com.project.backend=DEBUG
logging.level.org.springframework.security=INFO
```

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Backend** | Spring Boot 3.2.3, Java 17 |
| **Database** | PostgreSQL 15+, Hibernate JPA |
| **Security** | Spring Security, JWT (JJWT 0.11.5), Firebase Admin SDK 9.2.0 |
| **APIs** | SerpAPI (Google Patents) |
| **Build Tool** | Maven 3.8+ |
| **Frontend Integration** | CORS enabled for React/Vite (port 5173) |

---

## 📞 Contact & Support

**Repository:** [global-ipi-platform](https://github.com/your-org/global-ipi-platform)  
**Branch:** team-five  
**Organization:** Infosys Springboard

**Team Contacts:**
- **Selvabarani K** - Data Persistence & APIs
- **Bhuvaneswari N** - External APIs & Analytics
- **Abhay Tripathi** - Firebase & OAuth

---

## 🎯 Key Achievements

✅ Dual-source patent search (API + Local)  
✅ Firebase + JWT authentication system  
✅ Auto-sync with deduplication  
✅ Real-time analytics dashboard  
✅ Geographic distribution mapping  
✅ Multi-jurisdictional data support  
✅ Zero-redundancy data persistence  
✅ Production-ready security

---

**Last Updated:** December 26, 2025  
**Version:** 1.0.0  
**Status:** ✅ Production Ready

*Developed for Global IP Intelligence Standards 2025*