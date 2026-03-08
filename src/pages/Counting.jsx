import React from "react";
import AdminSidebar from "../components/AdminSidebar";

const Counting = () => {
  const results = [
    { name: "Candidate A", votes: 40 },
    { name: "Candidate B", votes: 35 },
    { name: "Candidate C", votes: 20 }
  ];

  return (
    <>
      <AdminSidebar />
      <div className="page-container">
        <h2>Vote Counting</h2>

        {results.map((r, i) => (
          <p key={i}>
            {r.name} : <b>{r.votes} votes</b>
          </p>
        ))}
      </div>
    </>
  );
};

export default Counting;