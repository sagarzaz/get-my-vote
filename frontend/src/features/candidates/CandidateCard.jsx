import React from 'react';
import { motion } from 'framer-motion';
import { Vote as VoteIcon, User } from 'lucide-react';

const CandidateCard = ({ candidate, onVote, index = 0, maxVotes = 1, disabled = false }) => {
  const votePercentage = maxVotes > 0 ? ((candidate.voteCount || 0) / maxVotes) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
    >
      <div className="p-6">
        {/* Candidate Header */}
        <div className="flex items-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            {candidate.name ? candidate.name.charAt(0).toUpperCase() : <User className="w-8 h-8" />}
          </div>
          <div className="ml-4 flex-1">
            <h3 className="text-lg font-bold text-gray-900">
              {candidate.name || "Unknown"}
            </h3>
            <p className="text-sm text-gray-500">Candidate</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {candidate.description || "No description available"}
        </p>

        {/* Vote Count Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs font-medium mb-2">
            <span className="text-gray-600">Votes</span>
            <span className="font-semibold text-gray-900">
              {candidate.voteCount || 0}
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${votePercentage}%` }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
            />
          </div>
        </div>

        {/* Vote Button */}
        <motion.button
          whileHover={!disabled ? { scale: 1.02 } : {}}
          whileTap={!disabled ? { scale: 0.98 } : {}}
          onClick={() => onVote(candidate)}
          disabled={disabled}
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <VoteIcon className="w-5 h-5" />
          <span>Vote</span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default CandidateCard;
