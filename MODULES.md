# KaamSang module tracker

Status is based on implemented code, not the concept diagram. Partial modules require more work before launch.

| Module | Status | Implemented / remaining |
|---|---|---|
| Project foundation | Partial | Next.js + Express, MongoDB persistence and indexes, local Docker replica-set configuration; setup validation, deployment and observability pending |
| Identity and accounts | Partial | Email/password registration, login, session logout and basic profile editing; basic per-process authentication rate limits; OTP, preferences, verification and distributed rate limiting pending |
| Skills and listings | Partial | Create/search/edit/pause own listings, filter by category/city/rate type/rate with pagination, save listings and store weekly availability; photos, booking availability enforcement, service areas, categories management and tags pending |
| Work requirements | Partial | Create/search/edit own posts, close or cancel, with headcount; filter work by category/city/type/budget with pagination; full lifecycle, deadlines and screening pending |
| Applications | Partial | Submit once, view in activity, shortlist/offer/reject, respond to an offer or withdraw; hirer can schedule one assignment per accepted application within headcount; full-time recruitment pending |
| Direct contact | Partial | Contact requests, recipient consent, optional public phone and device dialer links; basic per-process throttling; distributed abuse controls and masked calls pending |
| Bookings | Partial | Direct skill and job booking requests with work description, location, date/time and enforceable negotiation preference; recipient confirmation/decline, counteroffers with recorded terms, start/completion/cancellation and user-wide overlap check; multi-worker assignments within headcount, recorded booking status history and optional cancellation reasons; legacy history, replacement assignments and broader idempotency pending |
| Notifications and messaging | Partial | In-app notifications, booking messages and optional Twilio booking-request SMS with opt-in; provider credentials, delivery callbacks, retries, push and attachments pending |
| Safety and moderation | Partial | Targeted reports and user blocks, admin report queue, resolve/dismiss and transaction-backed audit; discovery filtering and target moderation pending |
| Reviews, payments, subscriptions | Partial | Completed-booking reviews with one review per party and basic submission UI; public review display included; moderation, payments and subscriptions pending |
| Business and admin | Partial | Configured-ID report moderation and audit; owner-managed organizations, consent-based manager/viewer invitations, owner-controlled role changes, shared work-post and application access; finer permissions, bulk hiring tools and wider controls pending |
| Web experience | Partial | Jobs-first home, live keyword search, direct publishing actions, contact requests, registration/login, applications, bookings and activity; basic profile editing, listing and post management, saved skills, weekly availability and public reviews included; broader account and business screens pending |
| API documentation | Partial | Swagger UI and OpenAPI for current endpoints; schemas, examples and error detail need expansion with each new endpoint |
| Testing | Partial | MongoDB integration journey passed against a local replica set; UI, mobile, accessibility, load and security testing pending |

Source: founder's concept blueprint and ER diagram. Recommended future phases are tracked here rather than represented as completed functionality.
