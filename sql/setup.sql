DROP TABLE IF EXISTS signatures;
DROP TABLE IF EXISTS users;

CREATE TABLE signatures (
     id SERIAL PRIMARY KEY,
    --  firstname VARCHAR NOT NULL CHECK (firstname != ''),
    --  lastname VARCHAR NOT NULL CHECK (lastname != ''),
     signature TEXT,
     user_id INT NOT NULL
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL CHECK (first_name != ''),
    last_name VARCHAR(255) NOT NULL CHECK (last_name != ''),
    email VARCHAR(255) NOT NULL UNIQUE,
    pwd_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users_profiles (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    age VARCHAR(255),
    city VARCHAR(255),
    url VARCHAR(255)
);