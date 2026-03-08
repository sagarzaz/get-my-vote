import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { voteAPI } from '../api/apiClient';
import LoadingSpinner from '../components/LoadingSpinner';
import Card from '../components/Card';
import Button from '../components/Button';
import FaceCapture from '../components/FaceCapture';
import { 
  Vote, 
  Users, 
  CheckCircle,
  AlertCircle,
  Camera,
  User,
  Mail,
  Phone
} from 'lucide-react';

const UserDashboard = () => {
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showFaceCapture, setShowFaceCapture] = useState(false);
  const [voteStatus, setVoteStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [voting, setVoting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [candidatesRes, statusRes] = await Promise.all([
        voteAPI.getCandidates(),
        voteAPI.getVoteStatus()
      ]);

      if (candidatesRes.success) {
        setCandidates(candidatesRes.data);
      }

      if (statusRes.success) {
        setVoteStatus(statusRes.data);
      }
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleCandidateSelect = (candidate) => {
    if (voteStatus?.hasVoted) {
      return;
    }
    setSelectedCandidate(candidate);
  };

  const handleVoteClick = () => {
    if (!selectedCandidate) {
      setError('Please select a candidate first');
      return;
    }
    setShowFaceCapture(true);
  };

  const handleFaceCapture = async (faceImage) => {
    setVoting(true);
    setError('');

    try {
      const response = await voteAPI.castVote({
        candidate_id: selectedCandidate._id,
        face_image: faceImage
      });

      if (response.success) {
        // Refresh data
        await fetchDashboardData();
        setShowFaceCapture(false);
        setSelectedCandidate(null);
      } else {
        setError(response.message || 'Failed to cast vote');
      }
    } catch (err) {
      setError('Failed to cast vote. Please try again.');
    } finally {
      setVoting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-6"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                User Dashboard
              </h1>
              <p className="text-gray-600">Welcome back, {user?.name}!</p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="flex items-center space-x-2">
                {voteStatus?.hasVoted ? (
                  <div className="flex items-center text-green-600 bg-green-100 px-4 py-2 rounded-full">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Voted
                  </div>
                ) : (
                  <div className="flex items-center text-orange-600 bg-orange-100 px-4 py-2 rounded-full">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    Not Voted
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* User Info Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{user?.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{user?.phone}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Candidates */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Candidates</h2>
          
          {voteStatus?.hasVoted ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                You have already voted
              </h3>
              <p className="text-gray-600">
                Thank you for participating in the election!
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {candidates.map((candidate, index) => (
                  <motion.div
                    key={candidate._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 * index }}
                    onClick={() => handleCandidateSelect(candidate)}
                    className={`cursor-pointer transform transition-all duration-200 hover:scale-105 ${
                      selectedCandidate?._id === candidate._id
                        ? 'ring-4 ring-blue-500 shadow-lg'
                        : 'hover:shadow-lg'
                    }`}
                  >
                    <Card className="h-full">
                      <div className="p-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                          <Users className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-center mb-2">
                          {candidate.name}
                        </h3>
                        <p className="text-gray-600 text-center text-sm mb-4">
                          {candidate.description || 'No description available'}
                        </p>
                        <div className="text-center">
                          <span className="text-2xl font-bold text-blue-600">
                            {candidate.voteCount || 0}
                          </span>
                          <p className="text-sm text-gray-500">Votes</p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {selectedCandidate && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border-t pt-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="mb-4 sm:mb-0">
                      <h3 className="text-lg font-medium text-gray-900">
                        Selected: {selectedCandidate.name}
                      </h3>
                      <p className="text-gray-600">
                        Click the button below to confirm your vote
                      </p>
                    </div>
                    <Button
                      onClick={handleVoteClick}
                      disabled={voting}
                      className="flex items-center space-x-2"
                    >
                      <Camera className="w-4 h-4" />
                      <span>{voting ? 'Processing...' : 'Vote with Face Verification'}</span>
                    </Button>
                  </div>
                </motion.div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg"
                >
                  <p className="text-red-600">{error}</p>
                </motion.div>
              )}
            </>
          )}
        </motion.div>

        {/* Face Capture Modal */}
        {showFaceCapture && (
          <FaceCapture
            onCapture={handleFaceCapture}
            onClose={() => setShowFaceCapture(false)}
            disabled={voting}
          />
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
