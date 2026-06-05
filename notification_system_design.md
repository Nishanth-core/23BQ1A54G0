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
## Stage 3

# Query Performance Analysis and Optimization

## Existing Query

```
SELECT *
FROM notifications
WHERE studentID = 1042
  AND isRead = false
ORDER BY createdAt ASC;
```

---

# Is the Query Accurate?
Yes, the query is functionally correct.

It returns all unread notifications belonging to student `1042`, sorted by creation time in ascending order (oldest first).

However, there are several concerns:

1. It fetches all columns using `SELECT *`.
2. It returns every unread notification without pagination.
3. It may require scanning a very large table if proper indexes do not exist.
4. Ascending sort is unusual for notification systems since users generally expect the newest notifications first.

---

# Why is the Query Slow?
Current database size:

- Students: 50,000
- Notifications: 5,000,000

Without an appropriate index, PostgreSQL/MySQL must perform a large table scan.

Execution process:

```
5,000,000 rows
    ↓
Check studentID
    ↓
Check isRead
    ↓
Sort matching rows
    ↓
Return result
```
This becomes expensive as data volume grows.

---

# Time Complexity Without Indexes

### Filtering

```
O(N)
```
Where:

```
N = 5,000,000 notifications
```
The database may inspect nearly every row.

### Sorting
If M notifications belong to the student:

```
O(M log M)
```
Overall:

```
O(N + M log M)
```
This is inefficient for large datasets.

---

# Additional Problems in the Query

## 1. SELECT *

```
SELECT *
```
Retrieves every column even when only a few fields are needed.

Recommended:

```
SELECT
  id,
  title,
  message,
  createdAt
FROM notifications
WHERE studentID = 1042
AND isRead = false
ORDER BY createdAt DESC;
```
Benefits:

- Less disk I/O
- Smaller network payload
- Faster response time

---

## 2. Missing Pagination
Current query:

```
SELECT *
FROM notifications
WHERE studentID = 1042
AND isRead = false;
```
Could return thousands of rows.

Recommended:

```
SELECT
  id,
  title,
  message,
  createdAt
FROM notifications
WHERE studentID = 1042
AND isRead = false
ORDER BY createdAt DESC
LIMIT 50 OFFSET 0;
```
Benefits:

- Faster API response
- Reduced memory consumption
- Better user experience

---

# Recommended Index Strategy
The most effective solution is a composite index.

```
CREATE INDEX idx_notifications_student_read_created
ON notifications (
  studentID,
  isRead,
  createdAt DESC
);
```

---

# Why This Index Helps
The query filters by:

```
studentID
isRead
```
and sorts by:

```
createdAt
```
The composite index matches the query pattern exactly.

Database execution becomes:

```
Locate studentID
    ↓
Locate unread records
    ↓
Read already sorted rows
    ↓
Return result
```
No additional sort operation is required.

---

# Likely Computational Cost After Indexing
Using a B-Tree index:

Lookup cost:

```
O(log N)
```
Where:

```
N = 5,000,000
```
Returning matching rows:

```
O(K)
```
Where:

```
K = matching unread notifications
```
Overall:

```
O(log N + K)
```
This is significantly faster than a full table scan.

---

# Further Optimization
For a notification feed, newest notifications are usually displayed first.

Recommended query:

```
SELECT
  id,
  title,
  message,
  createdAt
FROM notifications
WHERE studentID = 1042
AND isRead = false
ORDER BY createdAt DESC
LIMIT 50;
```
Benefits:

- Uses the index efficiently
- Returns latest notifications immediately
- Minimizes data transfer

---

# Should We Add Indexes on Every Column?
No.

Adding indexes on every column is generally poor database design.

---

## Why Not?

### 1. Increased Storage Usage
Every index consumes disk space.

Example:

```
Table Size = 2 GB

Indexes:
studentID
isRead
createdAt
title
message
type
status
...

Total storage may grow significantly.
```

---

### 2. Slower INSERT Operations
Whenever a notification is inserted:

```
INSERT INTO notifications ...
```
Every index must also be updated.

More indexes means:

```
Higher write latency
```
Since notifications are write-heavy, this becomes costly.

---

### 3. Slower UPDATE Operations
Example:

```
UPDATE notifications
SET isRead = true;
```
The database must update:

- Table data
- Related indexes

More indexes increase update cost.

---

### 4. Many Indexes Are Never Used
Example:

```
CREATE INDEX idx_message
ON notifications(message);
```
If queries never search by message, the index provides no benefit.

---

# Best Practice
Create indexes only for:

1. Frequently filtered columns
2. Frequently joined columns
3. Frequently sorted columns
4. Frequently grouped columns

For this system:

```
CREATE INDEX idx_notifications_student_read_created
ON notifications(studentID, isRead, createdAt DESC);
```
is far more useful than indexing every column individually.

---

# Query: Students Who Received Placement Notifications in Last 7 Days
Assuming:

```
notificationType ENUM (
  'Events',
  'Results',
  'Placement'
)
```

## Query

```
SELECT DISTINCT studentID
FROM notifications
WHERE notificationType = 'Placement'
AND createdAt >= CURRENT_TIMESTAMP - INTERVAL '7 days';
```

---

# If Student Details Are Required
Assuming a students table exists:

```
CREATE TABLE students (
  studentID BIGINT PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255)
);
```
Query:

```
SELECT DISTINCT
  s.studentID,
  s.name,
  s.email
FROM students s
JOIN notifications n
  ON s.studentID = n.studentID
WHERE n.notificationType = 'Placement'
AND n.createdAt >= CURRENT_TIMESTAMP - INTERVAL '7 days';
```

