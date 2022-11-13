//Pg = postgresql
const { query } = require("express");
const spicedPg = require("spiced-pg");
const { POSTGRES_PWD, POSTGRES_USER } = process.env;
// console.log(POSTGRES_PWD, POSTGRES_USER);
const database = "petition";
//5432 = standardport
const db = spicedPg(
    `postgres:${POSTGRES_USER}:${POSTGRES_PWD}@localhost:5432/${database}`
);

//.querymethod to qurey my database
db.query(`SELECT * FROM signatures`)
    .then(function (result) {
        console.log(result.rows);
    })
    .catch(function (err) {
        console.log(err);
    });

//Preventing SQL injection https://spiced.space/okra/spiced_pg/
module.exports.getSubscribers = () => {
    return db.query(`SELECT firstname, lastname FROM signatures`);
};

module.exports.insertSubscriber = ({ firstname, lastname, signature }) => {
    return db
        .query(
            `INSERT INTO signatures (firstname, lastname, signature)
            VALUES($1, $2, $3)
            RETURNING *`,
            //RETURNING gibt die spalten an, die zurueck gegeben werden im result
            [firstname, lastname, signature]
        ) //once data is saved, set cookie to remember this, then res.render("thanks");
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

