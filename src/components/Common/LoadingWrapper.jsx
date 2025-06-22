import React, { useRef, useEffect } from "react";
import { useLocation, Outlet } from "react-router-dom";
import LoadingBar from "react-top-loading-bar";

const LoadingWrapper = () => {
  const loadingBarRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    if (loadingBarRef.current) {
      loadingBarRef.current.continuousStart();
    }

    setTimeout(() => {
      if (loadingBarRef.current) {
        loadingBarRef.current.complete();
      }
    }, 500);
  }, [location]);

  return (
    <>
      <LoadingBar color="#ffd700" height={3} ref={loadingBarRef} />
      <Outlet />
    </>
  );
};

export default LoadingWrapper;