require("dotenv").config();
const db = require("./db");
const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");
const { getSignatureTable } = require("./db.js");
const PORT = 8080;
const { SECRET } = process.env;

//handlebars
const handlebars = require("express-handlebars");
app.engine("handlebars", handlebars.engine());
app.set("view engine", "handlebars");

const cookieParser = require("cookie-parser");
// install middleware to help us read cookies easily
app.use(cookieParser());
// install middleware to help us read POST body (form data) easily
app.use(express.urlencoded({ extended: false }));

const cookieSession = require("cookie-session");
//initial config
app.use(
    cookieSession({
        // secret is used to generate the 2. cookie used to verify the integrity of the 1. cookie
        secret: `${SECRET}`,
        maxAge: 1000 * 60 * 60 * 24 * 14,
    })
);

//MIDDLEWARE
app.use("/", express.static(path.join(__dirname, "public")));

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
    const { firstName, lastName, signatureCanvas } = req.body;
    db.insertSubscriber({
        firstname: firstName,
        lastname: lastName,
        //signatureCanvas: how to do this?
    }).then(() => {
        // res.cookie("signed", "true");
        res.redirect("/thanks");
    });
});

//thank-you-page
app.get("/thanks", (req, res) => {
    //kaputt
    res.render("thanks", {
        title: "Snack Box Petition",
    });
    db.getSubscribers()
        .then((result) => {})
        .catch((err) => console.log(err));
});

//signers page
app.get("/signers", (req, res) => {
    //  console.log("get thanks");
    db.getSubscribers().then((results) => {
        console.log(results);
        res.render("signers", {
            title: "Snack Box Petition",
            fullname: results.rows,
        });
    });
});

app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));
