# IT Community BD Frontend

Public web application for IT Community BD. This client is used by job seekers, employers, and general visitors to browse jobs, manage profiles, apply for jobs, and explore expert hiring flows such as `appoint-expertise`.

## What This App Covers

- Public landing and informational pages
- Job listing and job details
- User authentication and protected routes
- Seeker profile and resume builder
- Employer profile and application review
- Expert appointment and expertise detail flows

## Tech Stack

- React 18
- Vite
- React Router
- Tailwind CSS
- Axios
- Lucide React

## Project Structure

```text
src/
  api/          API client setup
  asset/        Static assets
  components/   Shared UI pieces
  context/      Auth and shared state
  dashboard/    Expert dashboard-related views
  data/         Config and static data
  layouts/      Page layouts
  pages/        Route-level pages
```

## Prerequisites

- Node.js 18+
- npm
- Running backend API from the server repo

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

If omitted, the app falls back to `http://localhost:5000/api`.

## Local Development

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Key Routes

- `/` - home page
- `/jobs` - job listing
- `/login` - login
- `/register` - registration
- `/seeker-profile` - seeker profile editor
- `/seeker-resume` - seeker resume view
- `/employer-applications` - employer application management
- `/appoint-expertise` - expertise listing
- `/appoint-expertise/:id` - expertise detail page

## Notes For Contributors

- Keep UI changes consistent with the existing Tailwind patterns.
- API calls are centralized through `src/api/client.js`.
- Protected pages rely on role-aware routing, so check route guards when adding new pages.
- For profile-related work, inspect both seeker-facing and employer-facing pages because data is often reused in multiple views.

## Related Repositories

- `IT-Community-BD-server` - backend API
- `IT-Community-BD-Admin-Dashboard` - admin-facing dashboard
