# DevPulse Dashboard

![CI Status](https://github.com/Jeevan-a10/devpulse-dashboard/actions/workflows/ci.yml/badge.svg)
![Framework](https://img.shields.io/badge/Next.js-16.4-black)
![UI](https://img.shields.io/badge/TailwindCSS-v4-38bdf8)

Frontend dashboard for the DevPulse project and task management system. Built with Next.js 16, React, and Tailwind CSS.

## Overview

DevPulse Dashboard provides a clean interface for managing developer tasks, tracking project milestones, and viewing recent activity. It integrates with the DevPulse Express REST API.

## Features

- **Authentication & Sessions**: JWT-based authentication with persistent sessions and route guards.
- **Task Management**: Create, update, filter, search, and delete tasks with priority and category tags.
- **Milestone Tracking**: Visual roadmap progress bars and target completion dates.
- **Activity Feed**: Chronological log of recent actions and team updates.
- **Metrics Overview**: Summary statistics showing completion rate and task distribution.
- **Engineering Velocity & Reports**: In-depth analytics covering turnaround cycle times, priority distributions, and a 7-day activity sparkline.
- **Export Hub**: 1-click JSON full-workspace backups and RFC-compliant CSV task backlog downloads.
- **Container Ready**: Production-optimized standalone output for lightweight Docker deployments.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS v4
- **HTTP Client**: Axios

## Getting Started

### Prerequisites

Ensure the DevPulse API server is running on `http://localhost:5000`.

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## Environment Variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```
