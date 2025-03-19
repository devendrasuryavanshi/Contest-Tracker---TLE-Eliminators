<p align="center"><img src="/client/public/icons/code.svg" alt="Logo" width="32" height="32" style="vertical-align: middle; margin-right: 10px;"> <span style="vertical-align: middle; font-size: 30px; font-weight: bold;">Contest Tracker - TLE Eliminators</span></p>

A web application that aggregates and tracks competitive programming contests from LeetCode, CodeForces, and CodeChef platforms with YouTube solution integration.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Bonus Features](#bonus-features)
4. [Tech Stack](#tech-stack)
5. [API Documentation](#api-documentation)
   - [Authentication Endpoints](#authentication-endpoints)
   - [Contest Endpoints](#contest-endpoints)
   - [Contest Management](#contest-management)
   - [Solution Management](#solution-management)
6. [Implementation Highlights](#implementation-highlights)
7. [Getting Started](#getting-started)
8. [Footer](#footer)

## Project Overview

This project was developed by `Devendra Suryavanshi` as a TLE Eliminators assignment for tracking programming contests across multiple platforms. It provides a centralized interface for viewing upcoming and past contests, bookmarking favorites, and accessing post-contest solution videos.


  [![Live Demo](https://img.shields.io/badge/LIVE_DEMO-Contest_Tracker_TLE_→-4F46E5?style=for-the-badge&labelColor=000000&logo=vercel&logoColor=white)](https://contest-tracker-tle-eliminators-zeta.vercel.app/)

## Features

- **Multi-platform Contest Tracking**: View contests from LeetCode, CodeForces, and CodeChef
- **Contest Filtering**: Filter contests by platform, date range, and status
- **User Authentication**: Register and login to maintain personalized bookmarks
- **Bookmarking System**: Save favorite contests for quick access
- **YouTube Solution Integration**: Automatically fetches and links solution videos from YouTube
- **Admin Interface**: Update solution links manually when needed

## Bonus Features

- **Automatic Solution Updates**: Solution videos are automatically fetched from YouTube playlists without manual intervention
- **Responsive Design**: UI is fully responsive across mobile, tablet, and desktop devices
- **Theme Toggle**: Support for both light and dark modes with an easy toggle option
- **Well-Documented Code**: Comprehensive code documentation for easy maintenance and future development

## Tech Stack

- **MongoDB**: Database for storing contest and user information
- **Express**: Backend API framework
- **Node.js**: Server-side JavaScript runtime
- **JWT**: Authentication mechanism
- **YouTube API**: For fetching solution videos

## Architecture

This project follows the **MVC (Model-View-Controller)** architecture pattern:

- **Model**: MongoDB schemas define the data structure for contests and users
- **View**: React components render the UI and handle user interactions (Client-side)
- **Controller**: Express route handlers process requests and manage business logic

This separation of concerns enhances code organization, maintainability, and scalability.

## API Documentation

### Authentication Endpoints

#### `GET /api/auth/me`
Retrieves authenticated user information.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "user": {
    "userId": "user_id",
    "email": "user@example.com"
  }
}
```

#### `POST /api/auth/register`
Creates a new user account.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password"
}
```

#### `POST /api/auth/login`
Authenticates a user and returns a JWT token.

#### `POST /api/auth/logout`
Logs out the current user.

### Contest Endpoints

#### `GET /api/contests/get-contests`
Retrieves contests within a date range.

**Query Parameters:**
- `startDate`: Start date (ISO format)
- `endDate`: End date (ISO format)

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "status": {
        "code": 200,
        "message": "Contests retrieved successfully"
  },
  "data": [
    {
        "_id": "67d8012dac17978b9f08629f",
        "contestName": "Starters 163 (Rated till 5 stars)",
        "contestId": "START163",
        "contestUrl": "https://www.codechef.com/START163",
        "platform": "codechef",
        "contestStartDate": "2024-12-04T14:30:00.000Z",
        "contestEndDate": "2024-12-04T16:30:00.000Z",
        "contestDuration": 7200,
        "bookmarks": [],
        "createdAt": "2025-03-17T11:02:05.993Z",
        "updatedAt": "2025-03-18T10:49:08.548Z",
        "__v": 0,
        "solutionUrl": "https://www.youtube.com/watch?v=L19n4kTEvqc"
    }
  ]
}
```

#### `GET /api/contests/get-upcoming-contests`
Retrieves upcoming contests.

#### `GET /api/contests/get-bookmarked-contests`
Retrieves user's bookmarked contests.

#### `POST /api/contests/bookmarkContest`
Toggles bookmark status for a contest.

**Body:**
```json
{
  "contestId": "contest_id",
  "isBookmarked": true
}
```

### Contest Management

#### `POST /api/contests/update/all`
Updates all contest data from all platforms.

#### `POST /api/contests/update/:platform`
Updates contests for a specific platform (leetcode, codechef, or codeforces).

### Solution Management

#### `GET /api/contests/solutions/missing`
Retrieves contests without solution links.

#### `POST /api/contests/solutions/update`
Updates solution URL for a specific contest (admin only).

**Body:**
```json
{
  "contestId": "contest_id",
  "youtubeUrl": "https://www.youtube.com/watch?v=video_id"
}
```

#### `POST /api/contests/solutions/update-all`
Updates all solution links from YouTube playlists.

## Implementation Highlights

- **Automatic YouTube Integration**: Solution videos are automatically fetched from YouTube playlists
- **JWT Authentication**: Secure user authentication system
- **RESTful API Design**: Well-structured API endpoints for all functionality
- **MongoDB Integration**: Efficient data storage and retrieval
- **Regex Matching**: Smart matching of YouTube video titles to contest names

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables:
   - `MONGODB_URI`: MongoDB connection string
   - `JWT_SECRET`: Secret for JWT token generation
   - `YOUTUBE_API_KEY`: YouTube API key for fetching videos
4. Start the server: `npm start`

## Footer

### Contact

- **Developer:** Devendra Suryavanshi
- **LinkedIn:** [LinkedIn Profile](https://www.linkedin.com/in/devendrasuryavanshi/)
- **Gmail:** [devendrasooryavanshee@gmail.com](devendrasooryavanshee@gmail.com)

### Acknowledgements

- This project was developed as an assignment for TLE Eliminators
- Thanks to the YouTube API for enabling solution video integration
- Special thanks to the competitive programming community