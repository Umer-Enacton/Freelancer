# Time Tracker Frontend

A modern React TypeScript frontend application for time tracking with project management, session tracking, and analytics.

## Features

- 🔐 **User Authentication** - Register and login with JWT tokens
- 📁 **Project Management** - Create, edit, and delete projects
- ⏱️ **Time Tracking** - Track work sessions with check-in/check-out
- ☕ **Break Management** - Monitor breaks during work sessions
- 📊 **Analytics Dashboard** - Visualize your productivity with charts
- 📈 **Summaries** - Generate detailed reports for completed time entries

## Tech Stack

- **React 18** with TypeScript
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first CSS framework (latest version)
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client
- **Recharts** - Chart library for analytics
- **Lucide React** - Beautiful icon library

## Prerequisites

- Node.js 18+ and npm
- Backend API running on `http://localhost:5000`

## Installation

1. Install dependencies:
```bash
npm install
```

## Running the Application

1. Start the development server:
```bash
npm run dev
```

2. The application will be available at `http://localhost:3000`

3. Make sure your backend API is running on `http://localhost:5000`

## Project Structure

```
src/
├── api/              # API configuration and service methods
├── components/       # Reusable React components
├── contexts/         # React Context providers
├── pages/            # Page components
├── types/            # TypeScript type definitions
├── utils/            # Utility functions
├── App.tsx           # Main app component with routing
├── main.tsx          # Application entry point
└── index.css         # Global styles with Tailwind
```

## Available Routes

- `/` - Home/Landing page
- `/login` - User login
- `/register` - User registration
- `/dashboard` - Analytics dashboard (protected)
- `/projects` - Project management (protected)
- `/time-entries/:projectId` - Time entry and session management (protected)

## Key Features

### Authentication
- JWT-based authentication
- Automatic token refresh
- Protected routes for authenticated users

### Project Management
- Create projects with name and description
- Edit and delete your projects
- View all your projects in a grid layout

### Time Tracking
- Create time entries for projects
- Check-in/check-out functionality
- Break tracking with break-in/break-out
- Complete time entries to finalize tracking

### Analytics
- Visual charts showing time breakdown by project
- Project distribution pie chart
- Summary statistics cards
- Recent activity feed

## API Integration

The frontend communicates with the backend API through the following endpoints:

- Auth: `/api/register`, `/api/login`
- Projects: `/api/project`
- Time Entries: `/api/timeEntry`
- Sessions: `/api/session`
- Summaries: `/api/summary`

## Building for Production

```bash
npm run build
```

The optimized production build will be created in the `dist/` folder.

## Environment Variables

You can customize the API URL by modifying the proxy configuration in `vite.config.ts`:

```typescript
server: {
  proxy: {
    "/api": {
      target: "http://localhost:5000", // Change this to your backend URL
      changeOrigin: true,
    },
  },
}
```

## Tailwind CSS Configuration

This project uses the latest Tailwind CSS with the Vite plugin:

```typescript
// vite.config.ts
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

```css
/* index.css */
@import "tailwindcss";
```

No postcss.config.js or tailwind.config.js needed!

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT
