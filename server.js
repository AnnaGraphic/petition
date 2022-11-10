require("dotenv").config();
const db = require("./db");
const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");
const { getSignatureTable } = require("./db.js");
const PORT = 8080;
const { SECRET } = process.env;

//HANDLEBARS
const handlebars = require("express-handlebars");
app.engine("handlebars", handlebars.engine());
app.set("view engine", "handlebars");

//COOKIES
const cookieParser = require("cookie-parser");
// install middleware to help us read cookies easily
app.use(cookieParser());
// install middleware to help us read POST body (form data) easily
app.use(express.urlencoded({ extended: false }));

const cookieSession = require("cookie-session");

//MIDDLEWARE
app.use("/", express.static(path.join(__dirname, "public")));

// causes session-object to be stringified, base64 encoded , and written to a cookie,
// then decode, parse and attach to req-obj
//Tampering is prevented because of a second cookie that is auto added.
app.use(
    cookieSession({
        // secret is used to generate the 2. cookie used to verify the integrity of the 1. cookie
        secret: `${SECRET}`,
        // max age (in milliseconds) is 14 days in this example
        maxAge: 1000 * 60 * 60 * 24 * 14,
        //name for session cookie
        name: "petition-cookie",
    })
);

app.use("/", (req, res, next) => {
    console.log(req.session);
});

//ROUTES

//petition-page
app.get("/", (req, res) => {
    // check negative first so i dont need an else
    // if (!(req.session && req.session.user_id){return res.redirect(/login)})
    res.render("petition", {
        title: "Snack Box Petition",
    });
});

app.post("/", (req, res) => {
    //console.log("post req");

    const { id, firstName, lastName, signatureCanvas } = req.body;
    db.insertSubscriber({
        firstname: firstName,
        lastname: lastName,

        //signatureCanvas: how to do this?
    }).then((data) => {
        console.log("data", data);
        req.session.user_id = data.id;
        res.redirect("/thanks");
    });
});

//login
app.get("/login", (req, res) => {
    res.render("login", {
        title: "Snack Box Petition",
    });
});

app.post("/login", (req, res) => {
    const { email, password } = req.body;
    console.log("post");
    db.authenticateUser(email, password)
        .then((user) => {
            // store the id of the logged in user inside the session cookie
            req.session.user_id = user.id;
            res.redirect("/petition");
            console.log(req.session.user_id);
        })
        .catch(() => {
            res.render("login", {
                message: "quatsch",
                title: "Snack Box Petition",
            });
        });
});

//thank-you-page
app.get("/thanks", (req, res) => {
    res.render("thanks", {
        title: "Snack Box Petition",
    });
    db.getSubscribers()
        .then((result) => {})
        .catch((err) => console.log(err));
});

//signers page
app.get("/signers", (req, res) => {
    db.getSubscribers().then((results) => {
        // console.log(results);
        req.session.user_signed = results.id;
        res.render("signers", {
            title: "Snack Box Petition",
            //fullname = selbst vergebene variable, result.rows
            fullname: results.rows,
        });
    });
});

//registration
app.get("/signup", (req, res) => {
    res.render("signup", {
        title: "Snack Box Petition",
    });
});

// app.post("/signup", (req, res) => {
//     console.log("signup", req.session);
// });

app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));
