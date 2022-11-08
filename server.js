const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");

const handlebars = require("express-handlebars");
app.engine("handlebars", handlebars.engine());
app.set("view engine", "handlebars");

app.use("/", express.static(path.join(__dirname, "public")));

app.get("/start_handlebars", (req, res) => {
    console.log("got a get");
    res.render("start");
});

app.listen(8080, () => console.log("server listening to 8080"));
