import React from 'react';
import { motion } from 'framer-motion';
import Button from './Button';
import { User } from 'lucide-react';

const CandidateCard = ({ candidate, onVote }) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-base-100 shadow-lg rounded-lg p-6 text-center"
    >
      {candidate.photo ? (
        <img
          src={candidate.photo.startsWith('http') ? candidate.photo : `http://localhost:5000${candidate.photo}`}
          alt={candidate.name}
          className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
        />
      ) : (
        <div className="w-24 h-24 rounded-full mx-auto mb-4 bg-gray-200 flex items-center justify-center">
          <User className="w-12 h-12 text-gray-400" />
        </div>
      )}
      <h3 className="text-xl font-bold">{candidate.name}</h3>
      <p className="text-neutral/70 mb-4">{candidate.description}</p>
      <p className="text-lg font-semibold mb-4">Votes: {candidate.voteCount || candidate.votes}</p>
      <Button onClick={() => onVote(candidate._id || candidate.id)}>Vote</Button>
    </motion.div>
  );
};

export default CandidateCard;
