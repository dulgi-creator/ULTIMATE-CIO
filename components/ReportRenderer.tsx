import React, { useState, useMemo, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  FileText, ChevronDown, ChevronUp, AlertOctagon, BellRing, 
  Newspaper, BarChart2, Anchor, Layers, Maximize2, Minimize2, Users, Briefcase, PieChart, Image as ImageIcon
} from 'lucide-react';

interface ReportRendererProps {
  content: string;
  onDeepDive?: (topic: string) => void;
}

interface Section {
  id: string;
  title: string;
  content: string;
}

export const ReportRenderer: React.FC<ReportRendererProps> = ({ content, onDeepDive }) => {
  const [expandAll, setExpandAll] = useState(false);

  // 1. Parse Alerts, News, and Sections
  const { alertContent, newsContent, parsedSections, header } = useMemo(() => {
    let tempContent = content;
    
    // Extract Alert
    const alertRegex = /:::ALERT:::([\s\S]*?):::END_ALERT:::/;
    const alertMatch = tempContent.match(alertRegex);
    const alertContent = alertMatch ? alertMatch[1].trim() : null;
    tempContent = tempContent.replace(alertRegex, '').trim();

    // Extract News Section (Special Handling)
    // Looking for ## Latest News or ## 최신 뉴스
    const newsRegex = /^##\s*(Latest News|최신 뉴스)([\s\S]*?)(?=^##|\z)/m;
    const newsMatch = tempContent.match(newsRegex);
    const newsContent = newsMatch ? newsMatch[2].trim() : null;
    if (newsMatch) {
      tempContent = tempContent.replace(newsMatch[0], '').trim();
    }

    // Split remaining sections
    const rawSections = tempContent.split(/^## /gm);
    const header = rawSections[0];
    
    const bodySections: Section[] = rawSections.slice(1).map((sectionStr, index) => {
      const firstNewLine = sectionStr.indexOf('\n');
      if (firstNewLine === -1) return { id: `sec-${index}`, title: sectionStr, content: '' };
      
      const title = sectionStr.substring(0, firstNewLine).trim();
      const body = sectionStr.substring(firstNewLine).trim();
      return { id: `sec-${index}`, title, content: body };
    });

    return { alertContent, newsContent, parsedSections: bodySections, header };
  }, [content]);

  const handleScrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto gap-6 flex flex-col lg:flex-row items-start">
      
      {/* Left Sidebar Navigation (Desktop) */}
      <div className="hidden lg:block w-64 sticky top-24 shrink-0">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
          <div className="flex items-center gap-2 text-cyan-400 font-bold mb-4 text-sm uppercase tracking-wider">
            <Anchor size={14} /> Navigation
          </div>
          <nav className="space-y-1">
            {parsedSections.map((section) => (
              <button
                key={section.id}
                onClick={() => handleScrollTo(section.id)}
                className="block w-full text-left px-3 py-2 text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors truncate"
              >
                {section.title}
              </button>
            ))}
          </nav>
          <div className="mt-6 pt-4 border-t border-slate-800">
             <button 
               onClick={() => setExpandAll(!expandAll)}
               className="flex items-center gap-2 text-xs text-slate-500 hover:text-cyan-400 transition-colors w-full"
             >
               {expandAll ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
               {expandAll ? 'Collapse All' : 'Expand All'}
             </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full min-w-0 flex flex-col gap-6">
        
        {/* Alert Banner */}
        {alertContent && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 animate-pulse-subtle flex items-start gap-4 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
            <div className="bg-red-500 p-2 rounded-full mt-1">
              <AlertOctagon className="text-white" size={24} />
            </div>
            <div>
              <h3 className="text-red-400 font-bold text-lg flex items-center gap-2">
                CRITICAL MARKET ALERT
                <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">LIVE</span>
              </h3>
              <div className="text-red-200 mt-1 text-sm font-mono">
                {alertContent.split('|').map((line, i) => (
                  <p key={i} className="mb-1">{line.trim()}</p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* News Feed Component */}
        {newsContent && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
             <div className="bg-slate-800/80 px-4 py-3 flex items-center justify-between border-b border-slate-700">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                   <Newspaper size={18} />
                   <span>LIVE MARKET FEED</span>
                </div>
                <div className="text-xs text-slate-500 font-mono flex items-center gap-1">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                   UPDATED
                </div>
             </div>
             <div className="p-4 bg-slate-900/50">
                <MarkdownBlock text={newsContent} />
             </div>
          </div>
        )}

        <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden">
          {/* Header Info */}
          <div className="bg-slate-800/50 p-4 border-b border-slate-700 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600/20 p-2 rounded-lg">
                 <FileText className="text-blue-400" size={20} />
              </div>
              <h2 className="text-lg font-semibold text-slate-100">Investment Analysis Report</h2>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
              <BellRing size={12} className={alertContent ? "text-red-400 animate-bounce" : "text-slate-600"} />
              {alertContent ? "ALERTS ACTIVE" : "NORMAL"}
            </div>
          </div>
          
          <div className="p-6 md:p-8 text-slate-300 leading-relaxed">
            {/* Title & Meta */}
            <div className="mb-8 pb-6 border-b border-slate-800">
              <ReactMarkdown 
                components={{
                  h1: ({node, ...props}) => <h1 className="text-3xl font-bold text-white mb-2" {...props} />,
                  p: ({node, ...props}) => <p className="text-slate-400 font-mono text-sm" {...props} />
                }}
              >
                {header}
              </ReactMarkdown>
            </div>

            {/* Sections */}
            <div className="space-y-4">
              {parsedSections.map((section, idx) => (
                <CollapsibleSection 
                  key={section.id} 
                  id={section.id}
                  title={section.title} 
                  content={section.content} 
                  forceOpen={expandAll || idx === 0} // Always open summary (first)
                />
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-slate-950 p-4 border-t border-slate-800 text-center text-xs text-slate-500 font-mono">
            ULTIMATE INVESTMENT ANALYSIS v3.2 | REAL-TIME SCENARIO PLANNING
          </div>
        </div>
      </div>
    </div>
  );
};

const CollapsibleSection: React.FC<{ id: string; title: string; content: string; forceOpen?: boolean }> = ({ id, title, content, forceOpen = false }) => {
  const [isOpen, setIsOpen] = useState(forceOpen);

  useEffect(() => {
    setIsOpen(forceOpen);
  }, [forceOpen]);

  const lowerTitle = title.toLowerCase();
  const isStrategy = lowerTitle.includes('plan') || lowerTitle.includes('시나리오');
  const isSummary = lowerTitle.includes('summary') || lowerTitle.includes('요약');
  const isGeneration = lowerTitle.includes('generation') || lowerTitle.includes('세대') || lowerTitle.includes('관점');

  const getIcon = () => {
    if (isStrategy) return <Layers className="text-emerald-400" size={18} />;
    if (isSummary) return <FileText className="text-amber-400" size={18} />;
    if (isGeneration) return <Users className="text-purple-400" size={18} />;
    return <Briefcase className="text-slate-400" size={18} />;
  };

  // Custom renderer to handle [Visual: ...] and [Image: ...] tags
  const renderContent = (text: string) => {
    // Regex for Visual or Image tags
    const tagRegex = /\[(Visual|Image):\s*(.*?)\]/g;
    const parts = text.split(tagRegex);
    
    if (parts.length === 1) return <MarkdownBlock text={text} />;

    // Interleave parts with Visual components
    const matches = [...text.matchAll(tagRegex)];
    
    let currentTextIndex = 0;
    const result = [];

    // Reconstruct logic to handle matchAll which provides captured groups
    // Logic: text before match -> component -> text after...
    // Using split results is safer for interleaving.
    // Split results: [text, Type, Desc, text, Type, Desc, text...]
    
    for (let i = 0; i < parts.length; i += 3) {
      const textPart = parts[i];
      if (textPart) {
        result.push(<MarkdownBlock key={`text-${i}`} text={textPart} />);
      }

      if (i + 2 < parts.length) {
        const type = parts[i+1]; // Visual or Image
        const desc = parts[i+2];
        
        result.push(
          <div key={`visual-${i}`} className="my-6 bg-slate-800/50 border border-slate-700 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center group hover:bg-slate-800 transition-colors shadow-lg">
            <div className="bg-slate-700 p-3 rounded-full mb-3 group-hover:bg-slate-600">
              {type === 'Image' ? <ImageIcon className="text-emerald-400" size={24} /> : <BarChart2 className="text-cyan-400" size={24} />}
            </div>
            <span className="text-xs text-cyan-500 font-mono uppercase mb-1">
              {type === 'Image' ? 'News Image Source' : 'Generated Visual Representation'}
            </span>
            <p className="text-slate-300 font-medium italic">"{desc}"</p>
          </div>
        );
      }
    }
    return result;
  };

  return (
    <div id={id} className={`border rounded-xl transition-all duration-300 ${isOpen ? 'bg-slate-800/20 border-slate-700 shadow-sm' : 'bg-transparent border-slate-800 hover:border-slate-700'}`}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left focus:outline-none group"
      >
        <div className="flex items-center gap-3">
          {getIcon()}
          <h3 className={`font-semibold text-lg transition-colors ${isStrategy ? 'text-emerald-400' : (isOpen ? 'text-white' : 'text-slate-300 group-hover:text-white')}`}>
            {title}
          </h3>
        </div>
        <div className={`transition-transform duration-200 text-slate-500 group-hover:text-slate-300 ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDown />
        </div>
      </button>
      
      {isOpen && (
        <div className="px-4 pb-6 pt-0 text-slate-300 border-t border-slate-800/50 mt-2 animate-fade-in">
          {renderContent(content)}
        </div>
      )}
    </div>
  );
};

const MarkdownBlock: React.FC<{ text: string }> = ({ text }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h3: ({node, ...props}) => <h4 className="text-md font-medium text-slate-100 mb-2 mt-6 border-l-2 border-cyan-500 pl-3" {...props} />,
        h4: ({node, ...props}) => <h5 className="text-sm font-bold text-slate-200 mb-1 mt-4" {...props} />,
        p: ({node, ...props}) => <p className="mb-4 leading-7 text-slate-300/90" {...props} />,
        ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-4 space-y-2 marker:text-cyan-600" {...props} />,
        ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-4 space-y-2 marker:text-cyan-600" {...props} />,
        li: ({node, ...props}) => <li className="pl-1" {...props} />,
        blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-amber-500/50 pl-4 py-2 my-6 bg-amber-500/5 rounded-r text-amber-200/80 italic" {...props} />,
        strong: ({node, ...props}) => <strong className="text-white font-semibold" {...props} />,
        a: ({node, ...props}) => <a className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2" {...props} />,
        code: ({node, ...props}) => <code className="bg-slate-950 px-1.5 py-0.5 rounded text-sm font-mono text-emerald-300 border border-slate-800" {...props} />,
        img: ({node, ...props}) => <img className="rounded-2xl shadow-lg my-4 border border-slate-700" {...props} />,
        table: ({node, ...props}) => <div className="overflow-x-auto my-6 rounded-lg border border-slate-700 shadow-inner bg-slate-900/50"><table className="w-full text-sm text-left" {...props} /></div>,
        thead: ({node, ...props}) => <thead className="bg-slate-800 text-slate-200 uppercase font-mono" {...props} />,
        th: ({node, ...props}) => <th className="px-4 py-3 font-medium border-b border-slate-700" {...props} />,
        td: ({node, ...props}) => <td className="px-4 py-3 border-b border-slate-700/50" {...props} />,
      }}
    >
      {text}
    </ReactMarkdown>
  );
};