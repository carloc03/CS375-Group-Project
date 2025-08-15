CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS accounts (
    id SERIAL PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS planners (
    email TEXT NOT NULL,
    planner_data TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS flight (
    flightNumber TEXT NOT NULL,
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    departure TIMESTAMP,
    returnDate TIMESTAMP,
    adults INTEGER,
    children INTEGER,
    infants INTEGER,
    travelClass TEXT,
    cost DECIMAL(10,2),
    duration TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS session_storage (
    session_token TEXT NOT NULL,
    email TEXT NOT NULL
);