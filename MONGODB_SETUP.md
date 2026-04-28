# MongoDB Setup Guide

This website now uses MongoDB to store all user contact queries. Follow these steps to set up the database.

## 1. Create a MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Create a new project
4. Create a new cluster (M0 free tier is fine for development)

## 2. Get Your Connection String

1. In MongoDB Atlas, go to **Databases** → **Connect** → **Drivers**
2. Copy your connection string (it will look like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`)
3. Replace `username` and `password` with your database credentials

## 3. Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and add your MongoDB connection string:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

3. (Optional) Add an admin API token to protect the queries endpoint:
   ```
   ADMIN_API_TOKEN=your-secret-token
   ```

## 4. Restart the Development Server

```bash
npm run dev
```

## 5. Test the Connection

1. Submit a contact form on the website
2. Check MongoDB Atlas to verify the data was saved in the `contact_queries` collection

## 6. Access Stored Queries (Admin Endpoint)

Get all stored contact queries:

```bash
curl -H "Authorization: Bearer your-secret-token" http://localhost:3000/api/admin/queries
```

## Database Schema

The `contact_queries` collection stores documents with the following structure:

```typescript
{
  _id: ObjectId,
  name: string,
  email: string,
  phone: string,
  service: string,
  message: string,
  ipAddress: string,
  createdAt: Date
}
```

## Notes

- All form data is sanitized before saving to the database
- Query submissions are rate-limited to 5 per IP per minute
- The admin API endpoint requires authentication via Bearer token
- In production, replace the simple token auth with a proper authentication system
- Connection pooling is handled automatically by the MongoDB driver
