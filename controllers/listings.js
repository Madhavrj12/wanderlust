const Listing = require("../models/listing");

module.exports.index = async (req,res)=>{
    const {category, search} = req.query;
    let allListings;
    
    // Build the query object
    let query = {};
    
    // Add category filter if provided
    if(category) {
        query.category = category;
    }
    
    // Add search filter if provided
    if(search) {
        query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { location: { $regex: search, $options: 'i' } },
            { country: { $regex: search, $options: 'i' } }
        ];
    }
    
    // Execute the query
    allListings = await Listing.find(query);
    
    const categories = ["Beach", "Mountain", "City", "Historic", "Unique", "Lake", "Luxury", "Ski", "Safari", "Countryside", "Tropical"];
    res.render("listings/index.ejs", {
        allListings, 
        categories, 
        selectedCategory: category,
        searchQuery: search
    });
}

module.exports.renderNewForm = (req,res)=>{
    res.render("listings/new.ejs");
}

module.exports.showListing = async (req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id).populate({path:"reviews",populate:{
        path:"author",
    },})
    .populate("owner");
    if(!listing){
        req.flash("error","Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    res.render("listings/show.ejs",{listing});
};

module.exports.newListing = async (req,res,next)=>{
    let url = req.file.path;
    let filename = req.file.filename;
    const listing = new Listing(req.body.listing);
    listing.owner = req.user._id;
    listing.image= {url, filename};
    await listing.save();
    req.flash("success","New Listing Created!");
    res.redirect("/listings");
}

module.exports.editListing = async (req,res,next)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    res.render("listings/edit.ejs",{listing});
};

module.exports.updateListing = async (req,res,next)=>{
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id,{...req.body.listing});
    
    if(typeof req.file !== "undefined"){
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = {url,filename};
    await listing.save();
    }
    req.flash("success","Listing is updated");
    res.redirect(`/listings/${id}`);
};


module.exports.deleteListing = async (req,res,next)=>{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
};