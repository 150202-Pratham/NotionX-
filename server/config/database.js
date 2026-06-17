const mongoose = require("mongoose");
require("dotenv").config();

exports.connect = () => {
    console.log("🔄 Attempting to connect to MongoDB...");
    console.log("Connection URL:", process.env.MONGODB_URL?.substring(0, 50) + "...");
    
    mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 10000,
    })
    .then(() => {
        console.log("✅ DB Connected Successfully");
        console.log("MongoDB Connection Established!");
    })
    .catch((error) => {
        console.error("❌ DB Connection Failed");
        console.error("Error Type:", error.name);
        console.error("Error Message:", error.message);
        
        // More detailed error logging
        if(error.name === 'MongoServerSelectionError') {
            console.error("⚠️  SOLUTION: IP Address not whitelisted in MongoDB Atlas");
            console.error("Please add your IP to MongoDB Atlas Network Access");
        } else if(error.name === 'MongoAuthenticationError') {
            console.error("⚠️  SOLUTION: Authentication failed - check credentials");
            console.error("Verify username and password in .env file");
        } else if(error.name === 'MongoParseError') {
            console.error("⚠️  SOLUTION: Invalid connection string format");
            console.error("Check MONGODB_URL in .env file");
        }
        
        console.error("\n📍 Full Error:", error);
        
        // Don't exit immediately - keep server running so you can check logs
        console.log("⚠️  Server running but database not connected");
    });
    
    // Connection events for debugging
    mongoose.connection.on('connected', () => {
        console.log("✅ Mongoose connected to MongoDB");
    });
    
    mongoose.connection.on('disconnected', () => {
        console.log("⚠️  Mongoose disconnected from MongoDB");
    });
    
    mongoose.connection.on('error', (err) => {
        console.error("❌ Mongoose connection error:", err);
    });
};