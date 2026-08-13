# LegalFlow — AI Law Firm Client Intake & Routing MVP

LegalFlow is a production-quality legal client intake qualification and routing system. It is designed to capture prospective client details, classify their legal matter, dynamically extract key parameters, assess case urgency, run conflict checks, route cases deterministically to specialized lawyer teams, and dispatch email and Telegram notifications—all within a premium, editorial, warm neutral user experience.

Positioning: **"Professional legal intake, intelligently organized."**

---

## ⚖️ Technology Stack

* **Frontend**: React, Next.js (App Router), TypeScript, Tailwind CSS, Framer Motion
* **Backend**: Node.js, Express, TypeScript, Prisma ORM
* **Database**: Supabase / PostgreSQL (with robust thread-safe in-memory cache fallbacks)
* **AI Engine**: LLMService abstraction with primary support for Google Gemini API (`gemini-2.5-flash`), secondary local fallback for Ollama (`gemma4:12b`), and third-level regex-based heuristic engines.
* **Notifications**: Resend API (emails) and Telegram Bot API (alerts)

---

## 🚀 Core Features

1. **Scroll-Driven Landing Portal**: A premium, motion-rich home screen highlighting the workflow lifecycle (Understand, Collect, Organize, Route) and displaying confidentiality disclosures.
2. **Dynamic Client Intake Wizard**: A conversational interface that adapts dynamically. Instead of static questionnaires, the AI checks what details are missing and asks targeted questions one-by-one.
3. **Operational Command Center**: A restrained, data-dense internal dashboard for law firm administrators. It features search filters, KPI counters (Active Intakes, High Priority, Awaiting Review, Closed Today), and a slide-over docket details drawer.
4. **Structured Docket Checklist**: A live checklist on the client and admin views showing real-time extraction states (Client Name, Email, Phone, Location, Incident Date, Parties, Desired Outcome).
5. **Deterministic Routing**: AI-extracted practice areas (Personal Injury, Employment Law, Family Law, Corporate Law, etc.) are matched against configurable database routing rules, assigning the case to the correct lawyer team and lead attorney.
6. **Safety & Ethical Boundaries**: The AI contains strict safety prompts. It clearly discloses its automated nature, refuses requests for legal advice, does not draw definitive legal conclusions, and displays medical/emergency notices.
7. **Robust DB & API Resiliency**: Complete in-memory fallbacks for all database queries and LLM services. If PostgreSQL is offline or Gemini API limits are hit, the application runs seamlessly in simulation mode.

---

## 🛠️ Installation & Setup

### 1. Configure Environment Variables
Copy `.env.example` to a new file named `.env` in the root workspace folder, and configure your credentials:
```bash
cp .env.example .env
```
*Specify your `GEMINI_API_KEY`, `RESEND_API_KEY`, or custom database urls. If left blank, LegalFlow defaults to offline mock and heuristic modes.*

### 2. Run Backend Server
Inside the `server/` directory, install packages and start the developer environment:
```bash
cd server
npm install
npm run dev
```
*The backend server will validate/seed the database and host at `http://localhost:5000`.*

### 3. Run Automated Tests
Verify that all routing rules, parsing heuristics, safety boundaries, and fallbacks pass assertions:
```bash
cd server
npx ts-node src/tests/run-tests.ts
```

### 4. Run Frontend Client
Inside the root directory, boot the Next.js developer environment:
```bash
# In the workspace root
npm install
npm run dev
```
*The frontend portal will serve on `http://localhost:3000`.*

---

## 📡 API Endpoints Exceeded

* `POST /api/intake/start`: Initialize a new intake session. Parses the client's story and extracts the first-pass entities.
* `POST /api/intake/:id/message`: Submits a conversation answer. Re-extracts entities, updates missing information checklists, and yields the next question.
* `POST /api/intake/:id/complete`: Finalizes the intake, runs routing rules, updates assignments, and fires notifications.
* `GET /api/intake/:id`: Check client progress.
* `GET /api/intakes`: List all qualified intakes for the Command Center dashboard (supports search, priority filters, and status filters).
* `GET /api/intakes/:id`: Fetch full docket details.
* `GET /api/practice-areas`: List active practice areas.
* `GET /api/routing-rules`: List configured routing rules.
* `GET /api/health`: Verify API health.
