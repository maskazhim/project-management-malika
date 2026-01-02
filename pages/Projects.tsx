import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../context/AppContext';
import { GlassCard } from '../components/ui/GlassCard';
import { Plus, FolderOpen, Briefcase, Clock, CheckCircle2, User, ChevronRight, X, BarChart3, Layers, Calendar, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatTime } from '../utils/formatTime';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const Projects: React.FC = () => {
  const { projects, clients, tasks, team, addProject } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [newProject, setNewProject] = useState({ name: '', description: '' });

  // Helper to aggregate project data (Lightweight for list view)
  const getProjectStats = (projectId: string, clientId?: string) => {
      const client = clientId ? clients.find(c => c.id === clientId) : null;
      const projectTasks = tasks.filter(t => t.projectId === projectId);
      const totalTasks = projectTasks.length;
      const completedTasks = projectTasks.filter(t => t.isCompleted).length;
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      const totalSeconds = projectTasks.reduce((acc, t) => acc + t.timeSpent, 0);
      const memberIds = Array.from(new Set(projectTasks.flatMap(t => t.assignees)));
      const members = team.filter(m => memberIds.includes(m.id));

      return {
          clientName: client?.name || 'Internal Team',
          businessName: client?.businessName || 'Internal Project',
          package: client?.package || 'Internal',
          isInternal: !clientId,
          progress,
          totalSeconds,
          members,
          taskCount: totalTasks,
          completedCount: completedTasks
      };
  };

  // Helper for Detailed Modal Data
  const projectDetails = useMemo(() => {
      if (!selectedProject) return null;
      
      const project = projects.find(p => p.id === selectedProject);
      if (!project) return null;

      const client = project.clientId ? clients.find(c => c.id === project.clientId) : null;
      const projectTasks = tasks.filter(t => t.projectId === project.id);
      
      // Calculate Stats
      const totalSeconds = projectTasks.reduce((acc, t) => acc + t.timeSpent, 0);
      const totalTasks = projectTasks.length;
      const completedTasks = projectTasks.filter(t => t.isCompleted).length;
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      // Time Distribution Data (Top 5 Tasks)
      const timeDistribution = projectTasks
        .filter(t => t.timeSpent > 0)
        .map(t => ({
            name: t.title,
            seconds: t.timeSpent,
            formatted: formatTime(t.timeSpent)
        }))
        .sort((a, b) => b.seconds - a.seconds)
        .slice(0, 5);

      // Involved Team Members with Contribution
      const involvedMembers = team.map(member => {
          const memberTasks = projectTasks.filter(t => t.assignees.includes(member.id));
          if (memberTasks.length === 0) return null;
          
          // Estimate contribution (simplified: global task time / number of assignees)
          const contribution = memberTasks.reduce((acc, t) => acc + (t.timeSpent / t.assignees.length), 0);
          
          return {
              ...member,
              contributionSeconds: contribution,
              taskCount: memberTasks.length
          };
      }).filter(Boolean) as (typeof team[0] & { contributionSeconds: number, taskCount: number })[];

      return {
          project,
          client,
          tasks: projectTasks,
          stats: { totalSeconds, totalTasks, completedTasks, progress },
          chartData: timeDistribution,
          team: involvedMembers.sort((a, b) => b.contributionSeconds - a.contributionSeconds)
      };
  }, [selectedProject, projects, clients, tasks, team]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addProject(newProject);
    setIsModalOpen(false);
    setNewProject({ name: '', description: '' });
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <div>
           <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
           <p className="text-gray-500">Overview of client deliverables and progress.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-gray-900 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-black transition-all flex items-center shadow-lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Internal Project
        </button>
      </div>

      <div className="flex flex-col gap-4">
          {projects.map(project => {
              const stats = getProjectStats(project.id, project.clientId);
              
              return (
                <GlassCard 
                    key={project.id} 
                    onClick={() => setSelectedProject(project.id)}
                    className="p-0 overflow-hidden flex flex-col md:flex-row hover:shadow-md transition-all group cursor-pointer" 
                    hoverEffect
                >
                    {/* Left Status Stripe */}
                    <div className={`w-full md:w-1.5 h-1 md:h-auto ${stats.isInternal ? 'bg-gray-400' : 'bg-indigo-500'}`}></div>
                    
                    <div className="flex-1 p-6 flex flex-col md:flex-row items-start md:items-center gap-6">
                        
                        {/* Section 1: Main Info */}
                        <div className="flex-1 min-w-[200px]">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-lg font-bold text-gray-900 truncate" title={stats.businessName}>
                                    {stats.businessName}
                                </h3>
                                {stats.isInternal && (
                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase rounded-md">Internal</span>
                                )}
                            </div>
                            
                            {/* Project Name / Description context */}
                            <p className="text-sm text-gray-500 font-medium mb-3 truncate">{project.name}</p>

                            <div className="flex flex-wrap gap-2">
                                <div className="flex items-center text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                                    <User className="w-3 h-3 mr-1.5" />
                                    {stats.clientName}
                                </div>
                                {!stats.isInternal && (
                                    <div className="flex items-center text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100 font-medium">
                                        <Briefcase className="w-3 h-3 mr-1.5" />
                                        {stats.package}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Section 2: Team Members */}
                        <div className="flex flex-col gap-1 min-w-[120px]">
                            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Involved Team</p>
                            <div className="flex -space-x-3 mt-1">
                                {stats.members.length > 0 ? (
                                    stats.members.slice(0, 5).map(m => (
                                        <div key={m.id} className="w-9 h-9 rounded-full border-2 border-white shadow-sm overflow-hidden" title={`${m.name} (${m.role})`}>
                                            <img src={m.avatar} alt={m.name} className="w-full h-full object-cover" />
                                        </div>
                                    ))
                                ) : (
                                    <span className="text-xs text-gray-400 italic py-2">No members assigned</span>
                                )}
                                {stats.members.length > 5 && (
                                    <div className="w-9 h-9 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                                        +{stats.members.length - 5}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Section 3: Progress & Hours */}
                        <div className="flex flex-col gap-3 min-w-[200px] w-full md:w-auto border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                             
                             {/* Progress Bar */}
                             <div>
                                <div className="flex justify-between items-end mb-1">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Progress</span>
                                    <span className="text-xs font-bold text-gray-700">{stats.progress}%</span>
                                </div>
                                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full transition-all duration-500 ${
                                        stats.progress === 100 ? 'bg-green-500' : 'bg-indigo-500'
                                    }`} style={{ width: `${stats.progress}%` }}></div>
                                </div>
                                <div className="text-[10px] text-gray-400 mt-1 text-right">
                                    {stats.completedCount} / {stats.taskCount} tasks done
                                </div>
                             </div>

                             {/* Total Hours */}
                             <div className="flex items-center justify-between md:justify-start gap-4">
                                <div className="flex items-center text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200/50">
                                    <Clock className="w-4 h-4 mr-2 text-indigo-500" />
                                    <span className="font-mono font-bold text-sm">{formatTime(stats.totalSeconds)}</span>
                                </div>
                                <span className={`px-2.5 py-1 text-xs rounded-full font-bold uppercase ${
                                    project.status === 'Active' ? 'bg-green-100 text-green-700' : 
                                    project.status === 'Completed' ? 'bg-blue-100 text-blue-700' : 
                                    'bg-gray-100 text-gray-600'
                                }`}>
                                    {project.status}
                                </span>
                             </div>
                        </div>

                         {/* Arrow Action */}
                        <div className="hidden md:flex items-center justify-center pl-2 text-gray-300 group-hover:text-indigo-500 transition-colors">
                            <ChevronRight className="w-6 h-6" />
                        </div>
                    </div>
                </GlassCard>
              )
          })}
          
          {projects.length === 0 && (
              <div className="text-center py-20 text-gray-400 bg-white/30 rounded-3xl border-2 border-dashed border-gray-200">
                  <FolderOpen className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p>No projects created yet.</p>
              </div>
          )}
      </div>

       {/* Add Project Modal */}
       {createPortal(
        <AnimatePresence>
            {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md">
                <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
                >
                <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Create Internal Project</h2>
                    <form onSubmit={handleAdd} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-500 mb-1">Project Name</label>
                            <input required type="text" className="w-full rounded-lg border-gray-200 bg-gray-50 p-2 text-gray-900" 
                                value={newProject.name} onChange={e => setNewProject({...newProject, name: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-500 mb-1">Description</label>
                            <textarea className="w-full rounded-lg border-gray-200 bg-gray-50 p-2 h-24 text-gray-900" 
                                value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})} />
                        </div>
                        <div className="flex justify-end pt-2 space-x-2">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-500">Cancel</button>
                            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg">Create Project</button>
                        </div>
                    </form>
                </div>
                </motion.div>
            </div>
            )}
        </AnimatePresence>,
        document.body
       )}

      {/* Project Details Modal */}
      {createPortal(
          <AnimatePresence>
            {selectedProject && projectDetails && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md">
                    <motion.div 
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="bg-white/90 backdrop-blur-2xl border border-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
                    >
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-white/50">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                                        {projectDetails.client?.businessName || projectDetails.project.name}
                                    </h2>
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                                        projectDetails.project.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                        {projectDetails.project.status}
                                    </span>
                                </div>
                                <div className="flex items-center text-sm text-gray-500 gap-4">
                                    <span className="flex items-center"><FolderOpen className="w-4 h-4 mr-1.5" /> {projectDetails.project.name}</span>
                                    {projectDetails.client && (
                                        <span className="flex items-center text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 font-medium text-xs">
                                            <Shield className="w-3 h-3 mr-1" /> {projectDetails.client.package}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <button onClick={() => setSelectedProject(null)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-8">
                            
                            {/* Metrics Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex flex-col justify-center">
                                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">Total Hours</span>
                                    <div className="text-2xl font-mono font-bold text-indigo-700">{formatTime(projectDetails.stats.totalSeconds)}</div>
                                </div>
                                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col justify-center">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Progress</span>
                                    <div className="text-2xl font-bold text-gray-800">{projectDetails.stats.progress}%</div>
                                    <div className="w-full h-1 bg-gray-200 rounded-full mt-2 overflow-hidden">
                                        <div className="h-full bg-green-500" style={{ width: `${projectDetails.stats.progress}%` }}></div>
                                    </div>
                                </div>
                                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col justify-center">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Tasks Done</span>
                                    <div className="text-2xl font-bold text-gray-800">
                                        {projectDetails.stats.completedTasks} <span className="text-gray-400 text-lg">/ {projectDetails.stats.totalTasks}</span>
                                    </div>
                                </div>
                                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col justify-center">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Client Contact</span>
                                    <div className="text-sm font-bold text-gray-800 truncate">{projectDetails.client?.name || 'N/A'}</div>
                                    <div className="text-xs text-gray-500 truncate">{projectDetails.client?.email || 'N/A'}</div>
                                </div>
                            </div>

                            {/* Charts & Team Row */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Time Distribution Chart */}
                                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                                    <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center">
                                        <BarChart3 className="w-4 h-4 mr-2 text-indigo-500" /> Time Distribution (Top Tasks)
                                    </h3>
                                    <div className="h-48 w-full">
                                        {projectDetails.chartData.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart layout="vertical" data={projectDetails.chartData} margin={{ left: 20, right: 30 }}>
                                                    <XAxis type="number" hide />
                                                    <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 11, fill: '#6B7280' }} interval={0} />
                                                    <Tooltip 
                                                        cursor={{fill: '#F3F4F6'}}
                                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                        formatter={(value: any, name: any, props: any) => [props.payload.formatted, 'Time Spent']}
                                                    />
                                                    <Bar dataKey="seconds" barSize={16} radius={[0, 4, 4, 0]}>
                                                        {projectDetails.chartData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={index === 0 ? '#6366f1' : '#a5b4fc'} />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="h-full flex items-center justify-center text-gray-400 text-sm italic">No time recorded yet.</div>
                                        )}
                                    </div>
                                </div>

                                {/* Involved Team */}
                                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm overflow-hidden flex flex-col">
                                    <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center">
                                        <User className="w-4 h-4 mr-2 text-indigo-500" /> Team Involved
                                    </h3>
                                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
                                        {projectDetails.team.length > 0 ? (
                                            projectDetails.team.map(member => (
                                                <div key={member.id} className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-2">
                                                        <img src={member.avatar} alt={member.name} className="w-8 h-8 rounded-full border border-gray-100" />
                                                        <div>
                                                            <p className="text-xs font-bold text-gray-800">{member.name}</p>
                                                            <p className="text-[10px] text-gray-500">{member.role}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs font-mono font-bold text-indigo-600">{formatTime(Math.round(member.contributionSeconds))}</p>
                                                        <p className="text-[10px] text-gray-400">{member.taskCount} tasks</p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-xs text-gray-400 italic">No members assigned.</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Client Add-ons */}
                            {projectDetails.client && projectDetails.client.addons.length > 0 && (
                                    <div className="bg-purple-50 rounded-2xl border border-purple-100 p-4">
                                        <h3 className="text-sm font-bold text-purple-800 mb-2 flex items-center">
                                            <Layers className="w-4 h-4 mr-2" /> Active Add-ons
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {projectDetails.client.addons.map((addon, i) => (
                                                <span key={i} className="px-3 py-1 bg-white text-purple-600 text-xs font-semibold rounded-lg shadow-sm border border-purple-100">
                                                    {addon}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                            )}

                            {/* Detailed Task List */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Task Breakdown</h3>
                                <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                                    <div className="grid grid-cols-12 bg-gray-50 p-3 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                                        <div className="col-span-5">Task Title</div>
                                        <div className="col-span-2">Assignee</div>
                                        <div className="col-span-2">Status</div>
                                        <div className="col-span-1">Priority</div>
                                        <div className="col-span-2 text-right">Time</div>
                                    </div>
                                    <div className="divide-y divide-gray-50 max-h-60 overflow-y-auto">
                                        {projectDetails.tasks.map(task => (
                                            <div key={task.id} className="grid grid-cols-12 p-3 text-sm items-center hover:bg-gray-50 transition-colors">
                                                <div className="col-span-5 font-medium text-gray-800 truncate pr-2" title={task.title}>{task.title}</div>
                                                <div className="col-span-2 flex -space-x-1">
                                                    {task.assignees.length > 0 ? (
                                                        task.assignees.map(id => {
                                                            const m = team.find(tm => tm.id === id);
                                                            return m ? <img key={id} src={m.avatar} className="w-5 h-5 rounded-full border border-white" title={m.name} /> : null;
                                                        })
                                                    ) : <span className="text-gray-400 text-xs italic">Unassigned</span>}
                                                </div>
                                                <div className="col-span-2">
                                                    {task.isCompleted ? (
                                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium flex items-center w-fit"><CheckCircle2 className="w-3 h-3 mr-1"/> Done</span>
                                                    ) : (
                                                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">In Progress</span>
                                                    )}
                                                </div>
                                                <div className="col-span-1">
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                                                        task.priority === 'Urgent' ? 'bg-red-50 text-red-600 border-red-100' :
                                                        task.priority === 'High' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                                        'bg-gray-50 text-gray-500 border-gray-100'
                                                    }`}>{task.priority}</span>
                                                </div>
                                                <div className="col-span-2 text-right font-mono text-gray-600">
                                                    {formatTime(task.timeSpent)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default Projects;