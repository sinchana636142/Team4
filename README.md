🎬 StreamHub --- OTT Video Streaming Platform
TEAM-04 · PES University · UE24CS341A Software Engineering

StreamHub is a responsive web-based Over-The-Top (OTT) streaming
platform built as an academic team project. It brings together content
discovery, video playback, personalization, subscriptions, hosted
payment checkout, and content administration.
Development status: Core viewer, subscription, and administration
flows are implemented in the project. Sprint 1 manual testing is in
progress; see the status table below for tests that remain pending. Do
not treat a feature as production-ready solely because it works in
Razorpay Test Mode.

📚 Project documentation
  Document                            Purpose
  StreamHub_SRS.pdf                 Software Requirements Specification
                                      --- what the system should do

  StreamHub_SAD.pdf                 Software Architecture and Design
                                      --- how the system is structured

  StreamHub_Test_Plan.pdf           Software Test Plan --- how the
                                  system is verified
✨ Features
Viewer
- Account registration, OTP verification, login, and profile
  management
- Catalog browsing, search, and title details
- Video playback, resume position, and watch history
- Personal watchlist and ratings
- Subscription plans and a hosted Razorpay Checkout flow
- Subscription status and expiry display
Content administrator
- Upload titles and metadata, including poster/media files where
  supported
- Publish and unpublish titles
- View registered users and subscription status
- Role-protected administration operations
Payment flow
1. The viewer selects a subscription plan.
2. The backend creates a Razorpay order.
3. Razorpay Checkout handles the payment UI.
4. The backend verifies the payment signature and checks payment
   details before activating a subscription.
5. Subscription status and expiry are saved in the application
   database.
Security rule: StreamHub must not activate a subscription based only
on a browser success message. Activation must follow server-side
verification. Card details should be handled by the hosted payment
provider, not stored by StreamHub.
🏗️ Architecture
StreamHub uses a modular, three-tier client/server architecture.
React + Vite frontend
        |
        | REST / JSON
        v
FastAPI backend
        |
        v
PostgreSQL database

External services:
- Razorpay hosted checkout / payment webhooks
- Email or OTP delivery service (depending on environment)
- Static or cloud media storage
Technology stack
  Layer               Technology
  Frontend            React, Vite, JavaScript
  Backend             Python, FastAPI
  Database            PostgreSQL
  Validation          Pydantic
  Authentication      JWT
  Payment             Razorpay Checkout (Test Mode for development)
  API documentation   Swagger / OpenAPI
  Testing             pytest, API/manual testing; optional Locust load testing
  Version control     Git and GitHub
🚀 Getting started
Prerequisites
- Python 3.11 or newer
- Node.js version supported by the installed Vite version
- PostgreSQL, with a database named streamhub
- Git
1. Clone the repository
git clone https://github.com/sinchana636142/Team4.git
cd Team4
2. Configure and start the backend
Open a terminal in the repository root:
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
On macOS/Linux, activate the environment with:
source .venv/bin/activate
Create backend/.env locally. Do not commit this file.

Example configuration (replace placeholders with your local values):
DATABASE_URL=postgresql+psycopg://postgres:YOUR_PASSWORD@localhost:5432/streamhub
JWT_SECRET_KEY=replace-with-a-long-random-secret
OTP_DELIVERY_MODE=console

# Razorpay Test Mode credentials only for local testing
RAZORPAY_KEY_ID=your_test_key_id
RAZORPAY_KEY_SECRET=your_test_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

REQUIRE_SUBSCRIPTION=true
Use the exact environment variable names expected by the current backend
configuration. Never commit API keys, webhook secrets, database
passwords, JWT secrets, OTPs, or payment credentials. Do not paste them
into issues or chat.

