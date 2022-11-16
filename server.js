require("dotenv").config();
const db = require("./db");
const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");
const PORT = 8000;
const { SECRET } = process.env;

const authRouter = require("./routes/auth");
const routes = require("./routes/routes");

//HANDLEBARS
const handlebars = require("express-handlebars");
app.engine("handlebars", handlebars.engine());
app.set("view engine", "handlebars");

//COOKIES
const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");

//MIDDLEWARE

app.use("/", express.static(path.join(__dirname, "public")));
app.use(cookieParser());
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
app.use(authRouter);
app.use(routes);

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

app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));
