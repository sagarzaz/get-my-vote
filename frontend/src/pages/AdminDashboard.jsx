import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/apiClient';
import Card from '../components/Card';
import Button from '../components/Button';
import { Calendar, Users, Vote, BarChart3, Settings, Plus, Trash2, CheckCircle, XCircle } from 'lucide-react';

const AdminDashboard = () => {
  const [electionSettings, setElectionSettings] = useState({
    votingOpen: false,
    startTime: '',
    endTime: ''
  });
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchElectionSettings();
    fetchStatistics();
  }, []);

  const fetchElectionSettings = async () => {
    try {
      const res = await apiClient.get('/admin/election/timer');
      if (res.data.success) {
        const settings = res.data.data;
        setElectionSettings({
          votingOpen: settings.votingOpen || false,
          startTime: settings.startTime ? settings.startTime.slice(0, 16) : '',
          endTime: settings.endTime ? settings.endTime.slice(0, 16) : ''
        });
      }
    } catch (err) {
      console.error('Failed to fetch election settings:', err);
    }
  };

  const fetchStatistics = async () => {
    try {
      const res = await apiClient.get('/admin/statistics');
      if (res.data.success) {
        setStatistics(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTimer = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const payload = {
        votingOpen: electionSettings.votingOpen,
        startTime: electionSettings.startTime ? new Date(electionSettings.startTime).toISOString() : null,
        endTime: electionSettings.endTime ? new Date(electionSettings.endTime).toISOString() : null
      };
      const res = await apiClient.post('/admin/election/timer', payload);
      if (res.data.success) {
        setMessage({ type: 'success', text: 'Election timer saved successfully!' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save timer' });
    } finally {
      setSaving(false);
    }
  };

  const toggleVoting = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await apiClient.post('/admin/election/timer/toggle', {
        votingOpen: !electionSettings.votingOpen
      });
      if (res.data.success) {
        setElectionSettings(prev => ({ ...prev, votingOpen: !prev.votingOpen }));
        setMessage({ type: 'success', text: res.data.message });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to toggle voting' });
    } finally {
      setSaving(false);
    }
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
      <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>

      {/* Message Alert */}
      {message && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Voters</p>
              <p className="text-2xl font-bold">{statistics?.totalVoters || 0}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Voted</p>
              <p className="text-2xl font-bold">{statistics?.votedCount || 0}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-orange-100 rounded-lg">
              <XCircle className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Not Voted</p>
              <p className="text-2xl font-bold">{statistics?.notVotedCount || 0}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Turnout</p>
              <p className="text-2xl font-bold">{statistics?.voterTurnout || 0}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Election Timer Section */}
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Calendar className="w-6 h-6 text-gray-700" />
          <h2 className="text-xl font-bold">Election Timer</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
            <input
              type="datetime-local"
              value={electionSettings.startTime}
              onChange={(e) => setElectionSettings(prev => ({ ...prev, startTime: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
            <input
              type="datetime-local"
              value={electionSettings.endTime}
              onChange={(e) => setElectionSettings(prev => ({ ...prev, endTime: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
            />
          </div>
          <div className="flex items-end">
            <Button 
              onClick={toggleVoting}
              disabled={saving}
              className={`w-full ${electionSettings.votingOpen ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
            >
              {electionSettings.votingOpen ? 'Close Voting' : 'Open Voting'}
            </Button>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button onClick={handleSaveTimer} disabled={saving}>
            {saving ? 'Saving...' : 'Save Timer Settings'}
          </Button>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/admin/candidates">
          <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Manage Candidates</h3>
                <p className="text-sm text-gray-500">Add or remove candidates</p>
              </div>
            </div>
          </Card>
        </Link>
        
        <Link to="/admin/voters">
          <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <Vote className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">View Voters</h3>
                <p className="text-sm text-gray-500">See all registered voters</p>
              </div>
            </div>
          </Card>
        </Link>
        
        <Link to="/admin/votes">
          <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">View Vote Count</h3>
                <p className="text-sm text-gray-500">See all cast votes</p>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* Candidate Results */}
      {statistics?.candidates && statistics.candidates.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <BarChart3 className="w-6 h-6 text-gray-700" />
            <h2 className="text-xl font-bold">Live Results</h2>
          </div>
          <div className="space-y-3">
            {statistics.candidates.map(candidate => (
              <div key={candidate.id} className="flex items-center justify-between">
                <span className="font-medium">{candidate.name}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gray-900 rounded-full"
                      style={{ 
                        width: `${statistics.totalVotes > 0 ? (candidate.voteCount / statistics.totalVotes * 100) : 0}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium w-12 text-right">{candidate.voteCount}</span>
                </div>
              </div>
            ))}
            <div className="pt-3 border-t">
              <span className="font-semibold">Total Votes: {statistics.totalVotes}</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AdminDashboard;
