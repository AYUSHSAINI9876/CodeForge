import { useEffect, useRef, useState } from "react";

const CODE_LENGTH = 6;

const OtpForm = ({
  maskedEmail,
  expiresInMinutes,
  resendAfterSeconds,
  devFallback,
  loading,
  onVerify,
  onResend,
  onBack,
}) => {
  const [digits, setDigits] = useState(Array(CODE_LENGTH).fill(""));
  const [cooldown, setCooldown] = useState(resendAfterSeconds || 0);
  const inputsRef = useRef([]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  useEffect(() => {
    setCooldown(resendAfterSeconds || 0);
  }, [resendAfterSeconds]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => (c <= 1 ? 0 : c - 1)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const submitCode = (code) => {
    if (code.length === CODE_LENGTH && !loading) {
      onVerify(code);
    }
  };

  const handleChange = (index, rawValue) => {
    const value = rawValue.replace(/\D/g, "");
    if (!value) {
      setDigits((prev) => prev.map((d, i) => (i === index ? "" : d)));
      return;
    }

    // Typing or pasting several digits at once fills forward from here.
    const next = [...digits];
    value.split("").forEach((char, offset) => {
      if (index + offset < CODE_LENGTH) next[index + offset] = char;
    });
    setDigits(next);

    const nextEmpty = Math.min(index + value.length, CODE_LENGTH - 1);
    inputsRef.current[nextEmpty]?.focus();
    submitCode(next.join(""));
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) inputsRef.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < CODE_LENGTH - 1) inputsRef.current[index + 1]?.focus();
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH);
    if (!pasted) return;
    e.preventDefault();
    const next = Array(CODE_LENGTH).fill("");
    pasted.split("").forEach((char, i) => { next[i] = char; });
    setDigits(next);
    inputsRef.current[Math.min(pasted.length, CODE_LENGTH - 1)]?.focus();
    submitCode(next.join(""));
  };

  const handleResend = async () => {
    setDigits(Array(CODE_LENGTH).fill(""));
    inputsRef.current[0]?.focus();
    await onResend();
  };

  return (
    <form
      className="login-box"
      onSubmit={(e) => {
        e.preventDefault();
        submitCode(digits.join(""));
      }}
    >
      <div className="otp-intro">
        <div className="otp-icon" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2"></rect>
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
          </svg>
        </div>
        <p className="otp-lead">
          We sent a {CODE_LENGTH}-digit code to <strong>{maskedEmail}</strong>
        </p>
        <p className="otp-sub">It expires in {expiresInMinutes} minutes.</p>
      </div>

      {devFallback && (
        <div className="otp-dev-note">
          Email isn&rsquo;t configured yet — your code was printed to the backend terminal.
        </div>
      )}

      <div className="otp-inputs" onPaste={handlePaste}>
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { inputsRef.current[i] = el; }}
            className="otp-digit"
            type="text"
            inputMode="numeric"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            maxLength={CODE_LENGTH}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onFocus={(e) => e.target.select()}
            aria-label={`Digit ${i + 1} of ${CODE_LENGTH}`}
            disabled={loading}
          />
        ))}
      </div>

      <button
        type="submit"
        className="login-btn primary-btn"
        disabled={loading || digits.join("").length !== CODE_LENGTH}
      >
        {loading ? "Verifying..." : "Verify & Sign In"}
      </button>

      <div className="otp-actions">
        <button type="button" className="link-btn" onClick={onBack} disabled={loading}>
          &larr; Use a different account
        </button>
        <button type="button" className="link-btn" onClick={handleResend} disabled={loading || cooldown > 0}>
          {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
        </button>
      </div>
    </form>
  );
};

export default OtpForm;