Initialize the database and start the API:
python -m app.init_db
uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload
Backend URLs:
- API: http://127.0.0.1:8001
- Swagger docs: http://127.0.0.1:8001/docs
- Health check, if enabled: http://127.0.0.1:8001/health
3. Start the frontend
Open a second terminal:
cd frontend
npm install
npm run dev
Open the local URL printed by Vite (commonly http://localhost:5173).
4. Run checks
Backend tests:
cd backend
python -m pytest
Frontend lint/build checks:
cd frontend
npm run lint
npm run build
Only report test counts that were actually observed in the current
checkout. Test results can change as branches and pull requests are
merged.
💳 Razorpay development/testing
Use Razorpay Test Mode for development. Test payments simulate
transactions and should not collect real money.

Recommended checks for OTT-F-041:
1. Select Basic or Premium and confirm Checkout opens.
2. Complete a successful test payment and confirm the backend verifies
   it.
3. Confirm the correct plan, active status, and expiry appear in
   StreamHub.
4. Cancel or fail a test payment and confirm it does not activate a
   subscription.
5. Submit a deliberately invalid signature to the verification endpoint
   and confirm the backend rejects it.
6. If webhooks are enabled, configure the same webhook secret in the
   Razorpay test dashboard and the backend environment. Use a reachable
   webhook URL for local testing; a local-only 127.0.0.1 URL cannot
   receive external Razorpay callbacks.
Do not use real card details or real banking OTPs in tests. Do not
switch to Live Mode or collect real payments for a college demo without
the account owner's approval and the required provider activation.
🧪 Sprint 1 --- Feature and test status
This status reflects the latest manual-testing notes shared by the
testing/integration member. A checked item means it was reported as
tested; unchecked items still need verification. It is not an automated
CI result.
  Requirement       Feature             Reported status   Remaining work
  OTT-F-041       Hosted Razorpay     Mostly tested     Verify
                    checkout                              cancellation/failure
                                                          does not activate a
                                                          subscription; verify
                                                          invalid signatures are
                                                          rejected

  OTT-F-050       Upload titles and   Tested by member  Keep evidence of
                    metadata                              creation, persistence
                                                          after refresh,
                                                          validation, file
                                                          handling, and viewer
                                                          permission checks

  OTT-F-051       Publish/unpublish   Mostly tested     Test direct
                    titles                                detail/playback API
                                                          access to an
                                                          unpublished title

  OTT-F-052       View users and      Mostly tested     Check
                    subscription status                   search/pagination if
                                                          implemented; inspect
                                                          API responses for
                                                      sensitive fields
Suggested evidence to save
- Successful checkout and resulting subscription status/expiry
- Failed/cancelled checkout with no subscription activation
- Invalid signature rejection response
- Uploaded title visible after refresh
- Published title visible and unpublished title hidden
- Direct API request for an unpublished title
- Admin users list and a normal viewer's denied admin request
- API response inspection confirming password hashes, OTPs, and
  secrets are not exposed
Definition of done: Mark an issue complete only after its required
tests pass, evidence is saved, relevant defects are addressed, and the
issue/PR is updated accurately.
🔌 API documentation
The running backend's Swagger page at http://127.0.0.1:8001/docs is
the source of truth for the current request schemas and endpoint paths.
The API may not use the /api prefix described in earlier design
documents.

Known routes in the project documentation include:
  Method                  Path                            Purpose
  POST                  /auth/register                Register a user

  POST                  /auth/verify-otp              Verify registration OTP

  POST                  /auth/login                   Log in and receive an
                                                          access token

  GET                   /auth/me                      Get current user

  GET                   /subscription/status          Get the current user's
                                                          subscription status

  GET                   /playback/{title_id}          Request playback access

  GET                   /playback/{title_id}/resume   Get resume position

  PUT                   /playback/{title_id}/resume   Save resume position

  GET                   /playback/history             View watch history

  GET                   /watchlist                    View the user's
                                                      watchlist
Subscription, catalog, and administration routes can evolve as features
are integrated. Confirm the exact path, request body, and authorization
requirements in Swagger before testing.
🗂️ Repository structure
Team4/
├── README.md
├── StreamHub_SRS.pdf
├── StreamHub_SAD.pdf
├── StreamHub_Test_Plan.pdf
├── backend/
│   ├── requirements.txt
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── init_db.py
│   │   ├── core/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── routers/
│   └── tests/
└── frontend/
    └── src/
The exact tree may change as team branches are merged.
🤝 Team Git workflow and security
1. Work on the branch assigned by the team and avoid overwriting
   another member's work.
2. Review git status and git diff before staging changes.
3. Never commit .env, credentials, passwords, tokens, node_modules,
   virtual environments, or __pycache__.
4. Run the relevant backend tests and frontend build before opening a
   pull request.
5. Open a pull request to the team's target branch and request review.
6. Update issue status only when the implementation and required tests
   are complete.
7. If a secret was accidentally committed, remove it from the
   repository and rotate it; deleting it in a later commit does not
   make the exposed secret safe.
Example commit message:
test(subscription): verify checkout and admin flows
🚧 Known boundaries
- This is an academic web application, not a production OTT service.
- Test Mode payment success does not prove that Live Mode is activated
  or production-ready.
- Real email delivery depends on the configured email provider and
  environment.
- Media hosting, playback performance, access control, and file-upload
  limits depend on the current implementation and deployment
  configuration.
- Production deployment would require additional security, monitoring,
  backup, rate-limiting, HTTPS, and operational work.
📖 Source documents
This README summarizes the project's:
1. Software Requirements Specification (SRS)
2. Software Architecture and Design Specification (SAD)
3. Software Test Plan (STP)
For exact requirements and formal test cases, refer to those documents
and the current implementation.
🎬 StreamHub
Discover. Watch. Personalize. Subscribe.