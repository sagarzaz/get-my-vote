import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import apiClient from '../api/apiClient';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';

const StatCard = ({ title, value, icon }) => (
  <Card>
    <div className="flex items-center">
      <div className="p-3 bg-primary rounded-full text-white mr-4">{icon}</div>
      <div>
        <p className="text-sm text-neutral/70">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  </Card>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/vote/stats')
      .then(res => {
        setStats(res.data.data);
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard title="Total Candidates" value={stats?.total_candidates} icon={'🗳️'} />
        <StatCard title="Total Votes Cast" value={stats?.total_votes} icon={'👥'} />
        <StatCard title="Voter Turnout" value={`${stats?.voter_turnout?.toFixed(2) || 0}%`} icon={'📈'} />
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <Link to="/vote">
          <Button>Go to Vote Page</Button>
        </Link>
      </div>
    </motion.div>
  );
};

export default Dashboard;
