import React from 'react';
import { Users } from 'lucide-react';
import CandidateCard from './CandidateCard';
import { CardSkeleton } from '../../components/ui/LoadingSpinner';

const CandidateGrid = ({ 
  candidates = [], 
  loading = false, 
  onVote, 
  maxVotes = 1,
  skeletonCount = 6 
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!candidates || candidates.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No Candidates Available
        </h3>
        <p className="text-gray-600">
          There are no candidates to vote for at the moment.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {candidates.map((candidate, index) => (
        <CandidateCard
          key={candidate.id || index}
          candidate={candidate}
          index={index}
          maxVotes={maxVotes}
          onVote={onVote}
        />
      ))}
    </div>
  );
};

export default CandidateGrid;
