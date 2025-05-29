const Listing = require("../models/listing");

module.exports.index = async (req,res)=>{
    const {category, search} = req.query;
    let allListings;
    
    let query = {};
    
    if(category) {
        query.category = category;
    }
    
    if(search) {
        query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { location: { $regex: search, $options: 'i' } },
            { country: { $regex: search, $options: 'i' } }
        ];
    }
    
    allListings = await Listing.find(query).populate("owner");
    
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
    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author"
            }
        })
        .populate({
            path: "owner",
            select: "_id email username"
        });
    
    if(!listing){
        req.flash("error","Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    res.render("listings/show.ejs",{listing});
};

module.exports.newListing = async (req,res,next)=>{
    try {
        const listing = new Listing(req.body.listing);
        listing.owner = req.user._id;
        
        if(req.file) {
            let url = req.file.path;
            let filename = req.file.filename;
            listing.image = {url, filename};
        } else {
            // Default image based on category
            const defaultImages = {
                Beach: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmVhY2h8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60",
                Mountain: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8bW91bnRhaW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60",
                City: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2l0eXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
                Historic: "https://images.unsplash.com/photo-1548013146-72479768bada?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aGlzdG9yaWN8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60",
                Unique: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8dW5pcXVlfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
                Lake: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bGFrZXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
                Luxury: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8bHV4dXJ5JTIwaG90ZWx8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60",
                Ski: "https://images.unsplash.com/photo-1483721310020-03333e577078?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2tpfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
                Safari: "https://images.unsplash.com/photo-1516426122078-c23e76319801?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2FmYXJpfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
                Countryside: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y291bnRyeXNpZGV8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60",
                Tropical: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dHJvcGljYWx8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60"
            };
            listing.image = {
                url: defaultImages[listing.category] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8aG90ZWx8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60",
                filename: "default-image"
            };
        }
        
        await listing.save();
        req.flash("success","New Listing Created!");
        res.redirect("/listings");
    } catch(err) {
        next(err);
    }
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
    try {
        let {id} = req.params;
        let listing = await Listing.findByIdAndUpdate(id,{...req.body.listing});
        
        if(req.file) {
            let url = req.file.path;
            let filename = req.file.filename;
            listing.image = {url, filename};
        } else if(!listing.image || !listing.image.url) {
            // Default image based on category
            const defaultImages = {
                Beach: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmVhY2h8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60",
                Mountain: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8bW91bnRhaW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60",
                City: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2l0eXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
                Historic: "https://images.unsplash.com/photo-1548013146-72479768bada?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aGlzdG9yaWN8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60",
                Unique: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8dW5pcXVlfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
                Lake: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bGFrZXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
                Luxury: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8bHV4dXJ5JTIwaG90ZWx8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60",
                Ski: "https://images.unsplash.com/photo-1483721310020-03333e577078?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2tpfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
                Safari: "https://images.unsplash.com/photo-1516426122078-c23e76319801?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2FmYXJpfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
                Countryside: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y291bnRyeXNpZGV8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60",
                Tropical: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dHJvcGljYWx8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60"
            };
            listing.image = {
                url: defaultImages[listing.category] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8aG90ZWx8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60",
                filename: "default-image"
            };
        }
        
        await listing.save();
        req.flash("success","Listing is updated");
        res.redirect(`/listings/${id}`);
    } catch(err) {
        next(err);
    }
};

module.exports.deleteListing = async (req,res,next)=>{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
};

module.exports.myListings = async (req, res) => {
    const userListings = await Listing.find({ owner: req.user._id }).populate("owner");
    res.render("listings/my-listings.ejs", { userListings });
};