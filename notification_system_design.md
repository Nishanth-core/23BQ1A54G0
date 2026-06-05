# Stage 1

# Notification System REST API Design

## Overview
The notification platform enables authenticated users to receive, view, manage, and acknowledge notifications. The API is designed using REST principles with predictable naming conventions and JSON-based request/response formats.

### Base URL

```
/api/v1
```

### Common Headers

#### Request Headers

```
Authorization: Bearer 
Content-Type: application/json
Accept: application/json
```

#### Response Headers

```
Content-Type: application/json
```

---

# Notification Object Schema

```
{
  "id": "notif_001",
  "userId": "user_123",
  "title": "Order Shipped",
  "message": "Your order #12345 has been shipped.",
  "type": "info",
  "isRead": false,
  "createdAt": "2026-06-05T10:30:00Z"
}
```
FieldTypeDescriptionidstringUnique notification identifieruserIdstringRecipient user identifiertitlestringNotification titlemessagestringNotification contenttypestringinfo, success, warning, errorisReadbooleanRead statuscreatedAtdatetimeNotification creation timestamp
---

# Core Actions Supported

1. Create Notification
2. Get User Notifications
3. Get Notification By ID
4. Mark Notification As Read
5. Mark All Notifications As Read
6. Delete Notification

---

# 1. Create Notification
Creates a notification for a user.

## Endpoint

```
POST /notifications
```

## Request Body

```
{
  "userId": "user_123",
  "title": "Order Shipped",
  "message": "Your order #12345 has been shipped.",
  "type": "info"
}
```

## Success Response

### Status

```
201 Created
```

### Response Body

```
{
  "success": true,
  "data": {
    "id": "notif_001",
    "userId": "user_123",
    "title": "Order Shipped",
    "message": "Your order #12345 has been shipped.",
    "type": "info",
    "isRead": false,
    "createdAt": "2026-06-05T10:30:00Z"
  }
}
```

---

# 2. Get User Notifications
Returns all notifications for the authenticated user.

## Endpoint

```
GET /notifications
```

## Query Parameters

```
?page=1
&limit=10
&isRead=false
```

## Success Response

### Status

```
200 OK
```

### Response Body

```
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": "notif_001",
      "title": "Order Shipped",
      "message": "Your order has been shipped.",
      "type": "info",
      "isRead": false,
      "createdAt": "2026-06-05T10:30:00Z"
    },
    {
      "id": "notif_002",
      "title": "Payment Received",
      "message": "Payment received successfully.",
      "type": "success",
      "isRead": true,
      "createdAt": "2026-06-05T09:00:00Z"
    }
  ]
}
```

---

# 3. Get Notification By ID
Returns a single notification.

## Endpoint

```
GET /notifications/{notificationId}
```

## Example

```
GET /notifications/notif_001
```

## Success Response

### Status

```
200 OK
```

### Response Body

```
{
  "success": true,
  "data": {
    "id": "notif_001",
    "title": "Order Shipped",
    "message": "Your order #12345 has been shipped.",
    "type": "info",
    "isRead": false,
    "createdAt": "2026-06-05T10:30:00Z"
  }
}
```

---

# 4. Mark Notification As Read
Updates notification read status.

## Endpoint

```
PATCH /notifications/{notificationId}/read
```

## Request Body

```
{
  "isRead": true
}
```

## Success Response

### Status

```
200 OK
```

### Response Body

```
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

# 5. Mark All Notifications As Read
Marks all notifications for the authenticated user as read.

## Endpoint

```
PATCH /notifications/read-all
```

## Request Body

```
{}
```

## Success Response

### Status

```
200 OK
```

### Response Body

```
{
  "success": true,
  "message": "All notifications marked as read"
}
```

---

# 6. Delete Notification
Deletes a notification.

## Endpoint

```
DELETE /notifications/{notificationId}
```

## Example

```
DELETE /notifications/notif_001
```

## Success Response

### Status

```
200 OK
```

### Response Body

```
{
  "success": true,
  "message": "Notification deleted successfully"
}
```

---

# Standard Error Response

## Status

```
400 Bad Request
```

## Response Body

```
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Title is required"
  }
}
```

## Unauthorized

```
401 Unauthorized
```

```
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or missing authentication token"
  }
}
```

## Not Found

```
404 Not Found
```

```
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Notification not found"
  }
}
```

---

# Design Considerations

- RESTful resource naming conventions.
- Consistent JSON response structure.
- JWT-based authentication.
- Pagination support for scalability.
- Filtering notifications by read status.
- Separate endpoints for individual and bulk read operations.
- Standardized error responses.
- Versioned API (`/api/v1`) for future extensibility.

```
```

## Stage 2

# Database Design and Persistence Strategy

## Recommended Database

### PostgreSQL
I recommend using **PostgreSQL** as the primary persistent storage for the notification system.

### Why PostgreSQL?

1. **ACID Compliance** — Guarantees reliable storage and consistency of notifications.
2. Prevents data corruption during concurrent operations.
3. **High Performance** — Supports indexing, partitioning, and query optimization.
4. Efficient for notification retrieval and filtering.
5. **Scalability** — Can handle millions of notifications with proper indexing and partitioning.
6. **Rich Query Support** — Supports filtering, sorting, aggregation, and pagination efficiently.
7. **Production Ready** — Widely adopted and suitable for enterprise-scale applications.

---

# Database Schema

## Users Table

```
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Notifications Table

