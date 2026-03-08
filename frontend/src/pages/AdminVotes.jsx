import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import Card from '../components/Card';
import { Vote, Download } from 'lucide-react';

const AdminVotes = () => {
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVotes();
  }, []);

  const fetchVotes = async () => {
    try {
      const res = await apiClient.get('/admin/votes');
      if (res.data.success) {
        setVotes(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch votes:', err);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Voter Name', 'Voter Email', 'Candidate', 'Timestamp'];
    const rows = votes.map(vote => [
      vote.userName,
      vote.userEmail,
      vote.candidateName,
      new Date(vote.timestamp).toLocaleString()
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `votes_export_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Vote className="w-6 h-6 text-gray-700" />
          <h1 className="text-3xl font-bold text-gray-900">Vote Count</h1>
        </div>
        <div className="flex items-center space-x-4">
          <p className="text-gray-500">{votes.length} votes cast</p>
          <button
            onClick={exportToCSV}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Voter Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Voter Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {votes.map((vote, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">{index + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{vote.userName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">{vote.userEmail}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {vote.candidateName}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {new Date(vote.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {votes.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No votes have been cast yet
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminVotes;
