// ErrorPage.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ErrorPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Set the timeout for redirection
    const timer = setTimeout(() => {
      // Replace this URL with the desired domain or path
      window.location.href = 'https://www.adobe.com/acrobat/online/extract-pdf-pages.html';
 // navigate('/path') for internal routing
    }, 3000); // Redirect after 5 seconds

    // Clean up the timer on component unmount
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>404 - Page Not Found</h1>
      <p>Oops! The page you're looking for is unavailable right now, try again later or contact the sender.</p>
    </div>
  );
};

export default ErrorPage;
