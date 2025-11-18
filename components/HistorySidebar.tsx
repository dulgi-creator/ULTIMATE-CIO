import React from 'react';
import { X, Trash2, FileText, Newspaper, Zap, BookOpen, ChevronRight } from 'lucide-react';
import { SavedReport, AnalysisMode } from '../types';

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  savedReports: SavedReport[];
  onSelectReport: (report: SavedReport) => void;
  onDeleteReport: (id: string) => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({
  isOpen,
  onClose,
  savedReports,
  onSelectReport,
  onDeleteReport
}) => {
  const getIcon = (mode: AnalysisMode) => {
    switch (mode) {
      case AnalysisMode.DEEP_DIVE: return <BookOpen size={14} className="text-cyan-400" />;
      case AnalysisMode.QUICK_INTEL: return <Zap size={14} className="text-amber-400" />;
      case AnalysisMode.NEWS: return <Newspaper size={14} className="text-emerald-400" />;
      default: return <FileText size={14} className="text-slate-400" />;
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <div className={`fixed top-0 left-0 h-full w-80 bg-slate-950 border-r border-slate-800 shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          
          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
            <h2 className="text-slate-200 font-bold flex items-center gap-2">
              <FileText size={18} className="text-cyan-500" />
              저장된 리포트
            </h2>
            <button 
              onClick={onClose}
              className="p-1 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {savedReports.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-sm">
                저장된 리포트가 없습니다.
              </div>
            ) : (
              savedReports.map((report) => (
                <div 
                  key={report.id}
                  className="group relative bg-slate-900/50 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-lg p-3 transition-all cursor-pointer"
                  onClick={() => onSelectReport(report)}
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                      {getIcon(report.mode)}
                      <span className="truncate max-w-[180px]">{report.title}</span>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteReport(report.id);
                      }}
                      className="text-slate-600 hover:text-red-400 transition-colors p-1 opacity-0 group-hover:opacity-100"
                      title="삭제"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between">
                    <span>{new Date(report.date).toLocaleDateString()} {new Date(report.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    <ChevronRight size={12} className="text-slate-700 group-hover:text-cyan-500 transition-colors" />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-slate-800 bg-slate-900/30 text-[10px] text-slate-600 text-center">
            자동 저장 활성화됨
          </div>
        </div>
      </div>
    </>
  );
};