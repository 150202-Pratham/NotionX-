const express = require("express");
const app = express();

const userRoutes = require("./routes/User");
const profileRoutes = require("./routes/Profile");
const paymentRoutes = require("./routes/Payments");
const courseRoutes = require("./routes/Course");
const contactUsRoute = require("./routes/Contact");
const database = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const {cloudinaryConnect } = require("./config/cloudinary");
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv");

// ChatBot integration - Use the chatbot module entry point
const { initializeChatbot } = require("./chatbot");

dotenv.config();
const PORT = process.env.PORT || 4000;

//database connect
database.connect();

// ============================================================
// ChatBot Initialization Function
// ============================================================
async function setupChatbot() {
	try {
		console.log('Initializing ChatBot module...');
		
		// Initialize chatbot services and mount routes
		const services = await initializeChatbot(app);
		
		console.log('✓ ChatBot module initialized successfully');
		console.log('✓ ChatBot available at: http://localhost:' + PORT + '/api/chatbot');
		
		return services;
	} catch (error) {
		console.error('⚠️  ChatBot initialization warning:', error.message);
		console.log('   ChatBot features will have limited functionality');
		// Don\'t throw - allow server to continue without chatbot
		return null;
	}
}
//middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
	cors({
		origin:process.env.FRONTEND_URL || "http://localhost:3000" ,
		credentials:true,
	})
)

app.use(
	fileUpload({
		useTempFiles:true,
		tempFileDir:"/tmp",
	})
)
//cloudinary connection
cloudinaryConnect();

//routes
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/reach", contactUsRoute);

//def route

app.get("/", (req, res) => {
	return res.json({
		success:true,
		message:'Your server is up and running....'
	});
});

// Initialize ChatBot and start server
(async () => {
	try {
		// Setup ChatBot module
		await setupChatbot();
	} catch (error) {
		console.error('ChatBot setup failed:', error.message);
	}

	app.listen(PORT, () => {
		console.log(`\n${'='.repeat(50)}`);
		console.log(`🚀 Server is running at PORT ${PORT}`);
		console.log(`📍 API Base URL: http://localhost:${PORT}/api/v1`);
		console.log(`📍 ChatBot API: http://localhost:${PORT}/api/v1/chatbot`);
		console.log(`${'='.repeat(50)}\n`);
	});
})();

