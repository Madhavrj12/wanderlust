const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
    listing: {
        type: Schema.Types.ObjectId,
        ref: "Listing",
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    checkIn: {
        type: Date,
        required: true
    },
    checkOut: {
        type: Date,
        required: true
    },
    nights: {
        type: Number,
        required: true
    },
    totalPrice: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "paid", "cancelled"],
        default: "pending"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Calculate nights before saving
bookingSchema.pre("save", function(next) {
    if (this.isModified("checkIn") || this.isModified("checkOut")) {
        const checkIn = new Date(this.checkIn);
        const checkOut = new Date(this.checkOut);
        const diffTime = Math.abs(checkOut - checkIn);
        this.nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    next();
});

// Validate check-out date is after check-in date
bookingSchema.pre("save", function(next) {
    if (this.checkOut <= this.checkIn) {
        next(new Error("Check-out date must be after check-in date"));
    }
    next();
});

module.exports = mongoose.model("Booking", bookingSchema); 