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
            `INSERT INTO signatures (user_id, signature)
            VALUES($1, $2)
            RETURNING *`,
            //RETURNING gibt die spalten an, die zurueck gegeben werden im result
            // WAS macht dieses ARR?
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
    return db
        .query(
            // kriegt 2 args | 1. string 2. array von parametern
            //Preventing SQL injection
            `INSERT INTO users (first_name, last_name, email, password)
    VALUES($1, $2, $3, $4)
    RETURNING *`,
            [first_name, last_name, email, password]
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

// do we need to crate an account table?
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
        if (!bcrypt.compareSync(password, user.password)) {
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
