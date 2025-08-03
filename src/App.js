import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// SVG icons to replace FontAwesome
const CheckCircleIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <path fill="currentColor" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"/>
  </svg>
);

const ExclamationCircleIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <path fill="currentColor" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm0-384c13.3 0 24 10.7 24 24V264c0 13.3-10.7 24-24 24s-24-10.7-24-24V152c0-13.3 10.7-24 24-24zm32 224a32 32 0 1 1 -64 0 32 32 0 1 1 64 0z"/>
  </svg>
);

const ArrowLeftIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
    <path fill="currentColor" d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H109.2l105.4-105.4c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/>
  </svg>
);

const ArrowRightIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
    <path fill="currentColor" d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224H32c-17.7 0-32 14.3-32 32s14.3 32 32 32H338.8l-105.4 105.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"/>
  </svg>
);

const loadPaystackScript = (callback) => {
  const existingScript = document.getElementById('paystack-script');
  if (!existingScript) {
    const script = document.createElement('script');
    script.src = "https://js.paystack.co/v1/inline.js";
    script.id = "paystack-script";
    script.onload = () => {
      if (callback) callback();
    };
    document.body.appendChild(script);
  } else if (callback) {
    callback();
  }
};

const Modal = ({ show, title, message, onClose, icon }) => {
  if (!show) return null;

  const getIconComponent = (iconName) => {
    switch (iconName) {
      case 'success':
        return <CheckCircleIcon className="text-green-500" />;
      case 'error':
        return <ExclamationCircleIcon className="text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 transition-opacity duration-300">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-gray-800 p-8 rounded-xl shadow-2xl text-center max-w-sm w-full space-y-4"
      >
        <div className="text-4xl">
          {getIconComponent(icon)}
        </div>
        <h3 className="text-xl font-bold text-gray-100">{title}</h3>
        <p className="text-gray-300">{message}</p>
        <button
          onClick={onClose}
          className="w-full bg-purple-600 text-white font-semibold py-2 rounded-lg hover:bg-purple-700 transition-colors"
        >
          Close
        </button>
      </motion.div>
    </div>
  );
};

export default function App() {
  const [step, setStep] = useState(0);
  const [songLink, setSongLink] = useState('');
  const [email, setEmail] = useState('');
  const [postCount, setPostCount] = useState(10);
  const [usdAmount, setUsdAmount] = useState(10);
  const [ghsAmount, setGhsAmount] = useState(120);
  const [isPaystackLoaded, setIsPaystackLoaded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '', icon: '' });

  const DOLLAR_TO_GHS_RATE = 12;
  const POST_COST_USD = 1;
  // Hard-coded public and private keys as requested.
  const PAYSTACK_PUBLIC_KEY = 'pk_live_87c3c567301e82e5685926742d23cb2458d4a1ae';
  const PAYSTACK_PRIVATE_KEY = 'sk_live_943f8ba2fb112470655eee1f06c926667fa27081'; // WARNING: This is a security risk.
  const WEBHOOK_URL = 'https://hook.eu2.make.com/pv8m1kitutexccwl1d1puc3u4rdno69p';

  useEffect(() => {
    loadPaystackScript(() => {
      setIsPaystackLoaded(true);
    });
  }, []);

  const handlePostCountChange = (e) => {
    const newCount = parseInt(e.target.value, 10);
    if (!isNaN(newCount) && newCount >= 10) {
      setPostCount(newCount);
      const totalUsd = newCount * POST_COST_USD;
      setUsdAmount(totalUsd);
      setGhsAmount(totalUsd * DOLLAR_TO_GHS_RATE);
    } else {
      setPostCount(10);
      setUsdAmount(10 * POST_COST_USD);
      setGhsAmount(10 * POST_COST_USD * DOLLAR_TO_GHS_RATE);
    }
  };

  const handleNextStep = () => {
    if (step === 0 && !songLink) {
      setModalContent({ title: 'Input Required', message: 'Please enter your song link to proceed.', icon: 'error' });
      setShowModal(true);
      return;
    }
    if (step === 1 && !email) {
      setModalContent({ title: 'Input Required', message: 'Please enter your email to proceed.', icon: 'error' });
      setShowModal(true);
      return;
    }
    if (step === 2 && postCount < 10) {
      setModalContent({ title: 'Input Required', message: 'Please enter a number of posts of at least 10.', icon: 'error' });
      setShowModal(true);
      return;
    }
    setStep(step + 1);
  };

  const handlePreviousStep = () => {
    setStep(step - 1);
  };

  const handlePaystackPayment = async () => {
    if (!isPaystackLoaded || !songLink || !email || postCount < 10) {
      setModalContent({ title: 'Error', message: 'Please fill out all fields and ensure the number of posts is at least 10.', icon: 'error' });
      setShowModal(true);
      return;
    }

    try {
      const handler = window.PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email: email,
        amount: ghsAmount * 100, // Amount in kobo
        currency: 'GHS',
        metadata: {
          custom_fields: [
            { display_name: "Song Link", variable_name: "song_link", value: songLink },
            { display_name: "Number of Posts", variable_name: "post_count", value: postCount },
          ]
        },
        callback: async (response) => {
          const transactionRef = response.reference;
          console.log('Payment successful! Transaction reference:', transactionRef);

          const promoData = {
            email,
            songLink,
            postCount,
            amountGHS: ghsAmount,
            amountUSD: usdAmount,
            transactionRef,
            timestamp: new Date().toISOString(),
            status: 'paid',
          };

          if (WEBHOOK_URL) {
            const maxRetries = 5;
            let currentRetry = 0;
            const sendToWebhook = async (data) => {
              try {
                const webhookResponse = await fetch(WEBHOOK_URL, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(data),
                });
                if (webhookResponse.ok) {
                  console.log('Data successfully sent to webhook.');
                } else {
                  console.error('Failed to send data to webhook:', webhookResponse.statusText);
                }
              } catch (webhookError) {
                if (currentRetry < maxRetries) {
                  const delay = Math.pow(2, currentRetry) * 1000;
                  currentRetry++;
                  console.log(`Webhook failed, retrying in ${delay}ms...`);
                  setTimeout(() => sendToWebhook(data), delay);
                } else {
                  console.error('An error occurred while sending data to webhook after multiple retries:', webhookError);
                }
              }
            };
            sendToWebhook(promoData);
          }

          setModalContent({
            title: 'Success!',
            message: `Payment of GHS${ghsAmount.toFixed(2)} was successful! Your request has been recorded.`,
            icon: 'success'
          });
          setShowModal(true);
        },
        onClose: () => {
          setModalContent({
            title: 'Payment Incomplete',
            message: 'Payment was not completed. You can try again.',
            icon: 'error'
          });
          setShowModal(true);
        },
      });

      handler.openIframe();
    } catch (error) {
      console.error("An error occurred during payment processing:", error);
      setModalContent({ title: 'Error', message: 'An unexpected error occurred. Please try again.', icon: 'error' });
      setShowModal(true);
    }
  };

  return (
    <div className="min-h-screen text-gray-100 font-sans flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 bg-size-200% animate-gradient-shift">
      <style>
        {`
          @keyframes gradient-shift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .bg-size-200\\% {
            background-size: 200% 200%;
          }
          .animate-gradient-shift {
            animation: gradient-shift 10s ease infinite;
          }
        `}
      </style>
      <div className="bg-gray-800 bg-opacity-90 backdrop-blur-sm p-8 md:p-12 rounded-2xl shadow-2xl w-full max-w-lg space-y-8 border border-gray-700">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-2">
            TikTok Promo
          </h1>
          <p className="text-lg md:text-xl font-light text-gray-400">
            Boost your song, one video at a time.
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-700 bg-opacity-50 p-6 rounded-xl shadow-inner border border-gray-600">
            <h2 className="text-2xl font-semibold text-gray-200">How It Works</h2>
            <p className="mt-2 text-gray-300">
              Submit your song link, email, and the number of posts you want. We'll flood TikTok with videos using your song. Each post is only
              <span className="font-bold text-green-400"> $1</span>.
            </p>
          </div>

          <div className="relative overflow-hidden">
            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div
                  key="step0"
                  initial={{ x: '100%', opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: '-100%', opacity: 0 }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                  className="space-y-4"
                >
                  <div>
                    <label htmlFor="songLink" className="block text-sm font-medium text-gray-300 mb-1">
                      Song Link (e.g., Spotify, Apple Music)
                    </label>
                    <input
                      type="text"
                      id="songLink"
                      value={songLink}
                      onChange={(e) => setSongLink(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                      placeholder="https://open.spotify.com/track/..."
                    />
                  </div>
                </motion.div>
              )}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ x: '100%', opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: '-100%', opacity: 0 }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                  className="space-y-4"
                >
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                      Your Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                      placeholder="youremail@example.com"
                    />
                  </div>
                </motion.div>
              )}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ x: '100%', opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: '-100%', opacity: 0 }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                  className="space-y-4"
                >
                  <div>
                    <label htmlFor="postCount" className="block text-sm font-medium text-gray-300 mb-1">
                      Number of Posts (minimum 10)
                    </label>
                    <input
                      type="number"
                      id="postCount"
                      value={postCount}
                      onChange={handlePostCountChange}
                      min="10"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex justify-between items-center bg-gray-700 bg-opacity-50 p-4 rounded-xl border border-gray-600">
          <p className="text-xl font-semibold text-gray-200">Total:</p>
          <p className="text-3xl font-extrabold text-white">
            $ {usdAmount.toFixed(2)}
          </p>
        </div>

        <div className="flex justify-between items-center mt-6">
          <motion.button
            onClick={handlePreviousStep}
            disabled={step === 0}
            className="flex items-center space-x-2 text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:text-gray-200 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span className="hidden md:inline">Back</span>
          </motion.button>
          {step < 2 ? (
            <motion.button
              onClick={handleNextStep}
              className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>Next</span>
              <ArrowRightIcon className="w-5 h-5" />
            </motion.button>
          ) : (
            <motion.button
              onClick={handlePaystackPayment}
              disabled={!isPaystackLoaded}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold py-4 rounded-xl shadow-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Pay now
            </motion.button>
          )}
        </div>
      </div>
      <AnimatePresence>
        <Modal
          show={showModal}
          onClose={() => setShowModal(false)}
          title={modalContent.title}
          message={modalContent.message}
          icon={modalContent.icon}
        />
      </AnimatePresence>
    </div>
  );
}
