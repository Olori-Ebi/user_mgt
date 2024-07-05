# User Management System

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Running Tests](#running-tests)
- [Seeding the Database](#seeding-the-database)
- [Rate Limiting](#rate-limiting)
- [Security](#security)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

## Overview
The User Management System is a backend service built with NestJS, providing functionality for user registration, authentication, and administration.

## Features
- User registration and authentication
- Role-based access control
- CRUD operations for users
- Rate limiting for endpoints
- Security headers and CORS configuration
- Database migrations and seeding
- API documentation with Swagger

## Tech Stack
- Node.js
- NestJS
- TypeScript
- TypeORM
- PostgreSQL
- bcryptjs
- JSON Web Tokens (JWT)
- Jest
- Swagger

## Installation
1. Clone the repository:
    ```bash
    git clone https://github.com/Olori-Ebi/user_mgt.git
    cd user_mgt
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

## Configuration
Create a `.env` file in the root directory and add the following environment variables:
```env
POSTGRES_HOST=your_postgres_host
POSTGRES_PORT=your_postgres_port
POSTGRES_USER=your_postgres_user
POSTGRES_PASSWORD=your_postgres_password
POSTGRES_DATABASE=your_postgres_database
SECRET=your_secret
PORT=your_port
```

## Running the application with Docker
```bash
    docker-compose up --build
```
## Running Tests
```bash
    npm run test
```
-  Test was ran on just before the application starts

## Seeding The Database
- Migrations are ran on the database just before the application starts. Two admin users and two regular users have been seeded for your testing

## Rate Limiting
- Done using @nestjs/throttler where I configured each client to only make up to 2 requests every 10 seconds.

## API Documentation
```bash
    The API Documentation will be available at http://localhost:3000/api/doc
```