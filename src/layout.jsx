// layout.jsx
import React from "react";
import Header from "./header"; // lowercase file, still works
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
};

export default Layout;
