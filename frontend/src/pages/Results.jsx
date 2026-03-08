import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import apiClient from '../api/apiClient';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import { Trophy, Users, Clock, Lock } from 'lucide-react';

const Results = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resultsPublished, setResultsPublished] = useState(false);
  const [electionSettings, setElectionSettings] = useState(null);

  useEffect(() => {
    apiClient.get('/vote/results')
      .then(res => {
        const data = res.data.data;
        setResults(data.results || data.candidates || []);
        setResultsPublished(data.resultsPublished || false);
        setElectionSettings(data.electionSettings || null);
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

  // If results are not published, show a message
  if (!resultsPublished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Results Not Yet Published</h2>
          <p className="text-gray-600">
            The election results will be published after the voting period ends. 
            Please check back later.
          </p>
          {electionSettings && electionSettings.endTime && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <Clock className="inline w-4 h-4 mr-1" />
                Voting ends: {new Date(electionSettings.endTime).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  const totalVotes = results.reduce((acc, candidate) => acc + candidate.voteCount, 0);
  
  // Sort by votes descending
  const sortedResults = [...results].sort((a, b) => b.voteCount - a.voteCount);

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Election Results</h1>
        <p className="text-gray-600">Total Votes Cast: <span className="font-semibold">{totalVotes}</span></p>
      </div>

      {/* Winner Card */}
      {sortedResults.length > 0 && sortedResults[0].voteCount > 0 && (
        <Card className="mb-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-10 h-10 text-yellow-600" />
            </div>
            <h2 className="text-xl font-bold text-yellow-600 mb-2">Winner</h2>
            {sortedResults[0].photo ? (
              <img 
                src={sortedResults[0].photo.startsWith('http') ? sortedResults[0].photo : `http://localhost:5000${sortedResults[0].photo}`} 
                alt={sortedResults[0].name}
                className="w-24 h-24 rounded-full mx-auto mb-3 object-cover"
              />
            ) : (
              <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-3xl font-bold text-primary-600">
                  {sortedResults[0].name?.charAt(0)}
                </span>
              </div>
            )}
            <h3 className="text-2xl font-bold">{sortedResults[0].name}</h3>
            <p className="text-3xl font-bold text-primary-600 mt-2">
              {sortedResults[0].voteCount} Votes
            </p>
          </div>
        </Card>
      )}

      {/* All Candidates Results */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sortedResults.map((candidate, index) => (
          <Card key={candidate.id || candidate._id} className={index === 0 && candidate.voteCount > 0 ? 'border-2 border-yellow-400' : ''}>
            <div className="flex items-center space-x-4">
              {/* Candidate Photo */}
              {candidate.photo ? (
                <img 
                  src={candidate.photo.startsWith('http') ? candidate.photo : `http://localhost:5000${candidate.photo}`} 
                  alt={candidate.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xl font-bold text-primary-600">
                    {candidate.name?.charAt(0)}
                  </span>
                </div>
              )}
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-semibold">{candidate.name}</h3>
                    {index === 0 && candidate.voteCount > 0 && (
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">Winner</span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold">{candidate.voteCount}</span>
                    <span className="text-sm text-gray-500 ml-1">votes</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    className="bg-primary h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${totalVotes > 0 ? (candidate.voteCount / totalVotes) * 100 : 0}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {totalVotes > 0 ? ((candidate.voteCount / totalVotes) * 100).toFixed(1) : 0}% of total votes
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Results;
