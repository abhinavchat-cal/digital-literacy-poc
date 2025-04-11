# Digital Literacy Platform

A full-stack POC application for managing a government-led Digital Literacy Campaign in Himachal Pradesh, with separate login flows and dashboards for Candidate, Trainer, and Admin roles.

## Tech Stack

- **Backend**: FastAPI (Python 3.11), PostgreSQL, SQLAlchemy, Alembic, Poetry
- **Frontend**: React (TypeScript), Vite, TailwindCSS
- **Infrastructure**: Docker, Kubernetes
- **Authentication**: JWT

## Local Development

### Prerequisites

- Python 3.11+
- Node.js 20+
- PostgreSQL 14+
- Docker and Docker Compose (optional)
- Poetry (for backend dependency management)

### Without Docker

1. **Backend Setup**
   ```bash
   # Install Poetry if not already installed
   curl -sSL https://install.python-poetry.org | python3 -

   # Navigate to backend directory
   cd backend

   # Install dependencies using Poetry
   poetry install

   # Activate the virtual environment
   poetry shell

   # Set up environment variables
   export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/digital_literacy
   export SECRET_KEY=your-secret-key-here
   export ALGORITHM=HS256
   export ACCESS_TOKEN_EXPIRE_MINUTES=30

   # Run database migrations
   poetry run alembic upgrade head

   # Start the backend server
   poetry run uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   npm install

   # Set up environment variables
   export VITE_API_URL=http://localhost:8000/api/v1

   # Start the development server
   npm run dev
   ```

### With Docker

1. **Build and Run**
   ```bash
   # Start all services
   docker compose up --build

   # Access the application
   Frontend: http://localhost:80
   Backend API: http://localhost:8000
   API Documentation: http://localhost:8000/docs
   ```

2. **Environment Variables**
   The following environment variables are used in the Docker setup:

   ```bash
   # Backend
   DATABASE_URL=postgresql://postgres:postgres@db:5432/digital_literacy
   SECRET_KEY=your-secret-key-here
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30

   # Frontend
   VITE_API_URL=http://localhost:8000/api/v1
   ```

## Kubernetes Deployment (KubeSphere)

### Prerequisites

- KubeSphere cluster access
- kubectl configured
- Helm 3+

### Deployment Steps

1. **Create Namespace**
   ```bash
   kubectl create namespace digital-literacy
   ```

2. **Create Secrets**
   ```bash
   # Create a secret for database credentials
   kubectl create secret generic db-secrets \
     --namespace digital-literacy \
     --from-literal=POSTGRES_USER=postgres \
     --from-literal=POSTGRES_PASSWORD=postgres \
     --from-literal=POSTGRES_DB=digital_literacy

   # Create a secret for backend configuration
   kubectl create secret generic backend-secrets \
     --namespace digital-literacy \
     --from-literal=SECRET_KEY=your-secret-key-here \
     --from-literal=ALGORITHM=HS256 \
     --from-literal=ACCESS_TOKEN_EXPIRE_MINUTES=30
   ```

3. **Deploy PostgreSQL**
   ```bash
   # Create persistent volume claim
   kubectl apply -f k8s/postgres-pvc.yaml

   # Deploy PostgreSQL
   kubectl apply -f k8s/postgres-deployment.yaml
   kubectl apply -f k8s/postgres-service.yaml
   ```

4. **Deploy Backend**
   ```bash
   # Build and push Docker image
   docker build -t your-registry/digital-literacy-backend:latest ./backend
   docker push your-registry/digital-literacy-backend:latest

   # Deploy backend
   kubectl apply -f k8s/backend-deployment.yaml
   kubectl apply -f k8s/backend-service.yaml
   ```

5. **Deploy Frontend**
   ```bash
   # Build and push Docker image
   docker build -t your-registry/digital-literacy-frontend:latest ./frontend
   docker push your-registry/digital-literacy-frontend:latest

   # Deploy frontend
   kubectl apply -f k8s/frontend-deployment.yaml
   kubectl apply -f k8s/frontend-service.yaml
   ```

6. **Configure Ingress**
   ```bash
   # Deploy ingress
   kubectl apply -f k8s/ingress.yaml
   ```

### KubeSphere Specific Configuration

1. **Create Project**
   - Log in to KubeSphere console
   - Create a new project named "digital-literacy"
   - Set appropriate resource quotas

2. **Deploy Applications**
   - Use KubeSphere's application deployment wizard
   - Import the Kubernetes manifests from the `k8s` directory
   - Configure the following:
     - Container registry credentials
     - Resource limits and requests
     - Health checks
     - Auto-scaling policies

3. **Configure Routes**
   - Set up ingress rules in KubeSphere
   - Configure SSL certificates
   - Set up custom domains

4. **Monitoring and Logging**
   - Enable KubeSphere's monitoring features
   - Configure log collection
   - Set up alerts

## Project Structure

```
.
├── backend/
│   ├── app/
│   │   ├── core/         # Core functionality
│   │   ├── models/       # Database models
│   │   ├── routers/      # API routes
│   │   ├── schemas/      # Pydantic models
│   │   └── services/     # Business logic
│   ├── alembic/          # Database migrations
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   └── contexts/     # React contexts
│   └── Dockerfile
├── k8s/                  # Kubernetes manifests
└── docker-compose.yml
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 