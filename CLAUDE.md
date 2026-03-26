# Life Directory

Personal CRM / people directory PWA with 3D galaxy visualization.

## Live
https://life-directory.vercel.app/

## Stack
- React 19 + TypeScript
- Vite 6 + vite-plugin-pwa (offline-capable, installable)
- Firebase Auth (email/password + Google sign-in)
- Cloud Firestore (per-user data isolation)
- Dexie.js 4 / IndexedDB (local-only private data: notes, sensitive topics)
- Three.js + React Three Fiber + drei (3D galaxy homepage)
- @react-three/postprocessing (bloom, vignette)
- CSS Modules + CSS Custom Properties
- React Router v7 (HashRouter)

## Commands
- `npm run dev` — dev server
- `npm run build` — production build to dist/
- `npm run preview` — preview production build

## Deployment
- Vercel auto-deploys on push to main (GitHub integration)
- Vite base path: /
- Git post-commit hook auto-pushes to origin

## Architecture

### Authentication
- Firebase Auth with email/password and Google sign-in
- AuthGuard wraps the app — unauthenticated users see login/signup
- Profile setup on first sign-in (name, phone, birthday, photo)
- Public profile stored in Firestore `publicProfiles/{uid}` (name + photo only)

### Data Storage (Hybrid)
- **Firestore** (per-user, cloud): people, categories, personCategories, interactions, user profile
- **Dexie/IndexedDB** (local-only): theme, nudge settings, private notes
- Each user's data lives under `users/{uid}/` — fully isolated
- Default categories seeded on first login

### Auto-Link System
- When you add a person with an email, a `matchHint` is created in Firestore
- When someone signs up with that email, auto-link fires:
  - Both users get a Person entry in each other's directories
  - Shared fields only: name, photo, email, birthday, anniversary
  - Everything else (notes, categories, phone, occupation) stays private
- Match hints are consumed after linking

### Circle Visibility
- Each user's directory is summarized in `users/{uid}/meta/circle`
- Shows first name + last initial only (e.g., "Sarah M.")
- Linked users can view each other's circles (read-only)
- "Add from Circle" — tap a person in someone's circle to add them with basic shared info

### 3D Galaxy Homepage (Solar System)
- Three.js WebGL scene with React Three Fiber
- User is the "sun" at center, people orbit in concentric rings
- Ring assignment: Favorites (ring 1), then by category sortOrder
- Within each ring: sorted by interaction recency (recent = top)
- Each ring tilted at a unique angle (staggered orbital planes)
- Drill-down: click a person → they become center, show their connections
- Breadcrumb navigation: "Me > Person A > Person B"
- Click center person → navigates to /people/:id
- Controls: left-drag pan, right-drag rotate, scroll zoom, pinch on mobile
- Post-processing: bloom (threshold 0.6, intensity 0.3), vignette
- Stars (3000), dust particles (200), galactic disc plane, fog
- Progressive node sizing: center 3.5r, ring1 2.2r, outer rings shrink
- Badges: gold torus = favorite, blue torus = platform user, green torus = addable

### People Management
- Full CRUD with 30+ fields across 7 sections (identity, categories, dates, family, work, contact, memory)
- Photo upload with compression (max 512px, JPEG 80%)
- Multi-category assignment (many-to-many)
- Relationship linking between people (linkedPersonIds)
- Tag inputs for interests, languages, dietary, topics, gift ideas
- Fuzzy search (tolerates typos, searches name/email/phone/company)
- Sort by name, last contacted, or recently added

### Interaction Log
- Timestamped entries with type (in person, phone, video, text, email, etc.)
- Auto-updates lastInteractionDate on the person
- Interaction statistics: total count, average gap, most common type

### Reminders
- Birthday, anniversary, and custom date reminders
- "Haven't talked to" nudges (configurable threshold, default 30 days)
- Dashboard shows upcoming dates sorted by proximity

### Settings
- Theme: light / dark / system
- My Profile: edit name, photo
- Nudge days slider (7-90 days)
- Data: export all (JSON), export by category, import with diff preview
- Install App section with platform-specific instructions
- Clear All Data (danger zone)
- Sign Out

## File Structure
```
src/
  firebase/           — Firebase config, auth, Firestore CRUD, matchHints, circleSnapshot
  hooks/              — useAuth, usePeople, useCategories, useInteractions, useReminders,
                        useSearch, useTheme, useAutoLink, useAppSettings, useInstallPrompt
  components/
    auth/             — AuthGuard, LoginPage, SignUpPage, AutoLinker
    solar-system/     — Galaxy3D, OrbitNode3D, OrbitRing3D, ConnectionLine3D,
                        SolarSystemView, Breadcrumbs, ProfileSetupModal,
                        GalaxyEffects, avatarTexture
    layout/           — AppShell, Sidebar, BottomNav
    people/           — PersonCard, PersonForm, PersonDetail, PhotoPicker,
                        sections/ (Identity, Categories, KeyDates, Family,
                        WorkLife, Contact, Memory, LinkedPeople)
    categories/       — CategoryManager, CategoryPill
    interactions/     — InteractionLog
    ui/               — Modal, Toast, ConfirmDialog, Avatar, SearchBar, Skeleton,
                        TagsInput, EmptyState, ErrorBoundary, InstallBanner
  pages/              — HomePage, PeoplePage, PersonDetailPage, AddEditPersonPage,
                        CategoriesPage, RemindersPage, SettingsPage
  models/             — types.ts (Person, Category, PersonCategory, Interaction, AppSettings)
  utils/              — orbitCalculator, date, search, image
  constants/          — navigation, colors, solarSystem
  styles/             — tokens.css, global.css
  db/                 — database.ts (Dexie), seed.ts, backup.ts
```

## Firestore Security Rules
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
      match /meta/{docId} {
        allow read: if request.auth != null;
        allow write: if request.auth != null && request.auth.uid == uid;
      }
      match /{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == uid;
      }
    }
    match /publicProfiles/{uid} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == uid;
    }
    match /matchHints/{id} {
      allow read: if request.auth != null;
      allow create, update: if request.auth != null;
      allow delete: if request.auth != null;
    }
  }
}
```

## Firebase Project
- Project: lifedirectory-fa153
- Auth: Email/Password + Google provider
- Firestore: Production mode with security rules above
- Authorized domains: life-directory.vercel.app
