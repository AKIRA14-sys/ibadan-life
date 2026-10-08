import React, { useState } from 'react';
import { Job } from '../types';
import { Briefcase, Clock, X } from 'lucide-react';

interface Props {
  jobs: Job[];
  onClose: () => void;
  onWorkJob: (job: Job) => void;
}

export const JobsModal: React.FC<Props> = ({ jobs, onClose, onWorkJob }) => {
  const [workingJobId, setWorkingJobId] = useState<string | null>(null);

  const handleWork = (job: Job) => {
    setWorkingJobId(job.id);
    setTimeout(() => {
      onWorkJob(job);
      setWorkingJobId(null);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-md">
      <div className="hud-card w-full max-w-lg p-6 space-y-5 border border-emerald-500/30 text-white max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold">IBADAN EMPLOYMENT CENTER</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          {jobs.map((job) => (
            <div key={job.id} className="p-4 rounded-xl bg-gray-900/80 border border-gray-800 hover:border-emerald-500/40 transition-all space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-sm text-emerald-400">{job.name}</h3>
                  <p className="text-xs text-gray-300 mt-0.5">{job.description}</p>
                </div>
                <div className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                  +₦{job.salary.toLocaleString()}/Shift
                </div>
              </div>

              <button
                disabled={workingJobId === job.id}
                onClick={() => handleWork(job)}
                className="w-full mt-2 py-2 rounded-lg hud-button-primary text-xs font-bold flex items-center justify-center gap-2"
              >
                {workingJobId === job.id ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin text-amber-300" />
                    <span>Completing Shift in Ibadan...</span>
                  </>
                ) : (
                  <>
                    <Briefcase className="w-4 h-4" />
                    <span>Work Shift & Earn Salary</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
