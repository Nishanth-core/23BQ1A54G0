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
