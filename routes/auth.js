const express = require("express");
const app = express();

const path = require("path");
const fs = require("fs");
const router = express.Router();

const db = require("../db");

//COOKIES
const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");

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
            console.log("user data insertReg", userData);
            req.session.user_id = userData.id;
            res.redirect("/petition");
        })
        .catch((err) => {
            console.log("error in signup post: ", err);
            res.render("login", {
                err: err.message,
                title: "Snack Box Petition",
            });
        });
});

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
            console.log("pwd mail", err.message);
            res.render("login", {
                err: err.message,
                title: "Snack Box Petition",
            });
        });
});

//logout
router.post("/logout", (req, res) => {
    req.session = null;
    res.redirect("/login");
});

module.exports = router;
