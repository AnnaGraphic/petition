require("dotenv").config();
//const db = require("db");
const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");

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
        secret: `I'm always angry.`,
        maxAge: 1000 * 60 * 60 * 24 * 14,
    })
);

app.use("/", express.static(path.join(__dirname, "public")));

//petition-page
app.get("/", (req, res) => {
    console.log("get req");
    // check negative first so i dont need an else
    // if (!(req.session && req.session.user_id){return res.redirect(/login)})
    res.render("petition", {
        title: "Petition",
    });
});

app.post("/", (req, res) => {
    console.log("post req");
    res.setHeader("Content-Type", "text/html");
    res.cookie("signed", "true");
    res.statusCode = 200;
    return res.redirect("/thanks");
});

//thank-you-page
app.get("/thanks", (req, res) => {
    console.log("get tanks");
    res.render("thanks", {
        title: "Petition",
    });
});

//signers page
app.get("/signers", (req, res) => {
    console.log("get tanks");
    res.render("signers", {
        title: "Petition",
    });
});

app.listen(8080, () => console.log("server listening to 8080"));
