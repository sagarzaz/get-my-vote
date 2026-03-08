import React, { useEffect, useState } from 'react';
import apiClient from '../api/apiClient';
import LoadingSpinner from '../components/LoadingSpinner';

const Candidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/vote/candidates')
      .then(res => {
        setCandidates(res.data.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">All Candidates</h1>
      <div className="bg-base-100 shadow-lg rounded-lg">
        <table className="min-w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-4">Avatar</th>
              <th className="text-left p-4">Name</th>
              <th className="text-left p-4">Description</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map(candidate => (
              <tr key={candidate._id} className="border-b hover:bg-gray-50">
                <td className="p-4">
                  <img
                    src={`https://api.dicebear.com/8.x/avataaars/svg?seed=${candidate.name}`}
                    alt={candidate.name}
                    className="w-12 h-12 rounded-full"
                  />
                </td>
                <td className="p-4 font-semibold">{candidate.name}</td>
                <td className="p-4 text-neutral/80">{candidate.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Candidates;
