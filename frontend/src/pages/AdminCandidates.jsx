import React, { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import apiClient from '../api/apiClient';
import Button from '../components/Button';
import Card from '../components/Card';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import { Plus, Trash2, Upload, X, User } from 'lucide-react';

const AdminCandidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const fileInputRef = useRef(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchCandidates = () => {
    apiClient.get('/admin/candidates')
      .then(res => setCandidates(res.data.data))
      .catch(err => setError('Failed to fetch candidates.'));
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description);
      if (photoFile) {
        formData.append('photo', photoFile);
      }
      await apiClient.post('/admin/candidate', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage('Candidate added successfully.');
      setIsModalOpen(false);
      reset();
      setPhotoPreview(null);
      setPhotoFile(null);
      fetchCandidates();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add candidate.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiClient.delete(`/admin/candidate/${id}`);
      setMessage('Candidate deleted successfully.');
      fetchCandidates();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete candidate.');
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoPreview(null);
    setPhotoFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    reset();
    setPhotoPreview(null);
    setPhotoFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Candidates</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="inline-block mr-2" />
          Add Candidate
        </Button>
      </div>
      <Card>
        <table className="min-w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-4">Photo</th>
              <th className="text-left p-4">Name</th>
              <th className="text-left p-4">Description</th>
              <th className="text-right p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map(candidate => (
              <tr key={candidate._id || candidate.id} className="border-b hover:bg-gray-50">
                <td className="p-4">
                  {candidate.photo ? (
                    <img 
                      src={candidate.photo.startsWith('http') ? candidate.photo : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${candidate.photo}`} 
                      alt={candidate.name} 
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </td>
                <td className="p-4 font-semibold">{candidate.name}</td>
                <td className="p-4">{candidate.description}</td>
                <td className="p-4 text-right">
                  <Button onClick={() => handleDelete(candidate._id || candidate.id)} className="bg-error hover:bg-error/90">
                    <Trash2 size={16} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <h2 className="text-2xl font-bold mb-4">Add New Candidate</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              {...register('name', { required: 'Name is required' })}
              className="w-full px-3 py-2 border rounded-md"
            />
            {errors.name && <p className="text-error text-sm mt-1">{errors.name.message}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Photo</label>
            <div className="flex items-center space-x-4">
              {photoPreview ? (
                <div className="relative">
                  <img 
                    src={photoPreview} 
                    alt="Preview" 
                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
                >
                  <User className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Upload size={16} />
                <span>{photoPreview ? 'Change Photo' : 'Upload Photo'}</span>
              </button>
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1" htmlFor="description">Description</label>
            <textarea
              id="description"
              {...register('description', { required: 'Description is required' })}
              className="w-full px-3 py-2 border rounded-md"
            />
            {errors.description && <p className="text-error text-sm mt-1">{errors.description.message}</p>}
          </div>
          <Button type="submit" className="w-full">Add Candidate</Button>
        </form>
      </Modal>
      {error && <Toast message={error} type="error" onClose={() => setError(null)} />}
      {message && <Toast message={message} type="success" onClose={() => setMessage(null)} />}
    </div>
  );
};

export default AdminCandidates;
