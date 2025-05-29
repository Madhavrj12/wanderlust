const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer = require("multer");
const {storage} = require("../cloudConfig.js");
const upload = multer({storage});
const Booking = require("../models/booking");
const Listing = require("../models/listing");

//index route
router.get("/",wrapAsync(listingController.index));

//new 
router.get("/new",isLoggedIn,listingController.renderNewForm);

// My Listings Route - Must be before /:id route
router.get("/my-listings", isLoggedIn, wrapAsync(listingController.myListings));

//show Route
router.get("/:id",wrapAsync(listingController.showListing));

//create
router.post("/", isLoggedIn, upload.single("listing[image]"), validateListing, wrapAsync(listingController.newListing));

//edit Route
router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(listingController.editListing));

//update
router.put("/:id",isLoggedIn,isOwner,upload.single("listing[image]"),validateListing, wrapAsync(listingController.updateListing));

//DELETE ROUTE
router.delete("/:id",isLoggedIn,isOwner,wrapAsync(listingController.deleteListing));

// Booking routes
router.post("/:id/book", isLoggedIn, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    const { checkIn, checkOut } = req.body;
    
    // Calculate number of nights
    const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
    
    // Create booking
    const booking = new Booking({
        listing: id,
        user: req.user._id,
        checkIn,
        checkOut,
        nights,
        totalPrice: listing.price * nights
    });
    
    await booking.save();
    
    // Redirect to payment page
    res.redirect(`/payments/${booking._id}`);
}));

// Get available dates
router.get("/:id/available-dates", async (req, res) => {
    try {
        const { id } = req.params;
        const bookings = await Booking.find({
            listing: id,
            status: { $ne: "cancelled" }
        });

        const bookedDates = bookings.map(booking => ({
            start: booking.checkIn,
            end: booking.checkOut
        }));

        res.json(bookedDates);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;