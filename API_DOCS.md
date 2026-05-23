# 📡 API Documentation

This document outlines the RESTful endpoints provided by the Fastify backend. All endpoints (except the initial login step) require authentication via a JWT. The JWT can be provided either via a secure `httpOnly` cookie (`auth_token`) or as a Bearer token in the `Authorization` header.

Base URL: `/api`

---

## 🔐 Authentication Endpoints

### 1. Request Login (Send OTP)
- **Endpoint:** `POST /auth/login`
- **Description:** Validates credentials and Turnstile bot token, then emails a 6-digit OTP to the user.
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "user123",
    "turnstile_token": "0x4AAAAAA..."
  }
  ```
- **Success Response:** `200 OK`
  ```json
  {
    "requiresOTP": true,
    "email": "user@example.com"
  }
  ```

### 2. Verify OTP & Issue Token
- **Endpoint:** `POST /auth/verify-otp`
- **Description:** Validates the 6-digit OTP and issues a JWT session token.
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "code": "123456"
  }
  ```
- **Success Response:** `200 OK` (Also sets `auth_token` cookie)
  ```json
  {
    "token": "eyJhbGciOiJIUzI1...",
    "user": {
      "id": "u1",
      "email": "user@example.com",
      "role": "admin",
      "name": "Admin User"
    }
  }
  ```

### 3. Get Current Session
- **Endpoint:** `GET /auth/me`
- **Description:** Returns the current logged-in user based on the active JWT.
- **Success Response:** `200 OK`
  ```json
  {
    "user": {
      "id": "u1",
      "email": "user@example.com",
      "role": "admin",
      "name": "Admin User"
    },
    "token": "eyJhbGciOiJIUzI1..."
  }
  ```

### 4. Logout
- **Endpoint:** `POST /auth/logout`
- **Description:** Clears the active session and removes the `auth_token` cookie.
- **Success Response:** `200 OK`
  ```json
  {
    "success": true
  }
  ```

---

## 🎓 Student Management Endpoints

*All student endpoints require a valid JWT session.*

### 1. Get All Students
- **Endpoint:** `GET /students`
- **Description:** Retrieves a list of all student records.
- **Access:** Admin & Viewer
- **Success Response:** `200 OK`
  ```json
  [
    {
      "id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "student_email": "john.doe@university.edu",
      "major": "Computer Science",
      "enrollment_year": 2022,
      "gpa": 3.8
    }
  ]
  ```

### 2. Add New Student
- **Endpoint:** `POST /students`
- **Description:** Creates a new student record.
- **Access:** Admin ONLY
- **Request Body:**
  ```json
  {
    "first_name": "Jane",
    "last_name": "Smith",
    "student_email": "jane.smith@university.edu",
    "major": "Software Engineering",
    "enrollment_year": 2023,
    "gpa": 4.0
  }
  ```
- **Success Response:** `201 Created`

### 3. Update Student
- **Endpoint:** `PATCH /students/:id`
- **Description:** Updates an existing student's information.
- **Access:** Admin ONLY
- **Request Body:** (Partial updates supported)
  ```json
  {
    "major": "Data Science",
    "gpa": 3.9
  }
  ```
- **Success Response:** `200 OK`

### 4. Delete Student
- **Endpoint:** `DELETE /students/:id`
- **Description:** Permanently removes a student record.
- **Access:** Admin ONLY
- **Success Response:** `204 No Content`
