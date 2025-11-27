'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Conference } from '@/types';
import { Plus, Edit, Trash2, Search, X } from 'lucide-react';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function AdminConferencesPage() {
  const router = useRouter();
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingConference, setEditingConference] = useState<Conference | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    start_date: '',
    end_date: '',
    city: '',
    country: '',
    industry: '',
    attendance_estimate: '',
    agenda_url: '',
    pricing_url: '',
    organizer_name: '',
    organizer_email: '',
    organizer_phone: '',
  });

  useEffect(() => {
    fetchConferences();
  }, []);

  const fetchConferences = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/conferences?pageSize=100');
      if (!response.ok) throw new Error('Failed to fetch conferences');
      const data = await response.json();
      setConferences(data.data || []);
    } catch (error) {
      console.error('Error fetching conferences:', error);
      alert('Failed to load conferences');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        name: formData.name,
        url: formData.url,
      };

      // Add optional fields if provided
      if (formData.start_date) payload.start_date = formData.start_date;
      if (formData.end_date) payload.end_date = formData.end_date;
      if (formData.city) payload.city = formData.city;
      if (formData.country) payload.country = formData.country;
      if (formData.industry) {
        payload.industry = formData.industry.split(',').map((i) => i.trim()).filter(Boolean);
      }
      if (formData.attendance_estimate) {
        payload.attendance_estimate = parseInt(formData.attendance_estimate, 10);
      }
      if (formData.agenda_url) payload.agenda_url = formData.agenda_url;
      if (formData.pricing_url) payload.pricing_url = formData.pricing_url;
      if (formData.organizer_name) payload.organizer_name = formData.organizer_name;
      if (formData.organizer_email) payload.organizer_email = formData.organizer_email;
      if (formData.organizer_phone) payload.organizer_phone = formData.organizer_phone;

      const response = await fetch('/api/conferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create conference');
      }

      alert('Conference created successfully');
      setShowCreateForm(false);
      resetForm();
      fetchConferences();
    } catch (error: any) {
      console.error('Error creating conference:', error);
      alert(`Failed to create conference: ${error.message}`);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingConference) return;

    try {
      const payload: any = {};

      if (formData.name) payload.name = formData.name;
      if (formData.url) payload.url = formData.url;
      if (formData.start_date) payload.start_date = formData.start_date;
      if (formData.end_date) payload.end_date = formData.end_date;
      if (formData.city) payload.city = formData.city;
      if (formData.country) payload.country = formData.country;
      if (formData.industry) {
        payload.industry = formData.industry.split(',').map((i) => i.trim()).filter(Boolean);
      }
      if (formData.attendance_estimate) {
        payload.attendance_estimate = parseInt(formData.attendance_estimate, 10);
      }
      if (formData.agenda_url) payload.agenda_url = formData.agenda_url;
      if (formData.pricing_url) payload.pricing_url = formData.pricing_url;
      if (formData.organizer_name) payload.organizer_name = formData.organizer_name;
      if (formData.organizer_email) payload.organizer_email = formData.organizer_email;
      if (formData.organizer_phone) payload.organizer_phone = formData.organizer_phone;

      const response = await fetch(`/api/conferences/${editingConference.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update conference');
      }

      alert('Conference updated successfully');
      setEditingConference(null);
      resetForm();
      fetchConferences();
    } catch (error: any) {
      console.error('Error updating conference:', error);
      alert(`Failed to update conference: ${error.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this conference? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/conferences/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete conference');
      }

      alert('Conference deleted successfully');
      fetchConferences();
    } catch (error: any) {
      console.error('Error deleting conference:', error);
      alert(`Failed to delete conference: ${error.message}`);
    }
  };

  const startEdit = (conference: Conference) => {
    setEditingConference(conference);
    setFormData({
      name: conference.name || '',
      url: conference.url || '',
      start_date: conference.start_date ? conference.start_date.split('T')[0] : '',
      end_date: conference.end_date ? conference.end_date.split('T')[0] : '',
      city: conference.city || '',
      country: conference.country || '',
      industry: Array.isArray(conference.industry) ? conference.industry.join(', ') : '',
      attendance_estimate: conference.attendance_estimate?.toString() || '',
      agenda_url: conference.agenda_url || '',
      pricing_url: conference.pricing_url || '',
      organizer_name: conference.organizer_name || '',
      organizer_email: conference.organizer_email || '',
      organizer_phone: conference.organizer_phone || '',
    });
    setShowCreateForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      url: '',
      start_date: '',
      end_date: '',
      city: '',
      country: '',
      industry: '',
      attendance_estimate: '',
      agenda_url: '',
      pricing_url: '',
      organizer_name: '',
      organizer_email: '',
      organizer_phone: '',
    });
    setEditingConference(null);
  };

  const filteredConferences = conferences.filter((conf) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      conf.name?.toLowerCase().includes(query) ||
      conf.city?.toLowerCase().includes(query) ||
      conf.country?.toLowerCase().includes(query) ||
      conf.url?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600">Loading conferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Conference Management</h1>
        <button
          onClick={() => {
            resetForm();
            setShowCreateForm(true);
          }}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Conference
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conferences by name, city, country, or URL..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {editingConference ? 'Edit Conference' : 'Create New Conference'}
            </h2>
            <button
              onClick={() => {
                setShowCreateForm(false);
                resetForm();
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={editingConference ? handleUpdate : handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Industry (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  placeholder="e.g., Technology, Healthcare, Finance"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Attendance Estimate
                </label>
                <input
                  type="number"
                  value={formData.attendance_estimate}
                  onChange={(e) => setFormData({ ...formData, attendance_estimate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Agenda URL</label>
                <input
                  type="url"
                  value={formData.agenda_url}
                  onChange={(e) => setFormData({ ...formData, agenda_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pricing URL</label>
                <input
                  type="url"
                  value={formData.pricing_url}
                  onChange={(e) => setFormData({ ...formData, pricing_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Organizer Name</label>
                <input
                  type="text"
                  value={formData.organizer_name}
                  onChange={(e) => setFormData({ ...formData, organizer_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Organizer Email</label>
                <input
                  type="email"
                  value={formData.organizer_email}
                  onChange={(e) => setFormData({ ...formData, organizer_email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Organizer Phone</label>
                <input
                  type="tel"
                  value={formData.organizer_phone}
                  onChange={(e) => setFormData({ ...formData, organizer_phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  resetForm();
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                {editingConference ? 'Update' : 'Create'} Conference
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Conferences Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  URL
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredConferences.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    {searchQuery ? 'No conferences found matching your search.' : 'No conferences yet.'}
                  </td>
                </tr>
              ) : (
                filteredConferences.map((conference) => (
                  <tr key={conference.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{conference.name}</div>
                      {conference.industry && Array.isArray(conference.industry) && (
                        <div className="text-sm text-gray-500">
                          {conference.industry.join(', ')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {conference.city && conference.country
                          ? `${conference.city}, ${conference.country}`
                          : conference.city || conference.country || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {conference.start_date
                        ? new Date(conference.start_date).toLocaleDateString()
                        : '-'}
                      {conference.end_date &&
                        ` - ${new Date(conference.end_date).toLocaleDateString()}`}
                    </td>
                    <td className="px-6 py-4">
                      <a
                        href={conference.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-indigo-600 hover:text-indigo-500 truncate block max-w-xs"
                      >
                        {conference.url}
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => startEdit(conference)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(conference.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

