require("dotenv").config();
const db = require("./db");
const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");
const PORT = 8000;
const { SECRET } = process.env;

// const authRouter = require("./routes/auth");
// const route = require("./routes/routes");

//HANDLEBARS
const handlebars = require("express-handlebars");
app.engine("handlebars", handlebars.engine());
app.set("view engine", "handlebars");

//COOKIES
const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");

//MIDDLEWARE
// app.use(authRouter);
// app.use(route);

app.use("/", express.static(path.join(__dirname, "public")));

// install middleware to helps read cookies
app.use(cookieParser());
// install middleware to helps read POST body (form data)
app.use(express.urlencoded({ extended: false }));

// causes session-object to be stringified, base64 encoded , and written to a cookie,
// then decode, parse and attach to req-obj
//Tampering is prevented because of a second cookie that is auto added.
app.use(
    cookieSession({
        // secret is used cookieSession to generate the 2. cookie used to verify the integrity of the 1. cookie
        secret: `${SECRET}`,
        // max age (in milliseconds) is 14 days in this example
        maxAge: 1000 * 60 ** 24 * 14,
        //name for session cookie
        name: "petition-cookie",
    })
);

app.use((req, res, next) => {
    console.log("---------------------");
    console.log("req.url:", req.url);
    console.log("req.method:", req.method);
    console.log("req.session:", req.session);
    console.log("req.session.user_id:", req.session.user_id);
    console.log("---------------------");
    next();
});

app.use(["/register", "/login"], (req, res, next) => {
    if (!req.session.user_id) {
        next();
    } else {
        //if (signature) { res.redirect}
        if (!req.session.signed) {
            return res.redirect("/petition");
        }
    }
});

//ROUTES
app.get("/", (req, res) => {
    if (!req.session.user_id) {
        return res.redirect("/signup");
    }
    return res.redirect("/petition");
});

//registration
app.get("/signup", (req, res) => {
    res.render("signup", {
        title: "Snack Box Petition",
    });
});

app.post("/signup", (req, res) => {
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

//petition-page
app.get("/petition", (req, res) => {
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

app.post("/petition", (req, res) => {
    //console.log("post req");
    const { signature } = req.body;
    const { user_id } = req.session;
    db.insertSubscriber({
        user_id: user_id,
        signature: signature,
    }).then((data) => {
        // console.log("petition data", data);
        req.session.signed = 1;
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

//thank-you-page
app.get("/thanks", (req, res) => {
    const { id, firstName, lastName, signatureCanvas } = req.body;
    db.countSigners().then((result) => {
        console.log("count", result.count);
        countSignatures = result.count;
    });
    db.findUser({
        id: req.session.user_id,
    })
        .then((userData) => {
            res.render("thanks", {
                title: "Snack Box Petition",
                firstname: userData.first_name,
                countSignatures: countSignatures,
            });
        })
        .catch((err) => console.log(err));
});

//signers page
app.get("/signers", (req, res) => {
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
app.get("/profile", (req, res) => {
    // change findUser with findProfile
    db.findUser({
        id: req.session.user_id,
    })
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

app.post("/profile", (req, res) => {
    const userId = req.session.user_id;
    const { ageEdit, cityEdit, url } = req.body;
    console.log("req.body:", req.body);
    //console.log("age, city, url, userId", ageEdit, cityEdit, url, userId);
    db.updateProfile(ageEdit, cityEdit, url, userId)
        .then((user) => {
            res.render("profile", {
                title: "Snack Box Petition",
            });
        })
        .catch((err) => {
            console.log(err);
        });
    //then und catch
});

app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));
