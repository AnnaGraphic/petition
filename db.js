//Pg = postgresql
//const { query } = require("express");
const e = require("express");
const spicedPg = require("spiced-pg");
const { POSTGRES_PWD, POSTGRES_USER } = process.env;
// console.log(POSTGRES_PWD, POSTGRES_USER);
const database = "petition";
//5432 = standardport
const db = spicedPg(
    `postgres:${POSTGRES_USER}:${POSTGRES_PWD}@localhost:5432/${database}`
);
const bcrypt = require("bcrypt");

//.querymethod to query my database
// db.query(`SELECT * FROM signatures`)
//     .then(function (result) {
//         // console.log(result.rows);
//     })
//     .catch(function (err) {
//         console.log(err);
//     });

module.exports.getSubscribers = () => {
    return db
        .query(
            `SELECT 
                signatures.signature AS signature, 
                users.first_name AS first_name, 
                users.last_name AS last_name 
            FROM signatures 
            JOIN users ON signatures.user_id=users.id;`
        )
        .then((result) => {
            return result.rows;
        });
};

//Preventing SQL injection https://spiced.space/okra/spiced_pg/
module.exports.insertSubscriber = ({ user_id, signature }) => {
    return db
        .query(
            `INSERT INTO signatures (signature)
            VALUES($1)
            RETURNING *`,
            //RETURNING gibt die spalten an, die zurueck gegeben werden im result
            // WAS macht dieses ARR?
            [signature]
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
            // kriegt 2 args | 1. string 2. array von parametern
            //Preventing SQL injection
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
        });
};

function findUserByEmail(email) {
    return db
        .query("SELECT * FROM users WHERE email=$1", [email])
        .then((results) => {
            if (results.rows.length == 0) {
                throw new Error("email does not exist");
            }
            return results.rows[0];
        });
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
        });
};

////JOIN funzt nicht
// module.exports.findProfile = ({ id: a }) => {
//     return db
//         .query(
//             `SELECT
//                 users_profiles.city AS city,
//                 users.first_name AS first_name,
//                 users.last_name AS last_name
//             FROM users_profiles
//             JOIN users ON users_profiles.user_id=users.id;`,
//             [a]
//         )
//         .then((results) => {
//             console.log("megajoin", result.rows[0]);
//             return results.rows[0];
//         });
// };

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
        });
};

module.exports.countSigners = () => {
    return db.query("SELECT count(*) FROM signatures ").then((result) => {
        console.log("countSigners at db", result.rows[0]);
        return result.rows[0];
    });
};
