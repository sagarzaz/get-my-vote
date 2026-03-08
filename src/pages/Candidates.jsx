import React, { useState } from "react";
import AdminSidebar from "../components/AdminSidebar";

const Candidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [name, setName] = useState("");

  const addCandidate = () => {
    if (!name) return;
    setCandidates([...candidates, name]);
    setName("");
  };

  const deleteCandidate = (index) => {
    setCandidates(candidates.filter((_, i) => i !== index));
  };

  return (
    <>
      <AdminSidebar />
      <div className="page-container candidate-container">
        <h2>Candidate Management</h2>

        <input
          type="text"
          placeholder="Candidate name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button onClick={addCandidate}>Add</button>

        <ul>
          {candidates.map((c, i) => (
            <li key={i}>
              {c}
              <button onClick={() => deleteCandidate(i)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default Candidates;