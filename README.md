# PhotoFinder - AI-Powered Campus Photo Discovery System

A full-stack web application that helps university students find their photos from campus events using AI-powered face recognition technology.

## Features

- **AI Face Recognition**: Upload a selfie to find yourself in event photos
- **Event Management**: Admins can create and manage campus events
- **Photo Upload**: Photographers can bulk upload event photos
- **Privacy Controls**: GDPR/PDPA compliant with opt-in/opt-out controls
- **Photo Removal Requests**: Students can request removal of photos
- **Real-time Monitoring**: Grafana dashboards for system health
- **Responsive Design**: Works seamlessly on desktop and mobile

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- Next.js 14 (React)
- TypeScript
- Tailwind CSS
- Shadcn/ui Components

**Backend:**
- NestJS (Node.js)
- PostgreSQL (Database)
- Prisma ORM
- Weaviate (Vector Database for AI)
- MinIO (Object Storage)

**AI Service:**
- Python FastAPI
- InsightFace (Face Detection & Recognition)
- ArcFace (buffalo_l model)
- OpenCV

**Monitoring:**
- Prometheus (Metrics)
- Grafana (Dashboards)

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop/)
- **Git** - [Download](https://git-scm.com/)
- **npm** or **pnpm** (npm comes with Node.js, pnpm: `npm install -g pnpm`)

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/photofinder-app.git hello
cd hello
```

### 2. Start Docker Services

Start all backend services (Database, AI, Storage, Monitoring):

```bash
cd api
docker-compose up -d
```

This will start:
- PostgreSQL (Port 5432)
- Weaviate Vector DB (Port 8080)
- MinIO Object Storage (Port 9000, Console: 9001)
- AI Service (Port 8000)
- Prometheus (Port 9090)
- Grafana (Port 3002)

**Verify containers are running:**
```bash
docker ps
```

You should see 6 containers running.

### 3. Set Up the Backend API

```bash
# Navigate to API directory (if not already there)
cd api

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env if needed (default values work for local development)

# Run database migrations
npx prisma migrate dev

# Generate Prisma Client
npx prisma generate

# Start the backend server
npm run start:dev
```

The backend API will be running at `http://localhost:3000`

### 4. Set Up the Frontend

Open a **new terminal window**:

```bash
cd photofinder-nextjs

# Install dependencies (choose one)
npm install
# or
pnpm install

# Start the development server
npm run dev
# or
pnpm dev
```

The frontend will be running at `http://localhost:3001`

### 5. Access the Application

- **Frontend App**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **Grafana Monitoring**: http://localhost:3002 (admin/admin)
- **MinIO Console**: http://localhost:9001 (minioadmin/minioadmin)
- **Prometheus**: http://localhost:9090

## Configuration

### Environment Variables

#### Backend (`api/.env`)

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/facesearch?schema=public"
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=facesearch

# MinIO (Object Storage)
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin
MINIO_BUCKET_NAME=photos

# AI Service
AI_SERVICE_URL=http://localhost:8000

# Weaviate (Vector DB)
WEAVIATE_URL=http://localhost:8080

# Server
PORT=3000
```

#### Frontend (`photofinder-nextjs/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Database Setup

The database will be automatically created when you run `docker-compose up`. To reset the database:

```bash
cd api

# Stop containers
docker-compose down

# Remove volumes (WARNING: This deletes all data)
docker-compose down -v

# Restart
docker-compose up -d

# Re-run migrations
npx prisma migrate dev
```

## User Roles & Demo Accounts

The application has three user roles:

### 1. **Student** (Default)
- Browse photos from events
- Search for photos using face recognition
- Save favorite photos
- Request photo removal
- Manage privacy settings

**Demo Login:**
- Go to http://localhost:3001/login
- Click "Sign In as Student"
- Click "Sign In with University SSO"

### 2. **Photographer**
- Upload photos to events
- View upload history
- All student features

**Demo Login:**
- Go to http://localhost:3001/login
- Click "Sign In as Photographer"
- Click "Sign In with University SSO"

### 3. **Admin**
- Create and manage events
- View all photos
- Approve/reject removal requests
- Access system health dashboard
- All other features

**Demo Login:**
- Go to http://localhost:3001/admin/login
- Email: `admin@university.edu`
- Password: `admin123`

## Monitoring & Analytics

### Grafana Dashboards

Access Grafana at http://localhost:3002

**Default Credentials:**
- Username: `admin`
- Password: `admin`

**Available Dashboards:**
- System Health Overview
- AI Model Performance
- Database Statistics
- Photo Processing Metrics

### Prometheus Metrics

Access raw metrics at http://localhost:9090

Available metrics:
- `ai_confidence_score` - Face detection confidence
- `photo_processing_duration` - Photo processing time
- Database query performance

## Project Structure

```
hello/
├── api/                          # Backend (NestJS)
│   ├── src/
│   │   ├── admin/               # Admin endpoints
│   │   ├── ai/                  # AI service integration
│   │   ├── events/              # Event management
│   │   ├── photos/              # Photo management
│   │   ├── users/               # User management
│   │   ├── search/              # Face search
│   │   ├── metrics/             # Prometheus metrics
│   │   └── prisma/              # Database service
│   ├── prisma/
│   │   └── schema.prisma        # Database schema
│   ├── docker-compose.yml       # Docker services
│   └── package.json
│
├── photofinder-nextjs/          # Frontend (Next.js)
│   ├── app/                     # App router pages
│   │   ├── admin/              # Admin dashboard
│   │   ├── browse/             # Browse photos
│   │   ├── search/             # Face search
│   │   ├── dashboard/          # User dashboard
│   │   └── settings/           # User settings
│   ├── components/             # React components
│   ├── lib/                    # Utilities
│   └── package.json
│
├── ai-service/                  # AI Service (Python)
│   ├── main.py                 # FastAPI server
│   ├── requirements.txt        # Python dependencies
│   └── Dockerfile
│
└── README.md                    # This file
```

## Development Workflow

### Running in Development Mode

**Terminal 1 - Docker Services:**
```bash
cd api
docker-compose up
```

**Terminal 2 - Backend:**
```bash
cd api
npm run start:dev
```

**Terminal 3 - Frontend:**
```bash
cd photofinder-nextjs
npm run dev
# or: pnpm dev
```

### Database Management

**View database in Prisma Studio:**
```bash
cd api
npx prisma studio
```

**Create a new migration:**
```bash
cd api
npx prisma migrate dev --name your_migration_name
```

**Reset database:**
```bash
cd api
npx prisma migrate reset
```

## Testing the Application

### 1. Test Photo Upload (as Photographer)

1. Login as Photographer
2. Go to http://localhost:3001/photographer
3. Select an event (or create one as Admin first)
4. Upload test photos
5. Wait for AI processing (check System Health dashboard)

### 2. Test Face Search (as Student)

1. Login as Student
2. Go to http://localhost:3001/search
3. Upload a selfie
4. View matched photos

### 3. Test Admin Dashboard

1. Login as Admin
2. Go to http://localhost:3001/admin/dashboard
3. Create a new event
4. View system health metrics
5. Manage removal requests

## Troubleshooting

### Docker containers won't start

```bash
# Check Docker Desktop is running
docker ps

# Restart Docker Desktop
# Then try again:
cd api
docker-compose down
docker-compose up -d
```

### Database connection errors

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Check connection string in .env
# Should be: postgresql://postgres:postgres@localhost:5432/facesearch
```

### AI Service not responding

```bash
# Check AI service logs
docker logs face_search_ai

# Rebuild AI service
cd api
docker-compose down
docker-compose up -d --build ai-service
```

### Frontend can't connect to backend

1. Verify backend is running: http://localhost:3000
2. Check `NEXT_PUBLIC_API_URL` in `photofinder-nextjs/.env.local`
3. Check CORS settings in `api/src/main.ts`

### Port already in use

If you see "Port already in use" errors:

```bash
# Find what's using the port (example for port 3000)
lsof -i :3000

# Kill the process
kill -9 <PID>
```

---
