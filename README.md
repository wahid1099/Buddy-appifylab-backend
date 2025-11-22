# BuddyScript Backend API

Node.js backend API for the BuddyScript social media application built with Express.js and MongoDB.

## Features

- **Authentication**: JWT-based authentication with secure password hashing
- **User Profile Management**: Customizable profiles with bio, cover photo, and avatar
- **Follow System**: Follow/unfollow users to build your network
- **Posts**: Create, read, delete posts with image upload support
- **Visibility Control**: Public and private posts
- **Comments & Replies**: Nested commenting system
- **Likes**: Like/unlike posts, comments, and replies
- **Pagination**: Efficient data loading for scalability
- **Security**: Helmet, CORS, input validation, and sanitization

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Validation**: express-validator
- **Security**: bcryptjs, helmet, cors

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   - Copy `.env.example` to `.env`
   - Update the values in `.env`:
     ```
     PORT=5000
     NODE_ENV=development
     MONGODB_URI=mongodb://localhost:27017/buddyscript
     JWT_SECRET=your_secret_key_here
     JWT_EXPIRE=30d
     FRONTEND_URL=http://localhost:5173
     ```

3. **Start MongoDB**:
   - Make sure MongoDB is running on your system
   - Default connection: `mongodb://localhost:27017/buddyscript`

4. **Run the server**:
   ```bash
   # Development mode (with auto-reload)
   npm run dev

   # Production mode
   npm start
   ```

   The server will start on `http://localhost:5000`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### Users & Profiles

- `GET /api/users/:id` - Get user profile (Protected)
- `PUT /api/users/:id` - Update user profile (Protected)
- `GET /api/users/:id/posts` - Get user's posts (Protected)
- `POST /api/users/:id/follow` - Follow a user (Protected)
- `DELETE /api/users/:id/follow` - Unfollow a user (Protected)
- `GET /api/users/:id/followers` - Get followers list (Protected)
- `GET /api/users/:id/following` - Get following list (Protected)

### Posts

- `POST /api/posts` - Create post (Protected)
- `GET /api/posts` - Get all posts (Protected)
- `GET /api/posts/:id` - Get single post (Protected)
- `DELETE /api/posts/:id` - Delete post (Protected)

### Comments

- `POST /api/comments` - Create comment (Protected)
- `GET /api/comments/:postId` - Get comments for a post (Protected)
- `POST /api/comments/:commentId/reply` - Create reply (Protected)
- `GET /api/comments/:commentId/replies` - Get replies for a comment (Protected)

### Likes

- `POST /api/likes` - Toggle like (Protected)
- `GET /api/likes/:targetType/:targetId` - Get who liked (Protected)

### Health Check

- `GET /api/health` - Server health check

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── models/
│   │   ├── User.js              # User schema
│   │   ├── Post.js              # Post schema
│   │   ├── Comment.js           # Comment schema
│   │   ├── Reply.js             # Reply schema
│   │   └── Like.js              # Like schema
│   ├── controllers/
│   │   ├── authController.js    # Auth logic
│   │   ├── userController.js    # User profile & follow logic
│   │   ├── postController.js    # Post logic
│   │   ├── commentController.js # Comment logic
│   │   └── likeController.js    # Like logic
│   ├── routes/
│   │   ├── authRoutes.js        # Auth routes
│   │   ├── userRoutes.js        # User routes
│   │   ├── postRoutes.js        # Post routes
│   │   ├── commentRoutes.js     # Comment routes
│   │   └── likeRoutes.js        # Like routes
│   ├── middleware/
│   │   ├── auth.js              # JWT verification
│   │   ├── upload.js            # File upload
│   │   └── errorHandler.js      # Error handling
│   ├── utils/
│   │   └── validators.js        # Input validation
│   └── server.js                # Entry point
├── uploads/                      # Uploaded images
├── .env                          # Environment variables
├── .env.example                  # Environment template
├── .gitignore
└── package.json
```

## Database Schema

### User
- firstName, lastName, email (unique), password (hashed), profileImage, coverImage
- bio, followers (ref User[]), following (ref User[])
- Indexed on: email

### Post
- author (ref User), content, image, visibility (public/private)
- Indexed on: createdAt, author, visibility

### Comment
- post (ref Post), author (ref User), content
- Indexed on: post, createdAt

### Reply
- comment (ref Comment), author (ref User), content
- Indexed on: comment, createdAt

### Like
- user (ref User), targetType (Post/Comment/Reply), targetId
- Indexed on: (targetType, targetId), (user, targetType, targetId) unique

## Security Features

- Password hashing with bcryptjs
- JWT token authentication
- Protected routes with middleware
- Input validation and sanitization
- CORS configuration
- Helmet security headers
- File upload restrictions (images only, 5MB max)

## Development

```bash
# Install dependencies
npm install

# Run in development mode (auto-reload)
npm run dev

# Run in production mode
npm start
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| NODE_ENV | Environment | development |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/buddyscript |
| JWT_SECRET | JWT secret key | (required) |
| JWT_EXPIRE | JWT expiration time | 30d |
| FRONTEND_URL | Frontend URL for CORS | http://localhost:5173 |

## Error Handling

The API uses a global error handler that returns consistent error responses:

```json
{
  "success": false,
  "message": "Error message here",
  "errors": [] // Optional validation errors
}
```

## Response Format

All successful responses follow this format:

```json
{
  "success": true,
  "message": "Success message",
  "data": {} // Response data
}
```

## License

ISC
"# Buddy-appifylab-backend" 
