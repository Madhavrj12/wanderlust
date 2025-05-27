const User = require("../models/user.js");

module.exports.userPage = (req,res)=>{
    res.render("users/signup.ejs");
}

module.exports.userSignup = async (req,res)=>{
    try{
    let {username,email,password} = req.body;
    let newUser = new User({email,username})
    const registeredUser = await User.register(newUser,password)
    console.log(registeredUser);
    req.login(registeredUser,(err)=>{
            if(err){
                return next(err);
            }
            req.flash("success","welcome to WonderLust");
            res.redirect("/listings");
        })
    }
    catch(e){
        req.flash("error",e.message);
        res.redirect("/signup");
    }

}

module.exports.userLoginPage = (req,res)=>{
    res.render("users/login.ejs");
}

module.exports.userLogin = async(req,res)=>{
    req.flash("success","Welcome back to WonderLust! you are logged in");
    if(res.locals.redirectUrl){
        res.redirect(res.locals.redirectUrl);
    }
    else{
        res.redirect("/listings");
    }
};

module.exports.userLogout = (req,res,next)=>{
    req.logOut((err)=>{
        if(err){
            next(err);
        }
        req.flash("success","you are logged out!");
        res.redirect("/listings");
    })
};
