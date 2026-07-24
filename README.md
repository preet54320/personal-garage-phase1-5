# Garage — Personal Vehicle Log (Phase 1–5)

A private, per-vehicle "digital service book." Dark glassmorphism UI, Google
sign-in, and a fully isolated Firestore data model per user.

## What's included in this phase

- Complete Vite + React project (builds clean — verified)
- Firebase config, Firestore rules, Storage rules, Firestore indexes
- `netlify.toml` with SPA redirect
- Google Authentication (sign in / sign out, private per-user data)
- App shell: sidebar, topbar, routing
- Garage home page: vehicle cards, empty state, Add Vehicle modal
  (photo upload, all requested fields, auto-creates a "Car purchased"
  timeline entry)
- Vehicle Dashboard: hero header, stat tiles (odometer, total spent,
  fuel/maintenance/insurance cost, cost/km, last & next service),
  recent timeline, Edit Vehicle, and the floating "+" quick-add button
  (Note is fully wired; Fuel/Expense/Service/Part/Document/Photo/Reminder
  are stubbed with a "soon" tag — they arrive in the next phase along with
  the modules that actually generate that data)
- Firestore data model: `users/{uid}/vehicles/{vehicleId}/{fuelLogs|
  serviceLogs|expenseLogs|partLogs|documents|photos|reminders|timeline|
  notes|tyres}` — nested under the owning user so the security rules are a
  single ownership check, not a manual scan of a shared collection.

## What's next

Phases 7–13 from your spec (Fuel Log, Service Log, Parts + Tyre Manager,
Expenses, full Timeline detail views, Reports/charts/export) will be built
the same way — real, complete files, one working phase at a time — in the
next messages of this conversation.

## Your only steps

1. Create Firebase Project
2. Enable Authentication (Google provider)
3. Create Firestore (production mode)
4. Enable Storage
5. Paste your Firebase Config into a `.env` file (copy `.env.example` → `.env`
   and fill in the six `VITE_FIREBASE_*` values from Project Settings →
   General → Your apps)
6. Push this code to GitHub
7. Connect the repo to Netlify (build command `npm run build`, publish
   directory `dist` — already set in `netlify.toml`)

Also deploy `firestore.rules`, `firestore.indexes.json`, and `storage.rules`
to your Firebase project from the Firebase console (Firestore → Rules /
Indexes tabs, Storage → Rules tab — paste the file contents in directly, no
CLI required).
