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
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);