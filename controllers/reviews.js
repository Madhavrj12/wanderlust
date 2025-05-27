const Review = require("../models/review.js");
const Listing = require("../models/listing.js");

module.exports.createReview = async (req,res,next)=>{
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    req.flash("success","review created successfully");
    res.redirect(`/listings/${listing._id}`);
};

module.exports.deleteReview = async (req,res,next)=>{
    let {id, reviewId} = req.params;
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success","review deleted succesfully");
    res.redirect(`/listings/${id}`);
};