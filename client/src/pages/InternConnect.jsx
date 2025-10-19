import React, { useState } from 'react';
import axios from 'axios';
import {
  Briefcase,
  MapPin,
  Globe,
  Filter,
  Loader2,
  Building2,
  Wallet,
  Clock3
} from 'lucide-react';

const defaultFilters = {
  job_category: 'Software Development',
  location: '',
  work_from_home: false,
  stipend: '',
};

export default function InternConnect() {
  const [filters, setFilters] = useState(defaultFilters);
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const fetchInternships = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setInternships([]);
    
    try {
      const payload = { ...filters, max_results: 12 };
      const apiBase = import.meta.env.VITE_API_URL || '';
      
      // Set a longer timeout for the scraping request (3 minutes)
      const { data } = await axios.post(`${apiBase}/internships/fetch`, payload, {
        timeout: 180000, // 3 minutes timeout
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      setInternships(data.internships);
    } catch (err) {
      console.error('❌ Error fetching internships:', err);
      
      let errorMessage = 'Failed to fetch internships.';
      if (err.code === 'ECONNABORTED') {
        errorMessage = 'Request timed out. The scraping process is taking longer than expected. Please try again.';
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#111827] text-white py-10 px-4 flex flex-col items-center">
      <div className="w-full max-w-4xl bg-[#1e293b] border border-blue-700 rounded-3xl shadow-xl p-8 mb-10">
        <h1 className="text-4xl font-extrabold text-blue-400 flex items-center gap-3 mb-2">
          <Briefcase className="w-10 h-10 text-blue-500" /> InternConnect
        </h1>
        <p className="text-lg text-gray-300 mb-6">
          Explore curated internships from trusted sources. Filter by field, city, stipend, and remote jobs.
        </p>
        <form
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          onSubmit={fetchInternships}
        >
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-300">
              Field of Interest
            </label>
            <input
              name="job_category"
              value={filters.job_category}
              onChange={handleChange}
              className="w-full bg-[#0f172a] text-white border border-blue-700 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Web Development"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-300">
              Location
            </label>
            <input
              name="location"
              value={filters.location}
              onChange={handleChange}
              className="w-full bg-[#0f172a] text-white border border-blue-700 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Delhi, Remote"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-300">
              Minimum Stipend (₹)
            </label>
            <input
              name="stipend"
              value={filters.stipend}
              onChange={handleChange}
              className="w-full bg-[#0f172a] text-white border border-blue-700 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. 5000"
            />
          </div>
          <div className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              name="work_from_home"
              checked={filters.work_from_home}
              onChange={handleChange}
              id="wfh"
              className="accent-blue-500 w-5 h-5"
            />
            <label htmlFor="wfh" className="text-sm font-semibold text-gray-300">
              Remote Only
            </label>
          </div>
          <button
            type="submit"
            className="col-span-full mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl flex items-center gap-2 justify-center transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin w-5 h-5" />
                <span>Scraping internships...</span>
              </>
            ) : (
              <>
                <Filter className="w-5 h-5" />
                <span>Find Internships</span>
              </>
            )}
          </button>
        </form>
        {error && <div className="mt-4 text-red-500 font-semibold">{error}</div>}
        
        {loading && (
          <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-xl">
            <div className="flex items-center gap-3 text-blue-300">
              <Loader2 className="animate-spin w-5 h-5" />
              <div>
                <p className="font-semibold">Scraping internships from Internshala...</p>
                <p className="text-sm text-blue-400">This may take 30-60 seconds. Please wait...</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {internships.length > 0 && (
        <div className="w-full max-w-5xl bg-[#1f2937] rounded-3xl shadow-lg p-6 border border-blue-700">
          <h2 className="text-2xl font-bold text-blue-400 mb-6">
            Internship Results
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {internships.map((item, idx) => (
              <div
                key={idx}
                className="rounded-2xl p-5 bg-gradient-to-br from-[#1e293b] via-[#0f172a] to-[#1f2937] shadow-md hover:shadow-2xl transition-all duration-300 border border-blue-700"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Briefcase className="w-6 h-6 text-blue-400" />
                  <h3 className="text-lg font-bold">{item.title}</h3>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300 mb-1">
                  <Building2 className="w-4 h-4" />
                  <span className="font-semibold">{item.company}</span>
                </div>
                <div className="flex gap-4 text-sm text-gray-400 mb-2">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" /> {item.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Globe className="w-4 h-4" />
                    {item.work_from_home ? 'Remote' : 'On-site'}
                  </span>
                </div>
                <div className="flex gap-4 text-sm text-gray-300">
                  <span className="flex items-center gap-1">
                    <Wallet className="w-4 h-4" /> <b>Stipend:</b> {item.stipend}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock3 className="w-4 h-4" /> <b>Duration:</b> {item.duration}
                  </span>
                </div>
                <a
                  href={item.apply_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200"
                >
                  Apply Now
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
