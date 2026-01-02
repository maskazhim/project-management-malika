import React from 'react';
import { NavLink, Outlet, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  LayoutDashboard, 
  Users, 
  CheckSquare, 
  MonitorPlay, 
  Settings,
  Hexagon,
  UserPlus,
  LogOut,
  FolderOpen,
  ChevronLeft,
  ChevronRight,
  Kanban
} from 'lucide-react';
import { motion } from 'framer-motion';

const SidebarItem = ({ to, icon: Icon, label, collapsed }: { to: string, icon: any, label: string, collapsed: boolean }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <NavLink to={to} className="block mb-2" title={label}>
      <div className={`
        flex items-center px-4 py-3 rounded-xl transition-all duration-200 group
        ${isActive 
          ? 'bg-white shadow-sm text-gray-900 font-medium' 
          : 'text-gray-500 hover:bg-white/50 hover:text-gray-900'}
        ${collapsed ? 'justify-center px-2' : ''}
      `}>
        <Icon className={`w-5 h-5 ${collapsed ? '' : 'mr-3'} ${isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-500'}`} />
        {!collapsed && <span className="text-sm">{label}</span>}
      </div>
    </NavLink>
  );
};

const Layout: React.FC = () => {
  const { currentUser, logout, settings, updateSettings } = useApp();
  const navigate = useNavigate();

  if (!currentUser) {
      return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
      logout();
      navigate('/login');
  }

  const toggleSidebar = () => {
      updateSettings({ sidebarCollapsed: !settings.sidebarCollapsed });
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F5F7]">
      {/* Sidebar */}
      <motion.aside 
        animate={{ width: settings.sidebarCollapsed ? 80 : 256 }}
        className="flex flex-col h-full border-r border-gray-200/50 bg-[#F5F5F7]/50 backdrop-blur-sm p-4 relative"
      >
         <button 
            onClick={toggleSidebar}
            className="absolute -right-3 top-9 bg-white border border-gray-200 rounded-full p-1 shadow-sm text-gray-400 hover:text-indigo-600 transition-colors z-10"
         >
             {settings.sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
         </button>

        <div className={`flex items-center mb-10 px-2 ${settings.sidebarCollapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-indigo-200 shadow-lg flex-shrink-0">
            <Hexagon className="w-5 h-5 text-white" />
          </div>
          {!settings.sidebarCollapsed && <span className="text-xl font-bold text-gray-900 tracking-tight ml-3">Malika AI</span>}
        </div>

        <nav className="flex-1">
          {!settings.sidebarCollapsed && <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-4">Menu</div>}
          <SidebarItem to="/" icon={LayoutDashboard} label="Dashboard" collapsed={settings.sidebarCollapsed} />
          <SidebarItem to="/clients" icon={Users} label="Clients" collapsed={settings.sidebarCollapsed} />
          <SidebarItem to="/pipeline" icon={Kanban} label="Pipeline" collapsed={settings.sidebarCollapsed} />
          <SidebarItem to="/projects" icon={FolderOpen} label="Projects" collapsed={settings.sidebarCollapsed} />
          <SidebarItem to="/tasks" icon={CheckSquare} label="Tasks" collapsed={settings.sidebarCollapsed} />
          <SidebarItem to="/monitor" icon={MonitorPlay} label="Monitor" collapsed={settings.sidebarCollapsed} />
          <SidebarItem to="/team" icon={UserPlus} label="Team" collapsed={settings.sidebarCollapsed} />
        </nav>

        <div className="mt-auto">
          <div className="mb-4">
              <div className={`flex items-center p-2 bg-white/60 rounded-xl border border-white/50 ${settings.sidebarCollapsed ? 'justify-center' : ''}`}>
                  <img src={currentUser.avatar} alt="Profile" className="w-8 h-8 rounded-full flex-shrink-0" />
                  {!settings.sidebarCollapsed && (
                      <div className="overflow-hidden ml-3">
                          <p className="text-sm font-bold text-gray-900 truncate">{currentUser.name}</p>
                          <p className="text-xs text-gray-500 truncate">{currentUser.role}</p>
                      </div>
                  )}
              </div>
          </div>
          <SidebarItem to="/settings" icon={Settings} label="Settings" collapsed={settings.sidebarCollapsed} />
          <button 
            onClick={handleLogout}
            className={`w-full flex items-center px-4 py-3 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all ${settings.sidebarCollapsed ? 'justify-center' : ''}`}
            title="Logout"
          >
              <LogOut className={`w-5 h-5 ${settings.sidebarCollapsed ? '' : 'mr-3'}`} />
              {!settings.sidebarCollapsed && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative">
        <div className="p-8 max-w-7xl mx-auto min-h-full">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <Outlet />
            </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Layout;