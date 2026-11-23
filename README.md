# KaamSang

Kaam Bhi, Kaamgar Bhi. A dual-role marketplace foundation with a Next.js web client and a versioned Express API for web and future native clients.

## Start local MongoDB

Install and start Docker Desktop, then from the project directory run:

```powershell
docker compose up -d
# Wait for STATUS to show healthy; the first start downloads MongoDB.
docker compose ps
```

The container starts a single-node replica set on `127.0.0.1:27017` and keeps data in the `kaamsang_mongo` Docker volume. This is a development-only database configuration. Do not remove the volume if you need to preserve the data. To stop the container without deleting data, run `docker compose stop`.

The current Windows setup also has a separate KaamSang MongoDB replica set using `.local/mongodb` on port `27018`. Its connection string is `mongodb://127.0.0.1:27018/?replicaSet=kaamsang-rs&directConnection=true`. It does not change the existing MongoDB service on port 27017. After restarting the computer, start that `mongod` process with its existing data directory and replica-set name before starting the API.

## Run locally

Requires Node.js 22+, npm, and MongoDB configured as a replica set (local single-node replica set or MongoDB Atlas). Booking confirmations use MongoDB transactions, which require a replica set or sharded cluster.

```sh
npm install
# PowerShell example; replace with your MongoDB connection string
$env:MONGODB_URI='mongodb://127.0.0.1:27017/?replicaSet=rs0&directConnection=true'
npm run dev:api
# in a second terminal
npm run dev:web
```

Open http://localhost:3000 and Swagger UI at http://localhost:4000/api/docs. The OpenAPI document is at http://localhost:4000/api/v1/openapi.json. Set `NEXT_PUBLIC_API_URL` when the API is hosted elsewhere. Set `MONGODB_URI` (required), optionally `MONGODB_DB` (defaults to `kaamsang`) and `PORT` for the API. MongoDB indexes are created on startup. Never commit connection credentials.

To add 100 clearly marked demo marketplace records (50 skill listings and 50 work posts, plus 20 demo accounts), set `MONGODB_URI` as above and run `npm run seed:demo`. The seed is safe to repeat: it adds missing demo records and does not overwrite existing records. It covers 10 skill categories, 10 cities, four rate types and five work types. Demo sign-in: `user1@demo.kaamsang.invalid` / `KaamSangDemo123!`; optionally set `DEMO_PASSWORD` before the first seed. Demo profiles and jobs are samples, not real people or opportunities. Run `npm run seed:users` for the additional 100 accounts and `npm run seed:realistic` to replace untouched placeholder names and sample descriptions with realistic fictional ones. The latter skips listings with booking/contact history and work posts with applications/booking history.

For integration tests, use a PowerShell terminal with:

```powershell
$env:MONGODB_TEST_URI='mongodb://127.0.0.1:27017/?replicaSet=rs0&directConnection=true'
npm test
```

Alternatively set `MONGODB_TEST_URI` to another replica set dedicated to testing. Tests create and drop a uniquely named temporary database; without this variable the integration test is skipped. Run `npm run build` for the production web build. Existing SQLite data is not migrated automatically.

Worker discovery supports keyword, exact category, city, rate type and rate range; a rate range requires a rate type. Work discovery supports keyword, exact category, city, work type and budget-range filters. `GET /api/v1/listings` and `GET /api/v1/work-posts` return `pagination` metadata and default to 50 items per page (maximum 50); see Swagger for parameters.

For local moderation, create a normal account and obtain its immutable `id` from the authenticated `GET /api/v1/me` endpoint. Before starting the API, set `ADMIN_USER_IDS` to a comma-separated list of the exact account IDs allowed to moderate (for example, `$env:ADMIN_USER_IDS='id-one,id-two'`). Restart the API after changing the list. An empty or missing value grants no admin access; email addresses and self-registration do not grant access. Admin report decisions and audit entries are written together using a MongoDB transaction. Account verification, stronger admin authentication, granular permissions, report target moderation and deployment security remain necessary before production.

Organization owners can invite existing account IDs as managers or read-only viewers. Members must accept invitations; managers can publish and manage organization work posts and applications, while viewers can see organization posts and applications without managing them. Only owners can edit organization profiles, change roles and manage members. Existing bookings remain accessible to their recorded participants after a manager is removed or downgraded. Finer permissions and stronger production authorization controls remain pending.

New booking and assignment requests require a work description, location, UTC start and end times, and an explicit `allowNegotiation` boolean. Existing clients must supply these fields; historical bookings without a preference keep their previous negotiation behavior.

Booking histories record newly created and changed booking states, including optional cancellation reasons; old bookings may have incomplete or no history, and no past events are invented.

Each accepted application can have one assignment request; requested, negotiating, confirmed, in-progress and completed assignments occupy work-post headcount. Declined or cancelled assignments free headcount but the same application cannot be assigned again. Full-time posts remain recruitment-only.

## Optional booking SMS and direct calling

Users may enter a phone number in E.164 format (for example, `+919876543210`) in Profile. Public display for calls and booking SMS are separate, disabled-by-default choices. Publicly shared numbers appear on the user's listings and work posts; call links open the device dialer. Booking and assignment requests always create an in-app notification. When the recipient has opted in to SMS, configure the API process with `SMS_TWILIO_ACCOUNT_SID`, `SMS_TWILIO_AUTH_TOKEN` and `SMS_TWILIO_FROM` (an E.164 sender number). Never commit credentials. Without provider configuration, SMS is recorded as `not_configured`; a provider-accepted message is recorded as `queued`, not delivered. Failures and timeouts are recorded as `failed` or `unknown`, respectively. The current implementation does not have delivery callbacks or automatic retries; verify sender and destination requirements before enabling a provider.

Authentication and contact endpoints have basic in-process throttling; use shared rate limiting and a trusted proxy configuration for multi-instance production deployments.

This is an early development foundation, not a production launch: see [MODULES.md](MODULES.md) for implemented and outstanding scope. Do not use real personal data until security, operations and deployment work is complete.
