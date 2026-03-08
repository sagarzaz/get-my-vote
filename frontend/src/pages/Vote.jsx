import React, { useEffect, useState, useContext } from 'react';
import apiClient from '../api/apiClient';
import AuthContext from '../context/AuthContext';
import CandidateCard from '../components/CandidateCard';
import FaceCapture from '../components/FaceCapture';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import Card from '../components/Card';
import { Vote, Lock } from 'lucide-react';

const VotePage = () => {
  const { user } = useContext(AuthContext);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFaceCapture, setShowFaceCapture] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [votingStatus, setVotingStatus] = useState({ votingOpen: false, message: '' });

  useEffect(() => {
    checkVotingStatus();
  }, []);

  const checkVotingStatus = async () => {
    try {
      const res = await apiClient.get('/vote/status/public');
      if (res.data.success) {
        setVotingStatus({
          votingOpen: res.data.data.votingOpen,
          message: res.data.data.message
        });
      }
    } catch (err) {
      console.error('Failed to check voting status:', err);
    } finally {
      fetchCandidates();
    }
  };

  const fetchCandidates = async () => {
    try {
      const res = await apiClient.get('/vote/candidates');
      setCandidates(res.data.data);
    } catch (err) {
      setError('Failed to fetch candidates.');
    } finally {
      setLoading(false);
    }
  };

  const handleVoteClick = (candidateId) => {
    setSelectedCandidate(candidateId);
    setShowFaceCapture(true);
  };

  const handleCapture = async (faceImage) => {
    try {
      await apiClient.post('/vote/cast', {
        candidate_id: selectedCandidate,
        face_image: faceImage.split(',')[1],
      });
      setShowFaceCapture(false);
      setMessage('Vote cast successfully!');
      fetchCandidates();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cast vote.');
      setShowFaceCapture(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  // Check if user is admin
  if (user?.role === 'admin') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-gray-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Access Restricted</h2>
          <p className="text-gray-600">
            Administrators are not allowed to vote. You can manage the election from the admin dashboard.
          </p>
        </Card>
      </div>
    );
  }

  // Check if voting is closed
  if (!votingStatus.votingOpen) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Voting Closed</h2>
          <p className="text-gray-600">
            {votingStatus.message || 'Voting is currently closed. Please wait for the election to start.'}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Cast Your Vote</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {candidates.map(candidate => (
          <CandidateCard key={candidate._id} candidate={candidate} onVote={handleVoteClick} />
        ))}
      </div>
      {showFaceCapture && (
        <FaceCapture
          onCapture={handleCapture}
          onClose={() => setShowFaceCapture(false)}
        />
      )}
      {error && <Toast message={error} type="error" onClose={() => setError(null)} />}
      {message && <Toast message={message} type="success" onClose={() => setMessage(null)} />}
    </div>
  );
};

export default VotePage;
