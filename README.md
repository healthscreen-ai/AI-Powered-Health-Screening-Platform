# AI-Powered Health Screening Platform

![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python&logoColor=white)
![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=0b1020)
![FastAPI](https://img.shields.io/badge/FastAPI-API-009688?logo=fastapi&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?logo=docker&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?logo=postgresql&logoColor=white)

## Overview

AI-Powered Health Screening Platform is a full-stack web application built to
deliver AI-assisted preliminary health assessments for rural and underserved
communities. It combines a React frontend, FastAPI backend, PostgreSQL
persistence, and machine learning workflows for symptom screening, skin-image
screening, and longitudinal health history.

The platform is designed to reduce access barriers, surface early screening
signals, and guide users toward timely follow-up care. It is intended as a
supportive educational and triage tool, not as a replacement for licensed
medical professionals.

## Features

- Secure JWT-based authentication for registration, login, and protected routes
- Symptom checker workflow powered by a trained Scikit-learn model
- Image diagnosis workflow powered by a fine-tuned ResNet18 model
- Personal dashboard with assessment history and condition trend charting
- Dockerized frontend, backend, and PostgreSQL stack for local deployment
- Clean Vite + React UI optimized for approachable healthcare workflows

## Tech Stack

- React
- FastAPI
- PostgreSQL
- PyTorch
- Scikit-learn
- Docker

## Quick Start With Docker

```bash
git clone https://github.com/sam15-ai/AI-Powered-Health-Screening-Platform.git
cd AI-Powered-Health-Screening-Platform
cp .env.example .env
docker-compose up --build
```

After startup:

- Frontend: `http://localhost`
- Backend API: `http://127.0.0.1:8001`
- PostgreSQL: `localhost:5432`

## Local Development Setup

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Environment Variables

Create a root `.env` file from `.env.example` and adjust values for your local
setup:

```bash
cp .env.example .env
```

## Folder Structure

```text
health-screening-platform/
├── frontend/         # React.js app powered by Vite
├── backend/          # FastAPI app and backend modules
├── ml_models/        # ML training scripts and saved models
├── database/         # SQL schema files
├── docker/           # Dockerfiles and Nginx config
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

## Contributing

Contributions are welcome. To contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes with clear commits
4. Open a pull request describing the update and rationale

When working on healthcare-related features, prioritize accessibility, privacy,
ethical AI usage, and safe communication of risk.

## Future Improvements

- Multilingual support
- Real ISIC dermatology dataset integration
- SMS alerts for urgent screening follow-up
- Mobile app experience for low-bandwidth communities

## Disclaimer

This project provides AI-assisted preliminary screening support for educational
and workflow purposes only. It is not a medical diagnosis tool and must not be
used as a substitute for professional medical advice, diagnosis, or treatment.
