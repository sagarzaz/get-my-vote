import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import Card from '../components/Card';
import { Users, CheckCircle, XCircle, ScanFace, Watch } from 'lucide-react';

const AdminVoters = () => {
  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchVoters();
  }, []);

  const fetchVoters = async () => {
    try {
      const res = await apiClient.get('/admin/voters');
      if (res.data.success) {
        setVoters(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch voters:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredVoters = voters.filter(voter => 
    voter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    voter.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <Users className="w-6 h-6 text-gray-700" />
          <h1 className="text-3xl font-bold text-gray-900">Voters</h1>
        </div>
        <p className="text-gray-500">{voters.length} registered voters</p>
      </div>

      <Card className="p-4">
        <input
          type="text"
          placeholder="Search voters..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
        />
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Voted</th>
                <th className="px-6 py-3 center text-xs font-medium text-gray-500 uppercase tracking-wider">Face Data</th>
                <th className="px-6 py-3 center text-xs font-medium text-gray-500 uppercase tracking-wider">Bracelet</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredVoters.map(voter => (
                <tr key={voter.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{voter.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">{voter.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">{voter.phone || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {voter.hasVoted ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" /> Voted
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <XCircle className="w-3 h-3 mr-1" /> Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {voter.hasFaceData ? (
                      <ScanFace className="w-5 h-5 text-green-600 mx-auto" />
                    ) : (
                      <XCircle className="w-5 h-5 text-gray-300 mx-auto" />
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {voter.hasBraceletId ? (
                      <Watch className="w-5 h-5 text-green-600 mx-auto" />
                    ) : (
                      <XCircle className="w-5 h-5 text-gray-300 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredVoters.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No voters found
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminVoters;
