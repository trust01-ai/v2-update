import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Login from './components/Login';
import ErrorPage from './ErrorPage';
import Loading from './Loading';
import bgPattern from './assets/images/background.png';

function MainContainer() {
  const [showLoader, setShowLoader] = useState(true);
  const [imgFitMode, setImgFitMode] = useState('cover');
  const [imgPosition, setImgPosition] = useState('center');
  const currentPath = useLocation();

  useEffect(() => {
    const adjustVisuals = () => {
      if (window.innerWidth <= 768) {
        setImgFitMode('contain');
        setImgPosition('center');
      } else {
        setImgFitMode('contain');
        setImgPosition('center');
      }
    };

    const lockScroll = () => {
      document.body.style.overflow = 'hidden';
    };

    const blockContextMenu = (e) => {
      e.preventDefault();
    };

    const blockShortcuts = (e) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && ["I", "C", "J"].includes(e.key)) ||
        (e.ctrlKey && e.key === "U")
      ) {
        e.preventDefault();
      }
    };

    adjustVisuals();
    lockScroll();
    document.addEventListener("contextmenu", blockContextMenu);
    document.addEventListener("keydown", blockShortcuts);

    const loaderTimer = setTimeout(() => {
      setShowLoader(false);
    }, 2000);

    window.addEventListener("resize", adjustVisuals);

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener("contextmenu", blockContextMenu);
      document.removeEventListener("keydown", blockShortcuts);
      clearTimeout(loaderTimer);
      window.removeEventListener("resize", adjustVisuals);
    };
  }, []);

  return (
    <div className="app-root" style={{ position: "relative", height: "100vh", width: "100%" }}>
      {showLoader && <Loading />}

      {currentPath.pathname !== '/error' && (
        <img
          src={bgPattern}
          alt="Decorative background"
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            width: "87%",
            height: "100%",
            objectFit: 'fill',
            objectPosition: imgPosition,
            filter: "blur(4.5px)",
            zIndex: -1,
            transform: "translate(-52%, -50%)",
          }}
        />
      )}

      <Routes>
        {!showLoader && (
          <>
            <Route path="/" element={<Login style={{ marginTop: '100px' }} />} />
            <Route path="/error" element={<ErrorPage />} />
          </>
        )}
      </Routes>
    </div>
  );
}

function AppWrapper() {
  return (
    <Router>
      <MainContainer />
    </Router>
  );
}

export default AppWrapper;