import { toast } from "react-hot-toast";
import { studentEndpoints } from "../apis";
import { apiConnector } from "../apiconnector";
import rzpLogo from "../../assets/Logo/rzp_logo.png"
import { setPaymentLoading } from "../../slices/courseSlice";
import { resetCart } from "../../slices/cartSlice";


const {COURSE_PAYMENT_API, COURSE_VERIFY_API, SEND_PAYMENT_SUCCESS_EMAIL_API} = studentEndpoints;

function loadScript(src) {
    return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = src;

        script.onload = () => {
            resolve(true);
        }
        script.onerror= () =>{
            resolve(false);
        }
        document.body.appendChild(script);
    })
}


export async function buyCourse(token, courses, userDetails, navigate, dispatch) {
    const toastId = toast.loading("Loading...");
    try{
        // Check if in TEST MODE - bypass Razorpay
        if(process.env.REACT_APP_PAYMENT_TEST_MODE === 'true') {
            console.log("🧪 PAYMENT TEST MODE ENABLED - Skipping Razorpay");
            
            toast.success("✅ Test Payment Processed Successfully!");
            
            // Simulate successful payment
            const fakePaymentResponse = {
                razorpay_order_id: "order_" + Math.random().toString(36).substr(2, 9),
                razorpay_payment_id: "pay_" + Math.random().toString(36).substr(2, 9),
                razorpay_signature: "test_signature_" + Math.random().toString(36).substr(2, 9)
            };
            
            console.log("Fake payment response:", fakePaymentResponse);
            
            // Proceed directly to verification
            verifyPayment({...fakePaymentResponse, courses}, token, navigate, dispatch);
            toast.dismiss(toastId);
            return;
        }
        
        //load the script
        const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");

        if(!res) {
            toast.error("RazorPay SDK failed to load");
            return;
        }

        //initiate the order
        const orderResponse = await apiConnector("POST", COURSE_PAYMENT_API, 
                                {courses},
                                {
                                    Authorization: `Bearer ${token}`,
                                })

        if(!orderResponse.data.success) {
            console.log("Order creation failed:", orderResponse.data);
            throw new Error(orderResponse.data.message);
        }
        console.log("PRINTING orderResponse", orderResponse);
        
        // Extract order details safely
        const orderData = orderResponse.data.message;
        if(!orderData.id || !orderData.amount || !orderData.currency) {
            console.error("Invalid order response structure:", orderData);
            throw new Error("Invalid order response from server");
        }
        
        //options
        const options = {
            key: process.env.REACT_APP_RAZORPAY_KEY,
            currency: orderData.currency,
            amount: Number(orderData.amount),
            order_id: orderData.id,
            name:"StudyNotion",
            description: "Thank You for Purchasing the Course",
            image:rzpLogo,
            prefill: {
                name:`${userDetails.firstName}`,
                email:userDetails.email
            },
            handler: function(response) {
                //send successful wala mail
                console.log("Payment Success Handler called with:", response);
                sendPaymentSuccessEmail(response, orderData.amount, token);
                //verifyPayment
                verifyPayment({...response, courses}, token, navigate, dispatch);
            }
        }
        //miss hogya tha 
        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
        paymentObject.on("payment.failed", function(response) {
            toast.error("oops, payment failed");
            console.log(response.error);
        })

    }
    catch(error) {
        console.log("PAYMENT API ERROR.....", error);
        console.error("Full error details:", error.response?.data || error.message);
        toast.error("Payment failed: " + (error.response?.data?.message || error.message || "Unknown error"));
    }
    toast.dismiss(toastId);
}

async function sendPaymentSuccessEmail(response, amount, token) {
    try{
        await apiConnector("POST", SEND_PAYMENT_SUCCESS_EMAIL_API, {
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            amount,
        },{
            Authorization: `Bearer ${token}`
        })
    }
    catch(error) {
        console.log("PAYMENT SUCCESS EMAIL ERROR....", error);
    }
}

//verify payment
async function verifyPayment(bodyData, token, navigate, dispatch) {
    const toastId = toast.loading("Verifying Payment....");
    dispatch(setPaymentLoading(true));
    try{
        console.log("Verifying payment with data:", bodyData);
        const response  = await apiConnector("POST", COURSE_VERIFY_API, bodyData, {
            Authorization:`Bearer ${token}`,
        })

        console.log("Payment verification response:", response);
        
        if(!response.data.success) {
            console.error("Verification failed:", response.data.message);
            throw new Error(response.data.message);
        }
        toast.success("Payment Successful, you are added to the course");
        navigate("/dashboard/enrolled-courses");
        dispatch(resetCart());
    }   
    catch(error) {
        console.log("PAYMENT VERIFY ERROR....", error);
        console.error("Verification error details:", error.response?.data || error.message);
        toast.error("Could not verify Payment: " + (error.response?.data?.message || error.message));
    }
    toast.dismiss(toastId);
    dispatch(setPaymentLoading(false));
}