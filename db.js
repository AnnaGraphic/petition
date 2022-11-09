//Pg = postgresql
const { query } = require("express");
const spicedPg = require("spiced-pg");
const { POSTGRES_PWD, POSTGRES_USER } = process.env;
// console.log(POSTGRES_PWD, POSTGRES_USER);
const database = "petition";
//5432 = standardport
const db = spicedPg(
    `postgres:postgres:${POSTGRES_PWD}@localhost:5432/${database}`
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
            result.rows[0];
        });
};
// do we need to crate a account table?
// module.exports.findUserByEmail(email) = () => {
//     return db.query(`SELECT * FROM users WHERE email=$1`, [email]);
// }
