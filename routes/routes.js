const express = require("express");
const router = express.Router();
const db = require("../db");

//ROUTES

router.get("/", (req, res) => {
    if (!req.session.user_id) {
        return res.redirect("/signup");
    }
    return res.redirect("/petition");
});

//petition-page
router.get("/petition", (req, res) => {
    //console.log(req.session.signed);
    //console.log("req.session.user_id", req.session.user_id)
    if (req.session && req.session.signed) {
        return res.redirect("/thanks");
    }
    db.findUser({
        id: req.session.user_id,
    })
        .then((userData) => {
            // console.log("petition userdata", userData);
            res.render("petition", {
                title: "Snack Box Petition",
                firstName: userData.first_name,
                lastName: userData.last_name,
            });
        })
        .catch((err) => {
            console.log(err);
        });
});

router.post("/petition", (req, res) => {
    //console.log("post req");
    const { signature } = req.body;
    const { user_id } = req.session;
    db.insertSubscriber({
        user_id: user_id,
        signature: signature,
    })
        .then((data) => {
            // console.log("petition data", data);
            req.session.signed = 1;
            res.redirect("/thanks");
        })
        .catch((err) => console.log("petition-post-err", err));
});

//thank-you-page
router.get("/thanks", (req, res) => {
    const { id, firstName, lastName, signatureCanvas } = req.body;
    db.countSigners().then((result) => {
        console.log("count", result.count);
        countSignatures = result.count;
    });
    db.findUser({
        id: req.session.user_id,
    })
        .then((userData) => {
            console.log();
            res.render("thanks", {
                title: "Snack Box Petition",
                firstname: userData.first_name,
                countSignatures: userData.countSignatures,
            });
        })
        .catch((err) => console.log(err));
});

//signers page
router.get("/signers", (req, res) => {
    db.getSubscribers().then((result) => {
        console.log("RESULTS SIGNERS", result);
        req.session.user_signed = result.id;
        res.render("signers", {
            title: "Snack Box Petition",
            signatures: result,
        });
    });
});

// edit profile
router.get("/profile", (req, res) => {
    // change findUser with findProfile
    db.showProfile(req.session.user_id)
        .then((userData) => {
            console.log("profile userdata", userData);
            res.render("profile", {
                title: "Snack Box Petition",
                firstName: userData.first_name,
                lastName: userData.last_name,
                city: userData.city,
                age: userData.age,
                eMail: userData.email,
                homepage: userData.url,
            });
        })
        .catch((err) => {
            console.log(err);
        });
});

router.post("/profile", (req, res) => {
    const userId = req.session.user_id;
    const { firstnameEdit, lastnameEdit, emailEdit, ageEdit, cityEdit, url } =
        req.body;
    console.log("req.body:", req.body);
    //also updateUsersTable
    //console.log("age, city, url, userId", ageEdit, cityEdit, url, userId);
    const updateUsersPromise = db
        .updateUsersTable(firstnameEdit, lastnameEdit, emailEdit, userId)
        .catch((err) => {
            console.log(err);
        });
    const updateProfilePromise = db
        .updateProfile(ageEdit, cityEdit, url, userId)
        .catch((err) => {
            console.log(err);
        });
    Promise.all([updateProfilePromise, updateUsersPromise])
        .then(([profileData, userData]) => {
            console.log("profile userdata", profileData, userData);
            res.render("profile", {
                title: "Snack Box Petition",
                firstName: userData.first_name,
                lastName: userData.last_name,
                city: profileData.city,
                age: profileData.age,
                eMail: userData.email,
                homepage: profileData.url,
            });
        })
        .catch((err) => {
            console.log(err);
        });
});

module.exports = router;
