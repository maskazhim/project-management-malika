import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { GlassCard } from '../components/ui/GlassCard';
import { WORKFLOW_SEQUENCE, STATUS_COLORS } from '../constants';
import { ClientStatus } from '../types';
import { formatTime } from '../utils/formatTime';
import { Calendar, User, BarChart3, AlertCircle, Layers, ArrowUpRight, CheckCircle2 } from 'lucide-react';

const Pipeline: React.FC = () => {
  const { tasks, projects, clients, team, currentUser } = useApp();

  // 1. Calculate Pipeline Stats
  const stats = useMemo(() => {
    // Only count stages defined in WORKFLOW_SEQUENCE (Actual Pipeline)
    const pipelineStages = WORKFLOW_SEQUENCE.map(w => w.stage);
    
    let totalInPipeline = 0;
    const stageCounts: Record<string, number> = {};
    let maxCount = 0;
    let bottleneckStage = '';

    pipelineStages.forEach(stage => {
        const count = clients.filter(c => c.status === stage).length;
        stageCounts[stage] = count;
        totalInPipeline += count;

        if (count > maxCount) {
            maxCount = count;
            bottleneckStage = stage;
        }
    });

    const activeClients = clients.filter(c => c.status === ClientStatus.Active).length;
    const dropClients = clients.filter(c => c.status === ClientStatus.Drop).length;

    return { totalInPipeline, stageCounts, bottleneckStage, activeClients, dropClients };
  }, [clients]);

  // 2. Prepare Columns: Workflow Sequence + Active Phase
  const columns = [
    ...WORKFLOW_SEQUENCE.map(s => ({ id: s.stage, title: s.stage, color: STATUS_COLORS[s.stage] })),
    { id: ClientStatus.Active, title: 'Active / Maintenance', color: STATUS_COLORS[ClientStatus.Active] }
  ];

  const getClient = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project || !project.clientId) return null;
    return clients.find(c => c.id === project.clientId);
  };

  const getAssignees = (memberIds: string[]) => {
    return team.filter(t => memberIds.includes(t.id));
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Workflow Pipeline</h1>
            <p className="text-gray-500 mt-1">Real-time visualization of client onboarding progress.</p>
        </div>
      </div>

      {/* Mini Dashboard - Redesigned */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Card 1: Volume */}
          <GlassCard className="relative overflow-hidden p-6 flex flex-col justify-between h-36 bg-white/40 backdrop-blur-xl border-white/60 group hover:bg-white/60 transition-colors">
              <div className="flex justify-between items-start">
                  <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">In Pipeline</p>
                      <h3 className="text-4xl font-bold text-gray-900 tracking-tight">{stats.totalInPipeline}</h3>
                  </div>
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                       <Layers className="w-6 h-6" />
                  </div>
              </div>
              <div className="flex items-center text-xs font-medium text-green-600 bg-green-50 w-fit px-2 py-1 rounded-lg">
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                  <span>Processing Active</span>
              </div>
          </GlassCard>

          {/* Card 2: Pipeline Health - Success Rate & Distribution */}
          <GlassCard className="p-6 flex flex-col justify-between h-36 bg-white/40 backdrop-blur-xl border-white/60 group hover:bg-white/60 transition-colors">
              <div className="flex justify-between items-start">
                  <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <BarChart3 className="w-3 h-3" /> Pipeline Health
                      </p>
                      <div className="flex items-baseline gap-2">
                          <h3 className="text-3xl font-bold text-gray-900 tracking-tight">
                              {Math.round((stats.activeClients / (stats.activeClients + stats.dropClients || 1)) * 100)}%
                          </h3>
                          <span className="text-xs font-medium text-gray-500">Success Rate</span>
                      </div>
                  </div>
                  <div className="p-2 bg-green-50 text-green-600 rounded-lg shadow-sm">
                      <CheckCircle2 className="w-5 h-5" />
                  </div>
              </div>
              
              <div className="space-y-2 mt-auto">
                  <div className="flex w-full h-2.5 rounded-full overflow-hidden bg-gray-100/80 shadow-inner">
                      {WORKFLOW_SEQUENCE.map((seq, idx) => {
                          const count = stats.stageCounts[seq.stage] || 0;
                          const width = (count / (stats.totalInPipeline || 1)) * 100;
                          
                          // Consistent sophisticated palette
                          const colors = [
                              'bg-indigo-300', 'bg-indigo-400', 'bg-indigo-500', 
                              'bg-violet-400', 'bg-violet-500', 'bg-purple-400', 
                              'bg-purple-500', 'bg-fuchsia-400'
                          ];
                          const colorClass = colors[idx % colors.length];

                          return width > 0 ? (
                              <div 
                                key={seq.stage} 
                                style={{ width: `${width}%` }} 
                                className={`h-full ${colorClass} relative group/segment cursor-help`}
                              >
                                   <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover/segment:block bg-gray-800 text-white text-[10px] font-medium px-2 py-1 rounded shadow-xl whitespace-nowrap z-20 pointer-events-none">
                                      {seq.stage}: {count}
                                  </div>
                              </div>
                          ) : null;
                      })}
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-400 font-medium">
                      <span>Pipeline ({stats.totalInPipeline})</span>
                      <span>Active ({stats.activeClients})</span>
                  </div>
              </div>
          </GlassCard>

          {/* Card 3: Bottleneck */}
          <GlassCard className="p-6 flex flex-col justify-between h-36 bg-white/40 backdrop-blur-xl border-white/60 group hover:bg-white/60 transition-colors">
               <div className="flex justify-between items-start">
                  <div className="overflow-hidden">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Attention Needed</p>
                      <h3 className="text-xl font-bold text-gray-900 truncate pr-2" title={stats.bottleneckStage || "Smooth Flow"}>
                        {stats.bottleneckStage || "All Good"}
                      </h3>
                  </div>
                  <div className={`p-3 rounded-xl shadow-sm transition-transform group-hover:rotate-12 ${stats.bottleneckStage ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'}`}>
                       <AlertCircle className="w-6 h-6" />
                  </div>
              </div>
               <div className="flex items-center text-xs mt-auto">
                  {stats.bottleneckStage ? (
                      <div className="bg-orange-50 text-orange-700 px-3 py-1.5 rounded-lg border border-orange-100 w-full text-center font-medium">
                          {stats.stageCounts[stats.bottleneckStage]} clients stalling here
                      </div>
                  ) : (
                      <div className="bg-green-50 text-green-700 px-3 py-1.5 rounded-lg border border-green-100 w-full text-center font-medium">
                          Pipeline flowing efficiently
                      </div>
                  )}
              </div>
          </GlassCard>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex space-x-6 min-w-max h-full">
          {columns.map(col => {
            // Filter Tasks belonging to clients in this specific stage
            const tasksInStage = tasks.filter(task => {
                if (task.isCompleted) return false; 
                const client = getClient(task.projectId);
                return client?.status === col.id;
            });

            return (
              <div key={col.id} className="w-[350px] flex flex-col h-full">
                {/* Column Header */}
                <div className={`p-4 rounded-2xl border mb-4 flex justify-between items-center bg-white/60 border-gray-200/60 shadow-sm backdrop-blur-md sticky top-0 z-10`}>
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className={`w-2.5 h-2.5 rounded-full shadow-sm flex-shrink-0 ${col.color.split(' ')[0].replace('bg-', 'bg-')}`}></div>
                    <span className="font-bold text-gray-800 text-sm truncate" title={col.title}>{col.title}</span>
                  </div>
                  <span className="bg-white px-2.5 py-1 rounded-md text-xs font-bold text-gray-600 border border-gray-100 shadow-sm">
                    {tasksInStage.length}
                  </span>
                </div>

                {/* Tasks List */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-hide pb-10">
                  {tasksInStage.map(task => {
                    const client = getClient(task.projectId);
                    const assignees = getAssignees(task.assignees);
                    const isMySessionActive = currentUser && task.activeUserIds.includes(currentUser.id);

                    return (
                      <GlassCard key={task.id} className={`p-4 group border-l-[3px] transition-all hover:-translate-y-1 hover:shadow-md ${isMySessionActive ? 'border-l-green-500 bg-green-50/40' : 'border-l-transparent hover:border-l-indigo-500'}`}>
                        <div className="flex justify-between items-start mb-3">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 truncate max-w-[150px]" title={client?.businessName}>
                                {client?.businessName || "Unknown Client"}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${
                                task.priority === 'Urgent' ? 'bg-red-50 text-red-600 border-red-100' :
                                task.priority === 'High' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                'bg-gray-50 text-gray-500 border-gray-100'
                            }`}>
                                {task.priority}
                            </span>
                        </div>

                        <h4 className="text-sm font-bold text-gray-900 mb-3 leading-snug">{task.title}</h4>

                        {/* Subtasks Progress Bar */}
                        {task.subtasks.length > 0 && (
                            <div className="mb-4">
                                <div className="flex justify-between text-[10px] text-gray-500 mb-1.5">
                                    <span className="font-medium">Checklist</span>
                                    <span>{task.completionPercentage}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${task.completionPercentage}%` }}></div>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between items-end pt-3 border-t border-gray-100/60">
                            <div className="flex -space-x-2.5">
                                {assignees.length > 0 ? assignees.map(m => (
                                    <img key={m.id} src={m.avatar} className="w-7 h-7 rounded-full border-2 border-white shadow-sm" title={m.name} />
                                )) : (
                                    <div className="w-7 h-7 rounded-full bg-gray-50 border border-dashed border-gray-300 flex items-center justify-center text-gray-400">
                                        <User className="w-3 h-3" />
                                    </div>
                                )}
                            </div>
                            
                            <div className="text-right">
                                <div className="flex items-center justify-end text-[10px] text-gray-400 mb-0.5 font-medium">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    {new Date(task.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </div>
                                <div className={`font-mono text-xs ${isMySessionActive ? 'text-green-600 font-bold' : 'text-gray-500'}`}>
                                    {formatTime(task.timeSpent)}
                                </div>
                            </div>
                        </div>
                      </GlassCard>
                    );
                  })}
                  {tasksInStage.length === 0 && (
                      <div className="text-center py-10 opacity-40">
                          <p className="text-xs text-gray-400 italic font-medium">No active tasks</p>
                      </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Pipeline;