const express = require("express");
const app = express();

const path = require("path");
const fs = require("fs");
const router = express.Router();

const db = require("../db");

//COOKIES
const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");

//login
router.get("/login", (req, res) => {
    res.render("login", {
        title: "Snack Box Petition",
    });
});

router.post("/login", (req, res) => {
    const { email, password } = req.body;
    // console.log("post");
    db.authenticateUser({ email: email, password: password })
        .then((user) => {
            req.session.user_id = user.id;
            res.redirect("/petition");
        })
        .catch((err) => {
            console.log(err);
            res.render("login", {
                message: "quatsch",
                title: "Snack Box Petition",
            });
        });
});

//registration
router.get("/signup", (req, res) => {
    res.render("signup", {
        title: "Snack Box Petition",
    });
});

router.post("/signup", (req, res) => {
    const { firstnameSignup, lastnameSignup, emailSignup, passwordSignup } =
        req.body;

    // console.log("firstnamesignup", firstnameSignup);
    db.insertRegistration({
        first_name: firstnameSignup,
        last_name: lastnameSignup,
        email: emailSignup,
        password: passwordSignup,
    })
        .then((userData) => {
            //console.log("user data", userData);
            req.session.user_id = userData.id;
            //neuer cookie fuer bereits registriert
            //namen auch rein
            res.redirect("/petition");
        })
        .catch((err) => {
            console.log("error in signup post: ", err);
        });
});
module.exports = router;
