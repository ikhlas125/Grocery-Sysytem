import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./card.css";

const CardPaymentForm = ({ onCancel }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const { totalAmount = 0 } = location.state || {};

  const [formData, setFormData] = useState({
    cardNumber: "",
    expiry: "",
    cvc: "",
    cardholder: "",
  });

  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState("");

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (!userData) {
      navigate("/login");
      return;
    }
    setUser(userData);
  }, [navigate]);

  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "cardNumber":
        if (!/^\d{15,16}$/.test(value.replace(/ /g, "")))
          error = "Invalid card number";
        break;
      case "expiry":
        if (!/^(0[1-9]|1[0-2])\/?\d{2}$/.test(value))
          error = "Invalid expiry date";
        break;
      case "cvc":
        if (!/^\d{3,4}$/.test(value)) error = "Invalid CVC";
        break;
      case "cardholder":
        if (value.trim().length < 3) error = "Invalid name";
        break;
    }
    return error;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === "cardNumber") {
      formattedValue = value
        .replace(/\D/g, "")
        .replace(/(\d{4})/g, "$1 ")
        .trim();
    } else if (name === "expiry") {
      formattedValue = value
        .replace(/^(\d{2})(\d)/g, "$1/$2")
        .replace(/\/\//g, "/");
    }

    setFormData((prev) => ({ ...prev, [name]: formattedValue }));
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, formattedValue),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      Object.values(errors).some(Boolean) ||
      Object.values(formData).some((v) => !v)
    )
      return;

    setIsProcessing(true);

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const isPaymentSuccess = Math.random() < 0.8;

      if (!isPaymentSuccess) {
        throw new Error("Payment failed. Please check your card details.");
      }

      console.log(user.customerId);

      const response = await fetch(
        "http://localhost:5000/api/products/checkout",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerid: user.customerId,
            payment: "card",
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Checkout failed");
      }

      const data = await response.json();
      setTransactionId(generateTransactionId());
      setIsPaymentSuccess(true);

      // Clear cart and form
      localStorage.removeItem("cart");
      setFormData({
        cardNumber: "",
        expiry: "",
        cvc: "",
        cardholder: "",
      });
    } catch (error) {
      alert(error.message || "Payment processing failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const generateTransactionId = () => {
    return Math.random().toString(36).substr(2, 9).toUpperCase();
  };

  return (
    <div className="payment-container">
      <div className="payment-card">
        {isPaymentSuccess ? (
          <div className="payment-success">
            <div className="success-icon">✓</div>
            <h2>Payment Successful!</h2>
            <p className="amount-paid">${totalAmount.toFixed(2)} charged</p>
            <p className="transaction-id">Transaction ID: {transactionId}</p>
            <button
              className="success-btn"
              onClick={() => navigate("/user-dashboard")}
            >
              View Order Details
            </button>
          </div>
        ) : (
          <>
            <div className="payment-header">
              <h2>Secure Payment Gateway</h2>
              <div className="secure-badge">
                <span role="img" aria-label="secure">
                  🔒
                </span>{" "}
                256-bit SSL Secured
              </div>
            </div>

            <div className="amount-display">
              Total Amount: ${totalAmount.toFixed(2)}
            </div>

            <form onSubmit={handleSubmit}>
              <div className={`form-group ${errors.cardNumber ? "error" : ""}`}>
                <label>Card Number</label>
                <input
                  type="text"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleInputChange}
                  placeholder="4242 4242 4242 4242"
                  maxLength="19"
                />
                {errors.cardNumber && (
                  <span className="error-message">{errors.cardNumber}</span>
                )}
              </div>

              <div className="form-row">
                <div className={`form-group ${errors.expiry ? "error" : ""}`}>
                  <label>Expiry Date (MM/YY)</label>
                  <input
                    type="text"
                    name="expiry"
                    value={formData.expiry}
                    onChange={handleInputChange}
                    placeholder="MM/YY"
                    maxLength="5"
                  />
                  {errors.expiry && (
                    <span className="error-message">{errors.expiry}</span>
                  )}
                </div>

                <div className={`form-group ${errors.cvc ? "error" : ""}`}>
                  <label>CVC</label>
                  <input
                    type="text"
                    name="cvc"
                    value={formData.cvc}
                    onChange={handleInputChange}
                    placeholder="123"
                    maxLength="4"
                  />
                  {errors.cvc && (
                    <span className="error-message">{errors.cvc}</span>
                  )}
                </div>
              </div>

              <div className={`form-group ${errors.cardholder ? "error" : ""}`}>
                <label>Cardholder Name</label>
                <input
                  type="text"
                  name="cardholder"
                  value={formData.cardholder}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                />
                {errors.cardholder && (
                  <span className="error-message">{errors.cardholder}</span>
                )}
              </div>

              <div className="button-group">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={onCancel}
                  disabled={isProcessing}
                >
                  Cancel Payment
                </button>
                <button
                  type="submit"
                  className="pay-btn"
                  disabled={isProcessing || Object.values(errors).some(Boolean)}
                >
                  {isProcessing
                    ? "Processing Payment..."
                    : `Pay $${totalAmount.toFixed(2)}`}
                </button>
              </div>
            </form>

            <div className="payment-footer">
              <div className="accepted-cards">
                <img src="/images/visa.svg" alt="Visa" />
                <img src="/images/mastercard.svg" alt="Mastercard" />
                <img src="/images/amex.svg" alt="American Express" />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CardPaymentForm;
