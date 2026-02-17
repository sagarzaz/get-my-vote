import React from "react";
import { Link } from "react-router-dom";

const AdminSidebar = () => {
  return (
    <div className="admin-navbar">
      <h2 className="logo">Get My Vote</h2>

      <nav>
        
        <Link to="/d">Dashboard</Link>
        <Link to="/c">Candidates</Link>
        <Link to="/voters">Voters</Link>
        <Link to="/f">Face Recognition</Link>
        <Link to="/s">Voting Status</Link>
        <Link to="/u">Counting</Link>
        <Link to="/">Logout</Link>
      </nav>
    
    </div>
  );
};

export default AdminSidebar;