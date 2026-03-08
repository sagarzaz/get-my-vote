import React from 'react';
import Card from './ui/Card';
import { Users, Vote, TrendingUp, Award } from 'lucide-react';
import { Skeleton } from './ui/SkeletonLoader';

const BaseStatCard = ({ title, value, icon: Icon, color, loading, subtext }) => {
  if (loading) {
    return (
      <Card className="h-full">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-10 rounded-lg" />
        </div>
        <Skeleton className="h-8 w-16 mb-2" />
        <Skeleton className="h-4 w-32" />
      </Card>
    );
  }

  const colorStyles = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
  };

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-500 font-medium text-sm">{title}</h3>
        <div className={`p-2 rounded-lg ${colorStyles[color] || colorStyles.blue}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="flex flex-col">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
        {subtext && <span className="text-xs text-gray-500 mt-1">{subtext}</span>}
      </div>
    </Card>
  );
};

export const TotalVotersCard = ({ value, loading }) => (
  <BaseStatCard
    title="Total Voters"
    value={value}
    icon={Users}
    color="blue"
    loading={loading}
    subtext="Registered voters"
  />
);

export const TotalVotesCard = ({ value, change, loading }) => (
  <BaseStatCard
    title="Total Votes"
    value={value}
    icon={Vote}
    color="green"
    loading={loading}
    subtext={change ? `+${change} since last hour` : 'Votes cast so far'}
  />
);

export const TotalCandidatesCard = ({ value, loading }) => (
  <BaseStatCard
    title="Candidates"
    value={value}
    icon={Award}
    color="purple"
    loading={loading}
    subtext="Active candidates"
  />
);

export const VotingProgressCard = ({ value, loading }) => (
  <BaseStatCard
    title="Turnout"
    value={`${value}%`}
    icon={TrendingUp}
    color="orange"
    loading={loading}
    subtext="Voter participation"
  />
);