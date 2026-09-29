import React, { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DatabaseSourcesView } from './views/DatabaseSourcesView';
import { DataStudioView } from './views/DataStudioView';
import { EstateDiscoveryView } from './views/EstateDiscoveryView';
import { WavePlannerView } from './views/WavePlannerView';
import { TranspilerStudioView } from './views/TranspilerStudioView';
import { ProofEngineView } from './views/ProofEngineView';
import { DayTwoSREView } from './views/DayTwoSREView';
import { EstateAssistantView } from './views/EstateAssistantView';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('studio');

  const renderActiveView = () => {
    switch (activeTab) {
      case 'connections':
        return <DatabaseSourcesView onModernize={() => setActiveTab('studio')} />;
      case 'studio':
        return <DataStudioView />;
      case 'discovery':
        return <EstateDiscoveryView />;
      case 'waves':
        return <WavePlannerView />;
      case 'transpiler':
        return <TranspilerStudioView />;
      case 'proof':
        return <ProofEngineView />;
      case 'sre':
        return <DayTwoSREView />;
      case 'assistant':
        return <EstateAssistantView />;
      default:
        return <DataStudioView />;
    }
  };

  return (
    <div className="min-h-screen bg-google-dark text-gray-100 flex flex-col font-sans">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar activeTab={activeTab} onSelectTab={setActiveTab} />
        <main className="flex-1 overflow-y-auto p-6 max-w-7xl mx-auto w-full">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
};

export default App;
