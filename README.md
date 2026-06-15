# Meetra 🌐

A modern social media web application built with React, inspired by Facebook. Meetra lets users connect, share posts, interact with content, and stay updated through real-time notifications.

---

## ✨ Features

### 👤 Authentication
- Register & Login with JWT-based auth
- Change password (for logged-in users)
- Protected & anti-protected routing

### 📰 Feed
- View all public posts in a live feed
- Create posts with text and images
- Edit & delete your own posts
- Infinite-style feed with React Query caching

### ❤️ Post Interactions
- Like / Unlike posts (persists across sessions)
- View who liked a post
- Bookmark / Unbookmark posts
- Share posts with a custom caption
- Comment on posts
- Like / Unlike comments
- Reply to comments with text and images

### 👥 Social
- Follow / Unfollow users from the feed or suggestions sidebar
- Follow suggestions based on your network
- Followers & following counts on your profile

### 🔖 Bookmarks
- Save posts and view them later on a dedicated Saved page

### 🔔 Notifications
- Real-time unread notification badge on the navbar (polls every 30s)
- Notification panel with full list
- Mark a single notification as read
- Mark all notifications as read
- Click a notification to navigate directly to the related post

### 👤 Profile
- View your profile, follower/following counts, and post count
- Upload and update your profile photo
- View a grid of your photos
- Edit profile modal

---

## 🛠️ Tech Stack

| Category | Library |
|---|---|
| UI Framework | React 18 |
| Routing | React Router DOM v7 |
| Server State | TanStack React Query v5 |
| HTTP Client | Axios |
| Forms | React Hook Form + Zod |
| Component Library | HeroUI |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion |
| Notifications | React Toastify |
| Icons | React Icons |
| Auth Decoding | jwt-decode |
| Loaders | React Spinners |
| SEO | React Helmet |
| Offline Detection | React Detect Offline |
| Build Tool | Vite |

---

## 📁 Project Structure

```
src/
├── assets/
├── Components/
│   ├── AntiProtectedRoute/
│   ├── Bookmarks/
│   ├── CardHeaderPart/
│   ├── ChangePassword/
│   ├── CommentCard/
│   ├── CreateComment/
│   ├── CreatePost/
│   ├── FollowSuggestions/
│   ├── Footer/
│   ├── Home/
│   ├── Layout/
│   ├── LoaderPage/
│   ├── Login/
│   ├── Navbar/
│   ├── PostCard/
│   ├── PostDetails/
│   ├── Profile/
│   ├── ProtectedRouting/
│   └── Register/
├── Contexts/
│   └── AuthContextProvider.jsx
├── App.jsx
└── main.jsx
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/meetra.git

# Navigate into the project
cd meetra

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be running at `http://localhost:5173`

---

## 🔌 API

This project consumes the **Route Posts API**:

```
Base URL: https://route-posts.routemisr.com
```

All protected endpoints require a Bearer token passed in the `Authorization` header.

---

## 📸 Screenshots

> _Add screenshots of your app here_

---

## 🙌 Author

Built by **Fares** — feel free to connect!