```
CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notifications_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);
```

---

## Indexes

### Retrieve Notifications Quickly

```
CREATE INDEX idx_notifications_user
ON notifications(user_id);
```

### Retrieve Unread Notifications

```
CREATE INDEX idx_notifications_user_read
ON notifications(user_id, is_read);
```

### Sort by Latest Notifications

```
CREATE INDEX idx_notifications_created_at
ON notifications(created_at DESC);
```

---

# Entity Relationship

```
Users
  |
  | 1
  |
  | N
Notifications
```
One user can have multiple notifications.

---

# Potential Scaling Challenges
As the application grows, notification volume may increase significantly.

Example:

- 10,000 users
- 100 notifications per day
- 1,000,000+ notifications within months

This introduces several challenges.

---

## Problem 1: Slow Notification Retrieval

### Cause
Large table scans while fetching user notifications.

### Solution

- Create indexes on: `user_id`, `is_read`, `created_at`.
- Use cursor-based pagination rather than offset where possible.

Example (limit-offset):

```
SELECT *
FROM notifications
WHERE user_id = $1
ORDER BY created_at DESC
LIMIT 20 OFFSET 0;
```

Cursor-based (seek) pagination example:

```
SELECT *
FROM notifications
WHERE user_id = $1
  AND created_at < $2
ORDER BY created_at DESC
LIMIT 20;
```

---

## Problem 2: Database Storage Growth

### Cause
Notifications continue accumulating indefinitely.

### Solution
Implement data retention policies.

Examples:

- Archive notifications older than 1 year.
- Move historical data to cold storage.
- Periodically delete obsolete notifications.

Example delete query:

```
DELETE FROM notifications
WHERE created_at < NOW() - INTERVAL '1 year';
```

---

# Mapping REST Endpoints to SQL
Below are concrete SQL operations corresponding to each REST endpoint in Stage 1.

1. Create Notification — `POST /notifications`

```
INSERT INTO notifications (id, user_id, title, message, type, is_read, created_at)
VALUES ($1, $2, $3, $4, $5, FALSE, NOW())
RETURNING *;
```

2. Get User Notifications — `GET /notifications` (with pagination & optional isRead filter)

```
SELECT id, title, message, type, is_read, created_at
FROM notifications
WHERE user_id = $1
  AND ($2::boolean IS NULL OR is_read = $2)
ORDER BY created_at DESC
LIMIT $3 OFFSET $4;
```

3. Get Notification By ID — `GET /notifications/{notificationId}`

```
SELECT id, title, message, type, is_read, created_at
FROM notifications
WHERE id = $1
  AND user_id = $2; -- ensure user owns the notification
```

4. Mark Notification As Read — `PATCH /notifications/{notificationId}/read`

```
UPDATE notifications
SET is_read = $1
WHERE id = $2
  AND user_id = $3
RETURNING id;
```

5. Mark All Notifications As Read — `PATCH /notifications/read-all`

```
UPDATE notifications
SET is_read = TRUE
WHERE user_id = $1
  AND is_read = FALSE;
```

6. Delete Notification — `DELETE /notifications/{notificationId}`

```
DELETE FROM notifications
WHERE id = $1
  AND user_id = $2;
```

---

# Transactions and Concurrency
- Wrap multi-step operations in transactions when needed (for example, create + side-effects).
- Use `SELECT ... FOR UPDATE` for safe concurrent updates when required.

---

# Summary
This Stage 2 section adds a production-ready persistence plan using PostgreSQL, provides schema and indexes, addresses scaling and retention, and maps each REST endpoint to concrete SQL queries. These SQL snippets can be used directly in the server implementation or adapted for an ORM.

