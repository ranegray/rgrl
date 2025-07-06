# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 web application called "Click & Whirr" - a robotics learning platform that allows users to build and program real robots. The application features:

- **Interactive IDE**: Monaco Editor-based code editor for Python programming
- **Gazebo Integration**: Real-time robot simulation with ROS2 bridge connectivity
- **Authentication**: Clerk integration for user management
- **Responsive Design**: TailwindCSS for styling with a modern interface

## Common Development Commands

```bash
# Development
npm run dev          # Start development server on http://localhost:3000
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint for code quality checks
```

## Architecture Overview

### Core Components Structure
- **`app/components/ui/`**: Reusable UI components
  - `IDE.js`: Monaco Editor wrapper with Python language support
  - `GazeboViewer.js`: Robot simulation viewer with ROS2 integration
  - `EditorControls.js`: Code execution controls
  - `LessonPane.js`: Learning content display
  - `Terminal.js`: Terminal interface component

### Key Integrations
- **Authentication**: Clerk middleware (`middleware.ts`) handles auth across all routes
- **ROS2 Bridge**: WebSocket connection to `localhost:9090` for robot communication
- **Gazebo Web Interface**: Embedded iframe to `localhost:7681` for simulation viewing
- **Supabase**: Database integration configured via environment variables

### Robot Control System
The application uses a sophisticated ROS2 integration:
- **Joint Control**: 5-DOF robot arm with joints: `base_to_shoulder`, `shoulder_to_upper_arm`, `upper_arm_to_lower_arm`, `lower_arm_to_wrist`, `wrist_to_gripper`
- **Real-time Communication**: ROSLIB.js for WebSocket-based ROS2 communication
- **Simulation Control**: Gazebo physics pause/play and world reset capabilities

### File Extensions & Languages
- `.tsx/.ts`: React components with TypeScript
- `.js`: Legacy JavaScript components (consider migrating to TypeScript)
- CSS: TailwindCSS utility classes throughout

## Development Environment Requirements

- **ROS2 Bridge**: Websocket server must be running on port 9090
- **Gazebo Simulator**: Web interface on port 7681
- **Environment Variables**: 
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - Clerk configuration variables

## Important Notes

- The codebase mixes JavaScript and TypeScript - prefer TypeScript for new components
- ROS2 integration requires external services (rosbridge, Gazebo) to be running (will be containerized in future)
- Monaco Editor is configured for Python language support specifically for robotics code (may have additional language features in the future)
- Authentication is handled globally via Clerk middleware
- The application expects specific ROS2 topics and services for robot control
