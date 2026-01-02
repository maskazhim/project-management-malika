import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { GlassCard } from '../components/ui/GlassCard';
import { UserPlus, Mail, Shield, CalendarDays, Clock, CheckSquare } from 'lucide-react';
import { ROLES } from '../constants';
import { Role } from '../types';
import { formatTime } from '../utils/formatTime';

const Team: React.FC = () => {
  const { team, addTeamMember, tasks } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', email: '', role: 'Sales' as Role });
  const [dateRange, setDateRange] = useState<'all' | 'today' | '7days' | '30days'>('all');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addTeamMember(newMember);
    setShowForm(false);
    setNewMember({ name: '', email: '', role: 'Sales' });
  };
  
  const getMemberStats = (memberId: string) => {
      // Filter tasks where the member is assigned (in assignees array)
      const memberTasks = tasks.filter(t => t.assignees.includes(memberId));
      
      // Calculate total time (Note: currently timeSpent is global for the task, 
      // in a real app we would sum up individual UserTimeLogs. 
      // For this demo, we assume proportional or simply display global task involvement)
      // Since we don't have individual logs in the Task object yet (only global timeSpent),
      // we will display the sum of time of tasks they are involved in.
      
      const totalSeconds = memberTasks.reduce((acc, t) => acc + t.timeSpent, 0);
      const completedCount = memberTasks.filter(t => t.isCompleted).length;

      return {
          hours: formatTime(totalSeconds), // This represents "Time on involved tasks"
          tasks: completedCount
      };
  }

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <div>
           <h1 className="text-3xl font-bold text-gray-900">Team Members</h1>
           <p className="text-gray-500">Manage your internal agency staff.</p>
        </div>
        <div className="flex items-center gap-4">
             <div className="flex items-center space-x-2 bg-white rounded-xl p-1 border border-gray-200 shadow-sm">
                <CalendarDays className="w-4 h-4 text-gray-400 ml-2" />
                <select 
                    className="bg-transparent border-none text-sm font-medium text-gray-700 focus:ring-0 cursor-pointer py-2 pr-8 pl-2"
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value as any)}
                >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="7days">Last 7 Days</option>
                    <option value="30days">Last 30 Days</option>
                </select>
            </div>
            <button 
              onClick={() => setShowForm(!showForm)}
              className="bg-gray-900 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-black transition-all flex items-center"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Add Member
            </button>
        </div>
      </div>

      {showForm && (
          <GlassCard className="p-6 max-w-2xl mx-auto mb-8 animate-in fade-in slide-in-from-top-4">
              <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div className="col-span-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">Name</label>
                      <input required type="text" className="w-full mt-1 p-2 bg-white/50 border rounded-lg text-gray-900" value={newMember.name} onChange={e => setNewMember({...newMember, name: e.target.value})} />
                  </div>
                  <div className="col-span-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
                      <input required type="email" className="w-full mt-1 p-2 bg-white/50 border rounded-lg text-gray-900" value={newMember.email} onChange={e => setNewMember({...newMember, email: e.target.value})} />
                  </div>
                  <div className="col-span-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">Role</label>
                      <select className="w-full mt-1 p-2 bg-white/50 border rounded-lg text-gray-900" value={newMember.role} onChange={e => setNewMember({...newMember, role: e.target.value as Role})}>
                          {ROLES.map(role => (
                              <option key={role} value={role}>{role}</option>
                          ))}
                      </select>
                  </div>
                  <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg h-[42px] col-span-1">Add to Team</button>
              </form>
          </GlassCard>
      )}

      <div className="flex flex-col space-y-4">
        {team.map(member => {
            const stats = getMemberStats(member.id);
            return (
              <GlassCard key={member.id} className="p-4 flex items-center justify-between" hoverEffect>
                 <div className="flex items-center space-x-6">
                     <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md">
                         <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                     </div>
                     <div>
                        <h3 className="text-lg font-bold text-gray-900">{member.name}</h3>
                        <div className="flex items-center text-gray-500 text-sm space-x-4 mb-1">
                            <span className="flex items-center"><Mail className="w-3 h-3 mr-1" /> {member.email}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-medium text-xs border border-indigo-100 inline-flex items-center">
                            <Shield className="w-3 h-3 mr-1" />
                            {member.role}
                        </span>
                     </div>
                 </div>
                 
                 <div className="flex items-center space-x-8 mr-4">
                     <div className="text-center">
                         <div className="flex items-center justify-center text-gray-400 text-xs uppercase font-bold mb-1">
                             <Clock className="w-3 h-3 mr-1" /> Involved Hours
                         </div>
                         <div className="text-xl font-mono font-bold text-gray-800">{stats.hours}</div>
                     </div>
                     <div className="text-center">
                         <div className="flex items-center justify-center text-gray-400 text-xs uppercase font-bold mb-1">
                             <CheckSquare className="w-3 h-3 mr-1" /> Tasks Done
                         </div>
                         <div className="text-xl font-mono font-bold text-gray-800">{stats.tasks}</div>
                     </div>
                 </div>
              </GlassCard>
            );
        })}
      </div>
    </div>
  );
};

export default Team;