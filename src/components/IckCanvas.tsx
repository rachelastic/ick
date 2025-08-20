"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Zap, AlertTriangle, ThumbsDown, Eye, Maximize2, Minimize2, RotateCcw, Filter, Loader2 } from "lucide-react";

type IckType = {
  id: number;
  content: string;
  severity: number | "low" | "medium" | "high";
  sentiment?: string;
  tags?: string[];
  createdAt?: string;
};

const RevampedIckCanvas = () => {
  const [icks, setIcks] = useState<IckType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIck, setSelectedIck] = useState<IckType | null>(null);
  const [viewMode, setViewMode] = useState<'gravity' | 'cluster' | 'timeline'>('gravity');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [filterBySeverity, setFilterBySeverity] = useState<string | null>(null);
  const [hoveredIck, setHoveredIck] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const fetchIcks = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch("/api/icks");
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Ensure data is always an array and validate items
        const icksArray = Array.isArray(data) ? data : [];
        const validIcks = icksArray.filter(ick => 
          ick && 
          typeof ick.id === 'number' && 
          typeof ick.content === 'string'
        ).map(ick => ({
          ...ick,
          tags: Array.isArray(ick.tags) ? ick.tags : [],
          sentiment: ick.sentiment || 'neutral',
          severity: ick.severity || 5,
          createdAt: ick.createdAt || new Date().toISOString()
        }));
        
        setIcks(validIcks);
      } catch (err) {
        console.error("Failed to fetch icks:", err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
        setIcks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchIcks();
  }, []);

  const normalizeSeverity = (severity: number | string): number => {
    if (typeof severity === 'number') return Math.max(1, Math.min(10, severity));
    switch (severity) {
      case 'high': return 8;
      case 'medium': return 5;
      case 'low': return 2;
      default: return 5;
    }
  };

  const getSeverityColor = (severity: number) => {
    if (severity >= 8) return { bg: 'from-red-400 to-red-600', border: 'border-red-300', text: 'text-white' };
    if (severity >= 6) return { bg: 'from-orange-400 to-orange-600', border: 'border-orange-300', text: 'text-white' };
    return { bg: 'from-yellow-400 to-yellow-600', border: 'border-yellow-300', text: 'text-white' };
  };

  const getSentimentIcon = (sentiment: string) => {
    switch(sentiment) {
      case 'gross': return <ThumbsDown className="w-3 h-3" />;
      case 'no way': return <AlertTriangle className="w-3 h-3" />;
      case 'acceptable': return <Eye className="w-3 h-3" />;
      default: return <Zap className="w-3 h-3" />;
    }
  };

  const getIckSize = (severity: number) => {
    const baseSize = 120;
    const sizeMultiplier = (severity / 10) * 0.8 + 0.6; // Scale from 0.6x to 1.4x
    return baseSize * sizeMultiplier;
  };

  const getPositionByMode = useCallback((ick: IckType, index: number, containerWidth: number, containerHeight: number) => {
    const severity = normalizeSeverity(ick.severity);
    
    switch (viewMode) {
      case 'gravity': {
        // High severity items gravitate to center, lower ones spread out
        const centerX = containerWidth / 2;
        const centerY = containerHeight / 2;
        const gravityStrength = severity / 10;
        const angle = (index * 137.5) % 360; // Golden angle for spiral distribution
        const distance = (1 - gravityStrength) * Math.min(containerWidth, containerHeight) * 0.3;
        
        return {
          x: centerX + Math.cos(angle * Math.PI / 180) * distance + (Math.random() - 0.5) * 100,
          y: centerY + Math.sin(angle * Math.PI / 180) * distance + (Math.random() - 0.5) * 100
        };
      }
      
      case 'cluster': {
        // Cluster by sentiment
        const clusters = { 'gross': 0, 'no way': 1, 'acceptable': 2, undefined: 3 };
        const clusterIndex = clusters[ick.sentiment as keyof typeof clusters] || 3;
        const clustersPerRow = 2;
        const clusterX = (clusterIndex % clustersPerRow) * (containerWidth / clustersPerRow) + containerWidth / (clustersPerRow * 2);
        const clusterY = Math.floor(clusterIndex / clustersPerRow) * (containerHeight / 2) + containerHeight / 4;
        
        return {
          x: clusterX + (Math.random() - 0.5) * 200,
          y: clusterY + (Math.random() - 0.5) * 150
        };
      }
      
      case 'timeline': {
        // Arrange by creation date
        const sortedIcks = [...icks].sort((a, b) => 
          new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
        );
        const ickIndex = sortedIcks.findIndex(i => i.id === ick.id);
        const xPosition = (ickIndex / Math.max(sortedIcks.length - 1, 1)) * (containerWidth - 200) + 100;
        
        return {
          x: xPosition,
          y: containerHeight / 2 + (Math.random() - 0.5) * 200 + Math.sin(ickIndex * 0.5) * 100
        };
      }
      
      default:
        return { x: Math.random() * (containerWidth - 200) + 100, y: Math.random() * (containerHeight - 200) + 100 };
    }
  }, [viewMode, icks]);

  const filteredIcks = Array.isArray(icks) && filterBySeverity 
    ? icks.filter(ick => {
        const severity = normalizeSeverity(ick.severity);
        switch(filterBySeverity) {
          case 'high': return severity >= 8;
          case 'medium': return severity >= 6 && severity < 8;
          case 'low': return severity < 6;
          default: return true;
        }
      })
    : icks;

  const reshufflePositions = () => {
    // Force re-render by updating a state that triggers position recalculation
    setIcks(prev => [...prev]);
  };

  // Loading state
  if (loading) {
    return (
      <div className="relative bg-gradient-to-br from-slate-50 via-orange-50 to-pink-50 border border-slate-200 rounded-2xl overflow-hidden shadow-lg w-full h-[600px] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-slate-600 font-semibold">Loading icks...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="relative bg-gradient-to-br from-slate-50 via-orange-50 to-pink-50 border border-slate-200 rounded-2xl overflow-hidden shadow-lg w-full h-[600px] flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Canvas Error</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (!Array.isArray(icks) || icks.length === 0) {
    return (
      <div className="relative bg-gradient-to-br from-slate-50 via-orange-50 to-pink-50 border border-slate-200 rounded-2xl overflow-hidden shadow-lg w-full h-[600px] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🤔</div>
          <h3 className="text-lg font-semibold text-slate-600 mb-2">No Icks to Display</h3>
          <p className="text-slate-500">Share your first ick to see the canvas come to life!</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-gradient-to-br from-slate-50 via-orange-50 to-pink-50 border border-slate-200 rounded-2xl overflow-hidden shadow-lg ${isFullscreen ? 'fixed inset-4 z-50' : 'w-full h-[600px]'}`}>
      
      {/* Controls */}
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('gravity')}
            className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
              viewMode === 'gravity' 
                ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg' 
                : 'bg-white/80 text-slate-700 hover:bg-white'
            }`}
          >
            🌍 Gravity
          </button>
          <button
            onClick={() => setViewMode('cluster')}
            className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
              viewMode === 'cluster' 
                ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg' 
                : 'bg-white/80 text-slate-700 hover:bg-white'
            }`}
          >
            🎯 Cluster
          </button>
          <button
            onClick={() => setViewMode('timeline')}
            className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
              viewMode === 'timeline' 
                ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg' 
                : 'bg-white/80 text-slate-700 hover:bg-white'
            }`}
          >
            📅 Timeline
          </button>
        </div>
        
        <div className="flex gap-2">
          <select
            value={filterBySeverity || ''}
            onChange={(e) => setFilterBySeverity(e.target.value || null)}
            className="px-3 py-2 rounded-lg text-sm font-semibold bg-white/80 border border-slate-200 focus:outline-none focus:border-orange-400"
          >
            <option value="">All Severity</option>
            <option value="high">High (8-10)</option>
            <option value="medium">Medium (6-7)</option>
            <option value="low">Low (1-5)</option>
          </select>
          
          <button
            onClick={reshufflePositions}
            className="p-2 bg-white/80 text-slate-700 rounded-lg hover:bg-white transition-all"
            title="Reshuffle positions"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 bg-white/80 text-slate-700 rounded-lg hover:bg-white transition-all"
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div 
        ref={containerRef} 
        className="relative w-full h-full overflow-hidden cursor-pointer"
        onClick={() => setSelectedIck(null)}
      >
        {/* Floating background particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-orange-300/30 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>

        {/* ICK Bubbles */}
        {Array.isArray(filteredIcks) && filteredIcks.map((ick, index) => {
          const severity = normalizeSeverity(ick.severity);
          const size = getIckSize(severity);
          const colors = getSeverityColor(severity);
          const containerRect = containerRef.current?.getBoundingClientRect();
          const containerWidth = containerRect?.width || 800;
          const containerHeight = containerRect?.height || 600;
          const position = getPositionByMode(ick, index, containerWidth, containerHeight);
          
          const isHovered = hoveredIck === ick.id;
          const isSelected = selectedIck?.id === ick.id;
          
          return (
            <div
              key={ick.id}
              className={`absolute rounded-full bg-gradient-to-br ${colors.bg} ${colors.border} border-2 shadow-lg cursor-pointer transition-all duration-500 flex items-center justify-center text-center ${colors.text} font-semibold hover:scale-110 hover:shadow-xl ${isSelected ? 'ring-4 ring-orange-400 ring-opacity-50 scale-110' : ''} ${isHovered ? 'z-20' : 'z-10'}`}
              style={{
                width: `${size}px`,
                height: `${size}px`,
                left: `${Math.max(0, Math.min(position.x, containerWidth - size))}px`,
                top: `${Math.max(0, Math.min(position.y, containerHeight - size))}px`,
                fontSize: `${Math.max(10, size * 0.12)}px`,
                lineHeight: '1.2',
                transform: isHovered ? 'scale(1.15)' : 'scale(1)',
                zIndex: isSelected ? 30 : (isHovered ? 20 : 10)
              }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIck(selectedIck?.id === ick.id ? null : ick);
              }}
              onMouseEnter={() => setHoveredIck(ick.id)}
              onMouseLeave={() => setHoveredIck(null)}
              title={ick.content}
            >
              <div className="p-3 text-center">
                <div className="flex items-center justify-center mb-1">
                  {getSentimentIcon(ick.sentiment || '')}
                  <span className="ml-1 text-xs font-bold">{severity}</span>
                </div>
                <div className="leading-tight">
                  {ick.content.length > 30 ? `${ick.content.substring(0, 30)}...` : ick.content}
                </div>
              </div>
              
              {/* Pulse animation for high severity */}
              {severity >= 8 && (
                <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${colors.bg} opacity-30 animate-ping`} />
              )}
            </div>
          );
        })}

        {/* Mode-specific overlays */}
        {viewMode === 'cluster' && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Cluster labels */}
            <div className="absolute top-20 left-1/4 transform -translate-x-1/2 bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
              😤 Gross
            </div>
            <div className="absolute top-20 right-1/4 transform translate-x-1/2 bg-red-200 text-red-900 px-3 py-1 rounded-full text-sm font-semibold">
              🚫 No Way
            </div>
            <div className="absolute bottom-20 left-1/4 transform -translate-x-1/2 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">
              😐 Acceptable
            </div>
            <div className="absolute bottom-20 right-1/4 transform translate-x-1/2 bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-semibold">
              🤔 Other
            </div>
          </div>
        )}

        {viewMode === 'timeline' && (
          <div className="absolute bottom-4 left-4 right-4 h-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-50" />
        )}
      </div>

      {/* Selected ICK Details */}
      {selectedIck && (
        <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-2xl p-4 border border-slate-200 shadow-xl z-40">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r ${getSeverityColor(normalizeSeverity(selectedIck.severity)).bg} text-white text-sm font-semibold`}>
                  {getSentimentIcon(selectedIck.sentiment || '')}
                  <span>{normalizeSeverity(selectedIck.severity)}/10</span>
                </div>
                <span className="text-sm text-slate-500 capitalize">{selectedIck.sentiment}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">{selectedIck.content}</h3>
              {selectedIck.tags && Array.isArray(selectedIck.tags) && selectedIck.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {selectedIck.tags.map(tag => (
                    <span key={tag} className="bg-slate-100 text-slate-600 px-2 py-1 rounded-full text-xs">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              {selectedIck.createdAt && (
                <p className="text-xs text-slate-500">
                  Submitted {new Date(selectedIck.createdAt).toLocaleDateString()}
                </p>
              )}
            </div>
            <button
              onClick={() => setSelectedIck(null)}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute top-16 right-4 bg-white/90 backdrop-blur-sm rounded-xl p-3 border border-slate-200 shadow-lg z-10">
        <h4 className="text-xs font-bold text-slate-600 mb-2">Severity Scale</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-red-400 to-red-600"></div>
            <span>High (8-10)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-orange-400 to-orange-600"></div>
            <span>Medium (6-7)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600"></div>
            <span>Low (1-5)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevampedIckCanvas;