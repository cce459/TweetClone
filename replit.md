# Twitter Clone

## Overview

This is a modern Twitter clone built as a full-stack web application. The project implements core social media functionality including posting tweets, user interactions (likes, follows), and real-time content display. The application uses a clean three-column layout similar to the original Twitter interface, with a sidebar for navigation, main content area for tweets, and a right sidebar for trending topics and user suggestions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React 18** with TypeScript for the user interface
- **Wouter** for client-side routing (lightweight alternative to React Router)
- **Tailwind CSS** with **shadcn/ui** components for styling and UI primitives
- **TanStack React Query** for state management, data fetching, and caching
- **Vite** as the build tool and development server
- Theme system supporting light/dark mode with CSS variables

### Backend Architecture
- **Express.js** server with TypeScript
- **RESTful API** design with routes for tweets, users, likes, and follows
- **In-memory storage** implementation (MemStorage) with interface abstraction (IStorage)
- Middleware for request logging and error handling
- Development-specific Vite integration for hot module replacement

### Database Schema Design
- **PostgreSQL** as the target database with Drizzle ORM
- Four main entities: users, tweets, likes, and follows
- UUID primary keys with automatic generation
- Proper foreign key relationships and constraints
- Prepared for database migration with drizzle-kit

### UI Component System
- **Radix UI primitives** for accessibility and behavior
- **shadcn/ui** components following the "new-york" style variant
- Comprehensive component library including forms, dialogs, toasts, and data display
- Consistent theming with CSS custom properties
- Mobile-responsive design patterns

### Development Workflow
- **ESM modules** throughout the project
- **TypeScript** strict mode configuration
- Hot reload in development with Vite
- Shared schema definitions between client and server
- Path aliases for clean imports (@/, @shared/, @assets/)

## External Dependencies

### Core Runtime Dependencies
- **@neondatabase/serverless** - Neon database client for PostgreSQL
- **drizzle-orm** - Type-safe ORM for database operations
- **express** - Web application framework
- **react** and **react-dom** - UI library

### UI and Styling
- **@radix-ui** - Comprehensive primitive component suite
- **tailwindcss** - Utility-first CSS framework
- **class-variance-authority** - Component variant management
- **lucide-react** - Icon library

### Development Tools
- **vite** - Build tool and development server
- **typescript** - Type checking and compilation
- **drizzle-kit** - Database schema management and migrations
- **@replit/vite-plugin** - Replit-specific development enhancements

### State Management and Data Fetching
- **@tanstack/react-query** - Server state management
- **react-hook-form** with **@hookform/resolvers** - Form handling
- **zod** - Schema validation

The application is designed to be easily deployable and scalable, with clear separation between frontend and backend concerns, and a database-agnostic storage interface that can be easily swapped from in-memory to persistent storage.