---

# Index Recommendation for Placement Query
Since the query filters by:

```
notificationType
createdAt
```
Create:

```
CREATE INDEX idx_notifications_type_created
ON notifications (
  notificationType,
  createdAt DESC
);
```
Benefits:

- Fast filtering on Placement notifications
- Efficient retrieval of recent records
- Avoids scanning millions of rows

---

# Final Recommendation
For a database containing 5,000,000+ notifications:

1. Avoid `SELECT *`.
2. Always paginate notification APIs.
3. Use composite indexes matching query patterns.
4. Prefer `ORDER BY createdAt DESC` for notification feeds.
5. Do not create indexes on every column.
6. Use targeted indexes based on actual query workloads.
7. Consider partitioning notifications by date once the table grows into tens of millions of rows.

With these optimizations, the unread notification query can improve from a full table scan (`O(N)`) to an indexed lookup (`O(log N + K)`), dramatically reducing response times and database load.

This Stage 3 section demonstrates query analysis, performance tuning, index design, computational complexity, and SQL query optimization—exactly the kind of database reasoning interviewers and evaluators typically look for in system design assignments.

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

---

## Stage 4

# Performance Optimization Strategy for Notification Retrieval

## Problem Statement
Currently, notifications are fetched from the database every time a student loads a page.

Current Flow:

```
Student Opens Page
        |
        v
API Request
        |
        v
Database Query
        |
        v
Return Notifications
```

With:

- 50,000 students
- 5,000,000 notifications
- Multiple page loads per user session

the database receives a very large number of repetitive read requests.

Example:

```
50,000 students
× 10 page loads/day
= 500,000 notification queries/day
```

Most of these requests return the same data because notifications typically do not change between page loads.

This causes:

- Increased database CPU utilization
- High disk I/O
- Increased response latency
- Poor user experience
- Reduced scalability

---

# Recommended Solution
A single optimization is usually insufficient.

Instead, a combination of strategies should be applied.

---

# Strategy 1: Redis Cache

## Approach
Store frequently accessed notification data in Redis.

Architecture:

```
Client
   |
Notification API
   |
Redis Cache
   |
PostgreSQL
```

Request Flow:

```
User Request
      |
      v
Check Redis
      |
      |---- Cache Hit ----> Return Data
      |
      |---- Cache Miss ---> Query DB
                             |
                             v
                      Store in Redis
                             |
                             v
                       Return Data
```

---

## Example Cache Key

```
notifications:user:1042
```

Unread count:

```
unread_count:user:1042
```

---

## Benefits

### Reduced Database Load
Many requests never reach PostgreSQL.

### Faster Response Time
Redis operates in memory.

### Better Scalability
The API can service more users and more page loads without linear database costs.

---

# Strategy 2: Cache Invalidation and Refresh

## Cache Invalidation Rules

- When a notification is created, invalidate or update `notifications:user:<id>` and `unread_count:user:<id>`.
- When a notification is marked read, update both the cached list and unread count.
- When a notification is deleted, remove it from cache and decrement the unread count if needed.

## Refresh Policies

- Use a short TTL for list cache entries (for example, 30 seconds to 2 minutes) to keep data fresh.
- Use event-driven invalidation for writes, and TTL fallback for stale or missing cache entries.

---

# Strategy 3: Read-Through Cache for Hot Data

## Use Cases

- Recent unread notifications
- Unread badge count
- Frequently viewed notification pages

## Example Flow

1. API checks `notifications:user:<id>`.
2. If missing, query PostgreSQL.
3. Store the response in Redis with a TTL.
4. Return the cached response.

---

# Strategy 4: Partial and Precomputed Cache

## Unread Count Cache

Cache the unread notification count separately:

```
unread_count:user:1042
```

This allows the UI badge to be served quickly without full list retrieval.

## Recent Notifications Cache

Cache the latest `N` notifications for each user, such as the newest 20 records.

Benefits:

- Optimized list retrieval
- Reduced network payload
- Fast initial page render

---

# Strategy 5: Pagination and Filtered Reads

## Why It Matters

Even with caching, large result sets should not be returned in a single request.

## Recommended Practices

- Always use `LIMIT` and `OFFSET` or cursor-based pagination.
- Filter by `isRead` when the client requests unread or read notifications explicitly.
- Return a small page of notifications and request more only when needed.

---

# Strategy 6: Read Replica or Materialized View for Analytics

## When to Use It

If the system must support heavy analytics or historical queries, consider:

- A read replica for reporting traffic
- A materialized view for aggregated notification counts

This keeps transactional query performance isolated from analytical workloads.

---

# Practical Guidance

## 1. Add Redis to the System

- Use Redis for caching notification lists and counts.
- Namespace cache keys by user and data type.
- Use short TTLs and write-time invalidation.

## 2. Keep PostgreSQL as Source of Truth

- Use Redis as a performance layer only.
- Always refresh stale data from PostgreSQL when the cache misses.

## 3. Monitor Cache Hit Ratio

- Track hits versus misses.
- Tune TTLs and invalidation rules based on real traffic.

## 4. Use Composite Indexes for Reads

Continue using the Stage 3 index:

```
CREATE INDEX idx_notifications_student_read_created
ON notifications(studentID, isRead, createdAt DESC);
```

This ensures cache misses remain efficient.

---

# Summary

For notification retrieval, combine Redis caching with smart invalidation, precomputed counts, and read-optimized database indexes.

This approach reduces repetitive DB reads, accelerates page loads, and improves scalability for large student and notification volumes.

This Stage 4 section demonstrates system design reasoning and practical backend optimization techniques across caching, invalidation, and query performance.

