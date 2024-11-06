# Ticket Show Application

A robust and scalable web application for managing bookings, shows, users, and venues with advanced features like JWT-based authentication, Redis caching, periodic task scheduling, and email notifications. This project provides a seamless experience for users to book and manage tickets for various events.

## Features

### User Authentication and Authorization
- **User Signup and Login**: Users can create accounts and authenticate using JSON Web Tokens (JWT), ensuring secure access to the platform.
- **Admin Access**: Admin users have exclusive privileges to manage venues, shows, and bookings.

### Venue and Show Management
- **Add, Edit, Delete Venues and Shows**: Provides functionality for users (typically admins) to manage venues and shows effectively.
- **View Shows by Date or Venue**: Users can view available shows for a specific date or venue, enhancing their browsing experience.

### Booking Management
- **Show Booking**: Users can book seats for a specific show and retrieve details of all their bookings.
- **Booking List Retrieval**: View bookings of all shows by user or by date, with relevant status information.

### Automated Notifications and Reports
- **Monthly Entertainment Report**: Sends users a personalized monthly PDF report of upcoming shows.
- **Daily Reminder Email**: Notifies users who haven't made a booking yet, encouraging engagement.
  
### Data Export and Caching
- **CSV Data Export**: Allows exporting of venue data in CSV format for easy access and reporting.
- **Cached Responses**: Enhances performance and user experience by caching show and venue listings in Redis.

### Periodic Background Tasks
Uses Celery with Redis to handle scheduled tasks:
- **Monthly Report**: Automatically generates and emails monthly reports.
- **Daily Booking Reminder**: Sends reminders at a set time each day to boost user engagement.

## API Endpoints Overview

| Endpoint                | Description                                     |
|-------------------------|-------------------------------------------------|
| `/signup`               | User registration                               |
| `/login`                | User login and JWT generation                   |
| `/getallshows`          | Retrieves a list of all shows                   |
| `/getallvenues`         | Retrieves a list of all venues                  |
| `/getallvenueshows`     | Shows grouped by venue                          |
| `/getallbookings/<username>` | Fetches bookings for a specified user    |
| `/addvenue`             | Adds a new venue                                |
| `/editvenue/<venueid>`  | Edits venue details                             |
| `/deletevenue/<venueid>`| Deletes a venue and related shows/bookings      |
| `/addshow/<venueid>`    | Adds a show at a specific venue                 |
| `/editshow/<showid>`    | Edits details of an existing show               |
| `/deleteshow/<showid>`  | Deletes a show and related bookings             |
| `/book`                 | Books seats for a specific show                 |
| `/export-csv-data/<venueid>` | Initiates CSV data export for a venue    |
| `/download-csvexport`   | Downloads the generated CSV file                |

## Scheduled Tasks

- **Monthly Report Generation**: Generates and emails users a monthly summary of upcoming events.
- **Daily Reminder**: Reminds users daily at a set time to encourage bookings.

## Dependencies

Below is a list of the main dependencies required for this project:

- **Flask**: A micro-framework used for building the API endpoints.
- **Flask-JWT-Extended**: Manages JSON Web Token (JWT) based authentication.
- **Flask-Mail**: Used for sending email notifications and reports.
- **Redis**: Acts as a caching system and message broker for Celery.
- **Celery**: For handling asynchronous and periodic tasks.
- **pdfkit**: Generates PDF files for monthly reports.
- **Jinja2**: Template engine for generating HTML templates.
- **pandas**: For data manipulation and exporting data to CSV.
- **python-dotenv**: Loads environment variables from a .env file.
- **SQLAlchemy**: An ORM for managing database interactions.
- **Werkzeug**: Provides utilities for WSGI applications.
- **requests**: Allows for making HTTP requests to external APIs if needed.
- **pytest**: For running tests and ensuring the application is functioning correctly.
