import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import Button from '../components/Button';
import Card from '../components/Card';
import Toast from '../components/Toast';
import { Settings, Clock, Play, Pause, Trophy, Eye, EyeOff } from 'lucide-react';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    votingOpen: false,
    startTime: '',
    endTime: '',
    resultsPublished: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await apiClient.get('/admin/settings');
      if (res.data.success) {
        const data = res.data.data;
        setSettings({
          votingOpen: data.votingOpen || false,
          startTime: data.startTime ? data.startTime.slice(0, 16) : '',
          endTime: data.endTime ? data.endTime.slice(0, 16) : '',
          resultsPublished: data.resultsPublished || false
        });
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    
    try {
      const data = {
        votingOpen: settings.votingOpen,
        startTime: settings.startTime ? new Date(settings.startTime).toISOString() : null,
        endTime: settings.endTime ? new Date(settings.endTime).toISOString() : null
      };
       
      await apiClient.post('/admin/settings', data);
      setMessage('Settings saved successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const toggleVoting = async () => {
    setSaving(true);
    try {
      const data = {
        votingOpen: !settings.votingOpen,
        startTime: settings.startTime ? new Date(settings.startTime).toISOString() : null,
        endTime: settings.endTime ? new Date(settings.endTime).toISOString() : null
      };
       
      await apiClient.post('/admin/settings', data);
      setSettings({ ...settings, votingOpen: !settings.votingOpen });
      setMessage(`Voting ${!settings.votingOpen ? 'opened' : 'closed'} successfully!`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to toggle voting.');
    } finally {
      setSaving(false);
    }
  };

  const togglePublishResults = async () => {
    setSaving(true);
    try {
      await apiClient.post('/admin/election/results/publish', { 
        publish: !settings.resultsPublished 
      });
      setSettings({ ...settings, resultsPublished: !settings.resultsPublished });
      setMessage(`Results ${!settings.resultsPublished ? 'published' : 'unpublished'} successfully!`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to toggle results publication.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Election Settings</h1>
        <div className="flex space-x-2">
          <Button 
            onClick={togglePublishResults}
            disabled={saving}
            className={settings.resultsPublished ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}
          >
            {settings.resultsPublished ? (
              <>
                <EyeOff className="inline-block mr-2" />
                Unpublish Results
              </>
            ) : (
              <>
                <Eye className="inline-block mr-2" />
                Publish Results
              </>
            )}
          </Button>
          <Button 
            onClick={toggleVoting}
            disabled={saving}
            className={settings.votingOpen ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}
          >
            {settings.votingOpen ? (
              <>
                <Pause className="inline-block mr-2" />
                Close Voting
              </>
            ) : (
              <>
                <Play className="inline-block mr-2" />
                Open Voting
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Results Publication Status */}
      <Card className="mb-6">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <Trophy className={`w-5 h-5 ${settings.resultsPublished ? 'text-green-500' : 'text-gray-400'}`} />
            <span className="font-medium">
              Results are currently {settings.resultsPublished ? 'PUBLISHED' : 'NOT PUBLISHED'}
            </span>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm ${settings.resultsPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
            {settings.resultsPublished ? 'Visible to all users' : 'Hidden from users'}
          </span>
        </div>
      </Card>

      <Card>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${settings.votingOpen ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="font-medium">
                  Voting is currently {settings.votingOpen ? 'OPEN' : 'CLOSED'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="startTime">
                <Clock className="inline-block w-4 h-4 mr-1" />
                Voting Start Time
              </label>
              <input
                id="startTime"
                type="datetime-local"
                value={settings.startTime}
                onChange={(e) => setSettings({ ...settings, startTime: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="endTime">
                <Clock className="inline-block w-4 h-4 mr-1" />
                Voting End Time
              </label>
              <input
                id="endTime"
                type="datetime-local"
                value={settings.endTime}
                onChange={(e) => setSettings({ ...settings, endTime: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          </div>

          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </form>
      </Card>

      {error && <Toast message={error} type="error" onClose={() => setError(null)} />}
      {message && <Toast message={message} type="success" onClose={() => setMessage(null)} />}
    </div>
  );
};

export default AdminSettings;
