// Creating a SERVER

// const http = require("http");
// import http from "http";

// console.log(http);


// const server = http.createServer(() => {
//     console.log("Servered");
// });


// const gfName = require("./features"); // module
// import * as myObj from "./features.js";
// import gfName from "./features.js";
// import {gfName2} from "./features.js";
// console.log(myObj.gfName2);


// import fs from "fs"; // for reading a File
// import { generateLovePercent } from "./features.js";


// const home = fs.readFileSync("./index.html");
// console.log(home);


// import path from "path";

// console.log(path.dirname("/home/index.js"));


// const home = fs.readFile("./index.html", () => {  // asynchronous Function
//     console.log("file Read");
// });


// console.log(generateLovePercent());

// const server = http.createServer((req,res) => {
//     // console.log(req.url);
//     // res.end("Hello");

//     // console.log(req.method);

//     if(req.url === "/about"){
//         res.end(`<h1>Love is ${generateLovePercent()}</h1>`);
//     }
//     else if(req.url === "/"){

//         res.end("home");
//     }
//     else if(req.url === "/contact"){
//         res.end("<h1>Contact Page</h1>");
//     }
//     else{
//         res.end("<h1>Page Not Found</h1>");
//     }

// });

// server.listen(5000,() => {
//     console.log("Server is Working");
// });

// Express.js


import bcrypt from "bcrypt";
import cookieParser from 'cookie-parser';
import express from 'express';
import fs from "fs";
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import path from 'path';



// Database Connection
mongoose.connect("mongodb://localhost:27017", {
    dbName:"Backend",
}).then(() => console.log("DataBase Connected")).catch( (e) => { console.log(e)});

// Schema
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
});

const User = mongoose.model("User", userSchema);



const app = express();

// const users = [];





// Using Middlewares
app.use(express.static(path.join(path.resolve(), "public")));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// ------------------------------------ some codes

// res.send("Hi");
// res.sendStatus(200);
// res.json({
//     success: true,
//     products: [],
// })

// res.status(400).send("Meri marzi");

const file = fs.readFileSync("./index.js");

// EJS (Embedded JavaScript Templating)


// Setting up View Engine
app.set("view engine", "ejs");

const isAuthenticated = async (req, res, next) =>{

    const {token} = req.cookies;
    if(token){

        const decoded = jwt.verify(token, "cr7");

        console.log(decoded);

        req.user = await User.findById(decoded._id);

        next();
    }
    else{
        res.redirect("/login");
    }

}

// A route handler for the homepage
app.get("/register", (req, res) => {
    
    res.render("register");

});

app.post("/login", async (req, res) => {

    const {email,password} = req.body;

    let user = await User.findOne({ email });

    if(!user) return res.redirect("/register");

    const isMatch = await bcrypt.compare(password, user.password);

    if(!isMatch) return res.render("login", { email , message: "Incorrect Password"});

    const token = jwt.sign({ _id: user._id }, "cr7");
    console.log(token);

    res.cookie("token", token,{
        httpOnly: true,
        expires: new Date(Date.now() + 60 *1000),
    });

    res.redirect("/");

});

app.get("/login", (req, res) => {

    res.render("login");

});

app.post("/register", async(req, res) => {
    // console.log(req.body);

    // Destructuring for names
    const {name, email, password}  = req.body;

    let user = await User.findOne({ email });

    if(user){
        return res.redirect("/login");
    }
    const hashedPassword = await bcrypt.hash(password, 10);



    user =  await User.create({
        name,
        email,
        password: hashedPassword,
    });

    const token = jwt.sign({ _id: user._id }, "cr7");
    // console.log(token);

    res.cookie("token", token,{
        httpOnly: true,
        expires: new Date(Date.now() + 60 *1000),
    });

    res.redirect("/");

});

app.get("/", isAuthenticated, (req, res) => {
    
    res.render("logout", { name: req.user.name });

});

app.post("/login", async(req, res) => {
    // console.log(req.body);

    // Destructuring for names
    const {name, email}  = req.body;

    let user = await User.findOne({ email });

    if(!user){
        return res.redirect("/register");
    }



    user =  await User.create({
        name,
        email,
    });

    const token = jwt.sign({ _id: user._id }, "cr7");
    console.log(token);

    res.cookie("token", token,{
        httpOnly: true,
        expires: new Date(Date.now() + 60 *1000),
    });

    res.redirect("/");

});

app.get("/logout", (req, res) => {


    res.cookie("token", null,{
        httpOnly: true,
        expires: new Date(Date.now()),
    });
    res.redirect("/");

});



// app.get("/success", (req, res) => {

//     res.render("success");

// });

// app.get("/users", (req,res) => {
//     res.json({
//         users,
//     })
// });

// Setting up the database MongoDB | dummy
// app.get("/add", async (req, res) => {

//    await Message.create({
//         name:"Maaz Khan", email:"maazkhan97111@gamil.com"}).then(() => {
//             res.send("Nice");
//         });

// });


// app.post("/contact", async (req, res) => {

//     console.log(req.body.email);

//     const messageData = { username: req.body.name, email: req.body.email };

//     console.log(messageData);

//     Object Destructuring
//     const {name , email} = req.body;

//     await Message.create({ name, email });

//     res.render("Success");

//     res.redirect("/success");

// });



// Start the server
app.listen(5000, () => {
    console.log("Server is Working");
});

