import React from 'react';
import DashboardLayout from '../layouts/DashboardLayout';

const AdminLayout = ({ children }) => {
  return (
    <DashboardLayout>{children}</DashboardLayout>
  );
};

export default AdminLayout;