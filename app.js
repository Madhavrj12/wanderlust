require('dotenv').config();

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js")

app.use(cookieParser());


const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/reviews.js");
const userRouter = require("./routes/user.js");
const paymentRouter = require("./routes/payment.js");
const bookingRouter = require("./routes/booking.js");
const homeRouter = require("./routes/home.js");

app.use(methodOverride("_method"));
app.set("view engine","ejs");

app.use(express.urlencoded({extended:true}));
app.set(path.join(__dirname,"views"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));


const MONGO_URL = process.env.MONGO_URL;

async function main() {
    try {
        await mongoose.connect(MONGO_URL);
        console.log("MongoDB connected!");
    } catch (err) {
        console.error("MongoDB connection error:", err);
    }
}

main();

const sessionOptions={
    secret: "mysupersecretcode",
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires: Date.now() + 7 * 24 * 60 *60 *1000,
        maxAge: 7 * 24 * 60 *60 *1000,
        httpOnly: true
    }
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

app.get("/",(req,res)=>{
    res.redirect("/home");
});
// Place homeRouter before other routes to ensure it handles the root path
app.use("/home", homeRouter);
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);
app.use("/payments", paymentRouter);
app.use("/bookings", bookingRouter);


app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page Not Found!"));
});

app.use((err,req,res,next)=>{
    let{statusCode = 500, message="Something went wrong!"} = err;
    //res.status(statusCode).send(message);
    res.status(statusCode).render("error.ejs",{err});
});



app.listen("9090",()=>{
    console.log("server is listening to port 9090");
});