# Orchids SWE Intern Challenge Template

This project is a full-stack web application for website design context extraction and cloning, built with a **FastAPI** backend and a **Next.js + TypeScript** frontend.

---

## Project Overview

- **Clone and analyze any public website**: Enter a URL, extract design context (colors, fonts, layout, assets), and preview a cloned HTML version.
- **Modern stack**: FastAPI (Python) backend, Next.js (TypeScript) frontend.
- **LLM-powered**: Uses AI models to generate HTML based on extracted design context.

---

## Folder Structure

```
orchids-challenge/
├── backend/    # FastAPI backend (API, scraping, LLM integration)
├── frontend/   # Next.js frontend (UI, preview, design context display)
└── README.md   # This file
```

---

## Prerequisites

- **Python 3.8+** (for backend)
- **Node.js v18+ & npm** (for frontend)
- (Recommended) [uv](https://github.com/astral-sh/uv) for Python dependency management

---

## Backend Setup

See [`backend/README.md`](./backend/README.md) for full details.

### 1. Install dependencies

```bash
cd backend
uv sync
```

### 2. Environment setup

- Create a `.env` file in `backend/` with your API keys (see backend README for details).

### 3. Run the backend server

```bash
uv run fastapi dev
```

- Or, for standard FastAPI/uvicorn:
  ```bash
  uvicorn main:app --reload
  ```
- API docs available at [http://localhost:8000/docs](http://localhost:8000/docs)

---

## Frontend Setup

See [`frontend/README.md`](./frontend/README.md) for full details.

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Environment setup

- By default, the frontend expects the backend at `http://localhost:8000`.
- To change this, create a `.env.local` in `frontend/`:
  ```env
  NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
  ```

### 3. Run the frontend server

```bash
npm run dev
```

- App runs at [http://localhost:3000](http://localhost:3000)

---

## Connecting Frontend & Backend

- The frontend makes API requests to the backend (URL set via `NEXT_PUBLIC_BACKEND_URL`).
- Both servers must be running for full functionality.

---

## Example Workflow

1. **Start the backend** (`uv run fastapi dev` in `backend/`)
2. **Start the frontend** (`npm run dev` in `frontend/`)
3. **Open the app** at [http://localhost:3000](http://localhost:3000)
4. **Enter a public website URL** and submit
5. **View the extracted design context and preview the cloned HTML**

---

## More Information

- [Backend README](./backend/README.md): API endpoints, environment, troubleshooting, contributing
- [Frontend README](./frontend/README.md): UI usage, customization, API contract, troubleshooting

---

## Contributing

1. Fork the repository
2. Create a new branch for your feature or fix
3. Make your changes and commit with clear messages
4. Push your branch and open a pull request

---

## License

This project is licensed under the MIT License. See the LICENSE file for details.
