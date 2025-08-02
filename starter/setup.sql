DROP DATABASE IF EXISTS travelplanner;
CREATE DATABASE travelplanner;
\c travelplanner
CREATE EXTENSION IF NOT EXISTS pgcrypto;
DROP TABLE IF EXISTS accounts;
CREATE TABLE accounts (
    id SERIAL PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL
);
DROP TABLE IF EXISTS planners;
CREATE TABLE planners (
    email TEXT NOT NULL,
    planner_data TEXT NOT NULL
);