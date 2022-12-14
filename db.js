const e = require("express");

const bcrypt = require("bcrypt");
const spicedPg = require("spiced-pg");
const { POSTGRES_PWD, POSTGRES_USER } = process.env;
const database = "petition";
//5432 = standardport
const db = spicedPg(
    process.env.DATABASE_URL ||
        `postgres:postgres:postgres@localhost:5432/petition`
);

module.exports.getSubscribers = () => {
    return db
        .query(
            `SELECT users.first_name, users.last_name, users_profiles.age, users_profiles.city, users_profiles.url
        FROM users
        JOIN signatures
        ON users.id = signatures.user_id   
        LEFT JOIN users_profiles
        ON signatures.user_id = users_profiles.user_id`
        )
        .then((result) => {
            console.log("1 RESULTS SIGNERS", result.rows);
            return result.rows;
        });
};

module.exports.insertSubscriber = ({ user_id, signature }) => {
    return db
        .query(
            `INSERT INTO signatures (user_id, signature)
            VALUES($1, $2)
            RETURNING *`,
            [user_id, signature]
        )
        .then((result) => {
            // console.log("result", result);
            return result.rows[0];
        });
};

module.exports.insertRegistration = ({
    first_name,
    last_name,
    email,
    password,
}) => {
    const salt = bcrypt.genSaltSync();
    const hash = bcrypt.hashSync(password, salt);
    return db
        .query(
            `INSERT INTO users (first_name, last_name, email, pwd_hash)
    VALUES($1, $2, $3, $4)
    RETURNING *`,
            [first_name, last_name, email, hash]
        )
        .then((result) => {
            // console.log(
            //     "result insertRegistration",
            //     result,
            //     "result.rows[0]",
            //     result.rows[0]
            // );
            return result.rows[0];
        })
        .catch((err) => console.log(err));
};

function findUserByEmail(email) {
    return db
        .query("SELECT * FROM users WHERE email=$1", [email])
        .then((results) => {
            if (results.rows.length == 0) {
                throw new Error("email does not exist");
            }
            return results.rows[0];
        })
        .catch((err) => console.log(err));
}

module.exports.authenticateUser = ({ email, password }) => {
    return findUserByEmail(email).then((user) => {
        if (!bcrypt.compareSync(password, user.pwd_hash)) {
            throw new Error("password incorrect");
        }
        return user;
    });
};

module.exports.findUser = ({ id: a }) => {
    return db
        .query("SELECT * FROM users WHERE id = $1", [a])
        .then((results) => {
            return results.rows[0];
        })
        .catch((err) => console.log(err));
};

module.exports.updateProfile = (age, city, url, userId) => {
    console.log("age, city, url, userId", age, city, url, userId);
    return db
        .query(
            `INSERT INTO users_profiles (age, city, url, user_id)
        VALUES($1, $2, $3, $4)
        ON CONFLICT (user_id)
        DO UPDATE SET age = $1, city = $2, url = $3
        RETURNING *`,
            [age, city, url, userId]
        ) //what to do with result.rows?
        .then((result) => {
            //console.log("query update ", result.rows[0]);
            return result.rows[0];
        })
        .catch((err) => console.log(err));
};

module.exports.updateUsersTable = (first_name, last_name, email, userId) => {
    console.log(
        "first_name, last_name, email",
        first_name,
        last_name,
        email,
        userId
    );
    return db
        .query(
            `UPDATE  users 
            SET first_name = $1, last_name = $2, email = $3
            WHERE id = $4 
        RETURNING *`,
            [first_name, last_name, email, userId]
        ) //what to do with result.rows?
        .then((result) => {
            //console.log("query update ", result.rows[0]);
            return result.rows[0];
        })
        .catch((err) => console.log(err));
};

////////
module.exports.countSigners = () => {
    return db.query("SELECT count(*) FROM signatures ").then((result) => {
        console.log("countSigners at db", result.rows[0]);
        return result.rows[0];
    });
};

module.exports.showProfile = (userId) => {
    return db
        .query(
            `SELECT users.first_name, users.last_name, users.email, users_profiles.age, users_profiles.city, users_profiles.url
        FROM users 
        JOIN signatures
        ON users.id = signatures.user_id   
        LEFT JOIN users_profiles
        ON signatures.user_id = users_profiles.user_id WHERE users.id = $1`,
            [userId]
        )
        .then((result) => {
            return result.rows[0];
        });
};
