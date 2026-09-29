import React from 'react';
import { 
  Database, 
  Layers, 
  GitFork, 
  Code2, 
  Award, 
  Activity, 
  MessageSquare,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab }) => {
  const navItems = [
    { id: 'connections', label: 'Database Sources', icon: Database, badge: 'Universal' },
    { id: 'studio', label: 'Data Studio (View/Clean)', icon: Sparkles, badge: 'NextGen' },
    { id: 'discovery', label: 'Estate Discovery', icon: Layers },
    { id: 'waves', label: 'Wave Planner (DAG)', icon: GitFork },
    { id: 'transpiler', label: 'Transpiler Studio', icon: Code2, badge: 'Gemini' },
    { id: 'proof', label: 'Proof Engine', icon: Award },
    { id: 'sre', label: 'Autonomic SRE', icon: Activity, badge: 'FinOps' },
    { id: 'assistant', label: 'Estate Assistant', icon: MessageSquare },
  ];

  return (
    <aside className="w-64 bg-google-surface border-r border-google-border flex flex-col justify-between shrink-0 h-[calc(100vh-3.5rem)] select-none">
      <div className="p-3 space-y-1">
        <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-gray-400 font-semibold">
          MODERNIZATION SUITE
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition ${
                isActive
                  ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 font-semibold'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-google-card'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-gray-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                  isActive ? 'bg-blue-900/60 text-blue-300' : 'bg-google-border text-gray-400'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="p-4 border-t border-google-border bg-google-dark/50 text-[11px] font-mono text-gray-400 space-y-1">
        <div className="flex items-center space-x-1.5 text-gray-300">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span className="font-semibold">Gemini 2.5 &amp; ADK Core</span>
        </div>
        <div className="text-gray-400">Apache Iceberg v2 Engine</div>
        <div className="text-gray-400 text-[10px] pt-1">Google Cloud Lakehouse Sprint</div>
      </div>
    </aside>
  );
};
