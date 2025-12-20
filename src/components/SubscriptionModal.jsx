
import { motion, AnimatePresence } from "framer-motion";
import { FaCrown, FaCheck, FaTimes } from "react-icons/fa";

const SubscriptionModal = ({ isOpen, onClose, onSuccess }) => {
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubscribe = async () => {
    const res = await loadRazorpay();
    if (!res) {
      alert("Razorpay SDK failed to load. Are you online?");
      return;
    }

    try {
      // 1. Create Order
      const token = localStorage.getItem("token") || document.cookie.split("token=")[1]?.split(";")[0]; // Basic token retrieval
      
      const orderRes = await fetch("/api/subscription/create-order", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`
        }
      });
      
      if (!orderRes.ok) {
          throw new Error("Failed to create order");
      }
      
      const order = await orderRes.json();

      // 2. Open Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Frontend key
        amount: order.amount,
        currency: order.currency,
        name: "Quiz Premium",
        description: "Unlimited Quiz Generation",
        order_id: order.id,
        handler: async function (response) {
          // 3. Verify Payment
          const verifyRes = await fetch("/api/subscription/verify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
               "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          if (verifyRes.ok) {
            onSuccess();
            onClose();
          } else {
            alert("Payment verification failed.");
          }
        },
        prefill: {
          name: "User Name", // You could pass actual user name if available
          email: "user@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#7c3aed", // violet-600
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (err) {
      console.error(err);
      alert("Something went wrong with the subscription process.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
            >
              <FaTimes />
            </button>

            {/* Header */}
            <div className="p-8 text-center bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/10 dark:to-purple-900/10">
              <div className="w-16 h-16 mx-auto mb-4 bg-violet-100 dark:bg-violet-900/30 rounded-full flex items-center justify-center text-violet-600 dark:text-violet-400 text-3xl">
                <FaCrown />
              </div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
                Unlock Unlimited Quizzes
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400">
                You&apos;ve reached your daily limit of 3 free quizzes.
              </p>
            </div>

            {/* Benefits */}
            <div className="p-8">
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-zinc-700 dark:text-zinc-300">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center text-xs">
                    <FaCheck />
                  </span>
                  Generate unlimited AI quizzes
                </li>
                <li className="flex items-center gap-3 text-zinc-700 dark:text-zinc-300">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center text-xs">
                     <FaCheck />
                  </span>
                  Access to premium topics & features
                </li>
                <li className="flex items-center gap-3 text-zinc-700 dark:text-zinc-300">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center text-xs">
                     <FaCheck />
                  </span>
                  Support further development
                </li>
              </ul>

              {/* Subscribe Button */}
              <button
                onClick={handleSubscribe}
                className="w-full py-4 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 transform transition-all active:scale-[0.98] shadow-lg hover:shadow-violet-500/25 flex items-center justify-center gap-2"
              >
                <span>Subscribe Now for ₹199/mo</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SubscriptionModal;
