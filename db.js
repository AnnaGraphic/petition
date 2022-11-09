//Pg = postgresql
const spicedPg = require("spiced-pg");
const { USER, PWD } = process.env;
const database = "petition";
const db = spicedPg(`postgres:spicedling:${PWD}@localhost:5432/${database}`);

//.querymethod to qurey my database
db.query(`SELECT * FROM ${database}`)
    .then(function (result) {
        console.log(result.rows);
    })
    .catch(function (err) {
        console.log(err);
    });

//Preventing SQL injection https://spiced.space/okra/spiced_pg/

// function getActorByName(actorName) {
//     return db.query(`SELECT * FROM actors WHERE name = $1`, [actorName]);
// }
