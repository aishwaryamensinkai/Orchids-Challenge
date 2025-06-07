# Orchids Challenge Project

This repository contains the solution for the Orchids SWE Internship Take Home Challenge.

## Project Structure

```
.
├── Archive.zip
├── Orchids SWE Internship Take Home.pdf
├── orchids-challenge
│   ├── backend
│   │   ├── __pycache__
│   │   │   ├── browser_manager.cpython-311.pyc
│   │   │   ├── main.cpython-311.pyc
│   │   │   └── main.cpython-313.pyc
│   │   ├── assets
│   │   ├── main.py
│   │   ├── pyproject.toml
│   │   ├── README.md
│   │   ├── requirements.txt
│   │   └── uv.lock
│   ├── frontend
│   │   ├── eslint.config.mjs
│   │   ├── next-env.d.ts
│   │   ├── next.config.ts
│   │   ├── package-lock.json
│   │   ├── package.json
│   │   ├── postcss.config.mjs
│   │   ├── public
│   │   │   ├── file.svg
│   │   │   ├── globe.svg
│   │   │   ├── next.svg
│   │   │   ├── vercel.svg
│   │   │   └── window.svg
│   │   ├── README.md
│   │   ├── src
│   │   │   └── app
│   │   │       ├── components
│   │   │       ├── favicon.ico
│   │   │       ├── globals.css
│   │   │       ├── layout.tsx
│   │   │       ├── page.tsx
│   │   │       ├── types.ts
│   │   │       └── utils
│   │   └── tsconfig.json
│   └── README.md
└── Video.mp4
```

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js (v18+ recommended)
- npm or yarn
- [Git LFS](https://git-lfs.github.com/) (for large files)

### Clone the Repository
```sh
git clone https://github.com/aishwaryamensinkai/Orchids-Challenge.git
cd Orchids-Challenge
git lfs pull  # Download large files
```

### Backend Setup
```sh
cd orchids-challenge/backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
# or use: pip install -e .
```

### Frontend Setup
```sh
cd orchids-challenge/frontend
npm install
npm run dev
```

## Notes
- Do **not** commit secrets or API keys. Use a `.env` file locally and add it to `.gitignore`.
- Large files (e.g., `Archive.zip`, `Video.mp4`) are tracked with Git LFS.
- For more details, see the `README.md` files in the `backend` and `frontend` folders.

## License
This project is for the Orchids SWE Internship Take Home Challenge.
