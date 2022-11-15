DROP TABLE IF EXISTS signatures;
DROP TABLE IF EXISTS users_profiles;
DROP TABLE IF EXISTS users;


CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL CHECK (first_name != ''),
    last_name VARCHAR(255) NOT NULL CHECK (last_name != ''),
    email VARCHAR(255) NOT NULL UNIQUE,
    pwd_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE signatures (
     id SERIAL PRIMARY KEY,
     signature TEXT,
    user_id INT NULL UNIQUE REFERENCES users(id)
    --  CONSTRAINT user_id 
    --     FOREIGN KEY (id)
    --          REFERENCES users(id)
);

CREATE TABLE users_profiles (
    id SERIAL PRIMARY KEY,
    age VARCHAR(255),
    city VARCHAR(255),
    url VARCHAR(255),
    user_id INT NULL UNIQUE REFERENCES users(id)
    -- CONSTRAINT user_id 
    --     FOREIGN KEY (id)
    --          REFERENCES users(id)
);