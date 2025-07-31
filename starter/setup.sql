DROP DATABASE IF EXISTS travelplanner;
CREATE DATABASE travelplanner;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
\c travelplanner
CREATE TABLE accounts (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL
);
CREATE TABLE planners (
    email TEXT NOT NULL,
    planner_data TEXT NOT NULL
);