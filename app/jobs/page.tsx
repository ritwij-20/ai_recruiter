'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/public/Navbar';
import { Footer } from '@/components/public/Footer';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { getPublishedJobs } from '@/lib/services/jobService';
import { Job, isJobPublished, WorkMode, EmploymentType } from '@/types/recruiter';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  Clock, 
  Building, 
  ArrowRight,
  FilterX,
  Users,
  Loader2,
  AlertCircle,
  Sparkles,
  DollarSign
} from 'lucide-react';

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWorkMode, setSelectedWorkMode] = useState<string>('ALL');
  const [selectedEmploymentType, setSelectedEmploymentType] = useState<string>('ALL');

  useEffect(() => {
    async function fetchJobs() {
      try {
        setLoading(true);
        setError(null);
        const data = await getPublishedJobs();
        setJobs(data);
      } catch (err: any) {
        console.error('Error fetching jobs:', err);
        setError('Unable to load active positions. Please check your connection.');
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, []);

  // Filter jobs - strictly published only
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // Must be 'published' or 'active' (never draft, never closed)
      const status = (job.status || '').toLowerCase();
      if (status !== 'published' && status !== 'active') return false;


      // Keyword Search Match (Title, Company, Skills, Location)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = job.title.toLowerCase().includes(query);
        const matchesCompany = job.company.toLowerCase().includes(query);
        const matchesLocation = job.location.toLowerCase().includes(query);
        const matchesSkills = (job.requiredSkills || []).some(s => s.toLowerCase().includes(query)) ||
                              (job.preferredSkills || []).some(s => s.toLowerCase().includes(query));

        if (!matchesTitle && !matchesCompany && !matchesLocation && !matchesSkills) {
          return false;
        }
      }

      // Work Mode Filter
      if (selectedWorkMode !== 'ALL' && job.workMode !== selectedWorkMode) {
        return false;
      }

      // Employment Type Filter
      if (selectedEmploymentType !== 'ALL' && job.employmentType !== selectedEmploymentType) {
        return false;
      }

      return true;
    });
  }, [jobs, searchQuery, selectedWorkMode, selectedEmploymentType]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedWorkMode('ALL');
    setSelectedEmploymentType('ALL');
  };

  const hasActiveFilters = searchQuery !== '' || selectedWorkMode !== 'ALL' || selectedEmploymentType !== 'ALL';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Navbar />

      {/* Header Banner */}
      <section className="bg-white border-b border-slate-200 py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Powered Recruitment Pipeline</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
            Discover Verified Opportunities
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
            Browse published job openings with transparent requirement criteria, structured skill benchmarks, and evidence-based matching.
          </p>

          {/* Search and Filters Bar */}
          <div className="pt-2 grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-6 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by job title, company, location, or skills..."
                className="pl-9 h-10 text-xs"
              />
            </div>

            <div className="sm:col-span-3">
              <select
                value={selectedWorkMode}
                onChange={(e) => setSelectedWorkMode(e.target.value)}
                aria-label="Filter by Work Mode"
                className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Work Modes</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
              </select>
            </div>

            <div className="sm:col-span-3">
              <select
                value={selectedEmploymentType}
                onChange={(e) => setSelectedEmploymentType(e.target.value)}
                aria-label="Filter by Employment Type"
                className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Job Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs text-slate-500">
                Found {filteredJobs.length} matching {filteredJobs.length === 1 ? 'position' : 'positions'}
              </span>
              <button
                onClick={clearFilters}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 ml-2"
              >
                <FilterX className="w-3.5 h-3.5" /> Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Main Jobs Listing */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6">
        {loading ? (
          <div className="py-24 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Loading published opportunities...
            </p>
          </div>
        ) : error ? (
          <div className="p-8 bg-white rounded-xl border border-slate-200 text-center space-y-3 max-w-md mx-auto">
            <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
            <h2 className="text-base font-bold text-slate-900">Unable to Load Jobs</h2>
            <p className="text-xs text-slate-500">{error}</p>
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <EmptyState
              icon={Briefcase}
              title="No open positions found"
              description={
                hasActiveFilters
                  ? 'No published openings match your active filter criteria. Try expanding your search or clearing filters.'
                  : 'Check back soon! Recruiters publish new verified openings regularly.'
              }
              action={
                hasActiveFilters ? (
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    Reset Search
                  </Button>
                ) : undefined
              }
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Showing {filteredJobs.length} verified {filteredJobs.length === 1 ? 'role' : 'roles'}</span>
              <span>Updated real-time</span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                        Active Opening
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-600 font-medium">{job.workMode}</span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-600 font-medium">{job.employmentType}</span>
                    </div>

                    <Link href={`/jobs/${job.id}`} className="block group">
                      <h2 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {job.title}
                      </h2>
                    </Link>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                      <span className="flex items-center gap-1.5 font-medium text-slate-800">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        {job.company}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {job.location}
                      </span>
                      {job.salaryRange && (
                        <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                          {job.salaryRange}
                        </span>
                      )}
                    </div>

                    {job.summary ? (
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed pt-1">
                        {job.summary}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed pt-1">
                        {job.description}
                      </p>
                    )}

                    {/* Required Skills Chips */}
                    {job.requiredSkills && job.requiredSkills.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-2">
                        <span className="text-[11px] font-medium text-slate-400 mr-1">Skills:</span>
                        {job.requiredSkills.slice(0, 4).map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200"
                          >
                            {skill}
                          </span>
                        ))}
                        {job.requiredSkills.length > 4 && (
                          <span className="text-[11px] text-slate-400">
                            +{job.requiredSkills.length - 4} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions Column */}
                  <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <span className="text-[11px] text-slate-400 whitespace-nowrap">
                      Posted {new Date(job.publishedAt || job.createdAt).toLocaleDateString()}
                    </span>

                    <Link href={`/jobs/${job.id}`}>
                      <Button variant="primary" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5">
                        <span>View Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
