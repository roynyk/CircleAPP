# TalkHive - Full-Stack Social Media Platform (Web & API)

TalkHive is a full-stack social media application inspired by Twitter/Threads. This repository contains the source code for the **web frontend interface** and the **core RESTful API server** of the platform.

## 📁 Repository Structure
This project is split into two main directories:
- **`Backend/`**: The Node.js, Express, and TypeScript API server.
- **`Frontend/`**: The React 19 web application built with TypeScript and Tailwind CSS.

---

## 🚀 Tech Stack

### Frontend (Web)
- **Framework & Language:** React 19, TypeScript, React Router DOM.
- **State Management:** Redux Toolkit (for global user state & app statuses).
- **Styling:** Tailwind CSS v4.

### Backend (API Server)
- **Runtime & Framework:** Node.js, Express.js (TypeScript).
- **Database & ORM:** PostgreSQL, Prisma ORM.
- **Real-Time Communication:** WebSockets (using the native `ws` library).
- **Authentication:** JWT (JSON Web Tokens) with secure storage.

---

## ✨ Key Features
- **User Authentication:** Secure registration and login flows using JWT.
- **Interactive Feed:** Post new threads (with image attachment support), view dynamic user profiles, and interact via nested comments/replies and likes.
- **Connection System:** A self-referential follow and unfollow system to build user networks.
- **WebSocket Engine:** Instant message and notification updates pushed to active clients instantly.

---

## 🛠️ Local Installation & Development Setup

### Prerequisite
Ensure you have [Node.js](https://nodejs.org/) installed and a running [PostgreSQL](https://www.postgresql.org/) database.

### 1. Clone the Repository
```bash
git clone https://github.com/roynyk/CircleAPP.git
cd CircleAPP
