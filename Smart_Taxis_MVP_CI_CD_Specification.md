# Smart Taxis MVP Specification with CI/CD

**Purpose:** Minimal taxi booking system with driver assignment, mission management, dummy data, and automated deployment.

## 1. MVP Features

Everything from the previous MVP remains, with CI/CD integration added:

- **Client Booking Flow** (form submission, fare calculation)
- **Driver Assignment** (first available driver)
- **Mission Execution** (status updates simulated)
- **Dummy data** for Drivers, Bookings, and Missions
- **Web interface:** EJS + Bootstrap 5
- **Console log notifications**
- **CI/CD pipeline:** VS Code → GitHub → Dokploy

## 2. CI/CD Workflow

### 2.1 Development & Version Control

- **IDE:** Visual Studio Code
- **Version Control:** Git
- **Repository:** GitHub
- **Branch Strategy:**
  - `main` (production-ready)
  - `develop` (latest development)
  - `feature/*` (new features or fixes)

### 2.2 Continuous Integration (CI)

- **Trigger:** Push to `develop` or `feature/*` branches
- **Steps:**
  1. Pull latest code from GitHub
  2. Install dependencies: `npm install`
  3. Run unit tests (if any)
  4. Lint/format code with ESLint/Prettier
- **Tools:** GitHub Actions or Dokploy CI

### 2.3 Continuous Deployment (CD)

- **Trigger:** Merge to `main` branch
- **Steps:**
  1. Dokploy pulls code from GitHub `main` branch
  2. Install dependencies: `npm install`
  3. Run build (if needed)
  4. Restart Node.js server (`pm2` recommended)
  5. Deployment logs available in Dokploy dashboard
- **Environment Variables:** Stored in Dokploy (`.env`) for API keys, dummy data paths, or production configs

## 3. Deployment Architecture

```
VS Code (dev)
     ↓ push
GitHub repository (version control + CI triggers)
     ↓ Dokploy CI/CD
Server (Node.js app hosted)
     ↓ Browser / Client
Web interface (booking, missions, status)
```

- Dokploy manages automatic pulls, builds, and server restarts on new `main` merges
- Environment variables separated per environment (development, production)
- Can extend to include staging branch for QA before main deployment

## 4. CI/CD Implementation Steps

### Initialize Git in project

```bash
git init
git add .
git commit -m "Initial MVP commit"
git branch -M main
git remote add origin <github-repo-url>
git push -u origin main
```

### Set up Dokploy

1. Connect GitHub repository in Dokploy
2. Add environment variables:
   - `PORT=3000`
   - `NODE_ENV=production`
3. Configure Dokploy to pull from `main` branch on every push

### Optional GitHub Actions (CI)

```yaml
name: Node.js CI
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Use Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm run lint
      - run: npm test
```

### Dokploy Deployment

- **Automatic:** triggers on merge to main
- Installs dependencies, builds, and restarts Node.js app

## 5. MVP CI/CD Summary Table

| Stage | Tool | Action |
|-------|------|--------|
| Development | VS Code | Code editing, local testing |
| Version Control | Git + GitHub | Branching, commits, pull requests |
| CI | GitHub Actions / Dokploy | Install, lint, test |
| CD | Dokploy | Pull, install, build, restart server |
| Production | Dokploy server | Runs Node.js app, accessible via web |

## 6. MVP Flow with CI/CD

1. **Developer edits code in VS Code** → commits to feature branch
2. **Push to GitHub** → CI runs lint/tests
3. **Merge to main** → Dokploy automatically pulls, installs, builds, and restarts server
4. **MVP is live with dummy data** → booking, driver assignment, and mission workflow functional
5. **Logs & updates available** for monitoring

---

✅ **This MVP now includes a full CI/CD stack**, allowing developers to continuously develop, test, and deploy the Smart Taxis MVP safely.

### Optional: Visual Diagram

If you want, I can draw a detailed visual diagram showing:
- Client → Booking → Driver → Mission workflow
- VS Code → GitHub → Dokploy CI/CD

It will combine both functional flow and deployment flow. Do you want me to create that diagram?