"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import IckCanvas from "@/components/IckCanvas";
import {
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  Calendar,
  Lightbulb,
  ArrowRight,
  Filter,
  BarChart3,
  TrendingUp,
  Tag,
  Loader2,
} from "lucide-react";

type IckType = {
  id: number;
  content: string;
  tags: string[];
  sentiment: string;
  severity: number;
  createdAt: string;
};

export default function Insights() {
  const [icks, setIcks] = useState<IckType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSentiment, setSelectedSentiment] = useState<string | null>(
    null
  );
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

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
        
        // Ensure data is always an array
        const icksArray = Array.isArray(data) ? data : [];
        
        // Validate and clean the data
        const validIcks = icksArray.filter(ick => 
          ick && 
          typeof ick.id === 'number' && 
          typeof ick.content === 'string' &&
          Array.isArray(ick.tags)
        ).map(ick => ({
          ...ick,
          tags: ick.tags || [],
          sentiment: ick.sentiment || 'neutral',
          severity: typeof ick.severity === 'number' ? ick.severity : 5,
          createdAt: ick.createdAt || new Date().toISOString()
        }));
        
        setIcks(validIcks);
      } catch (err) {
        console.error("Failed to fetch icks:", err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
        setIcks([]); // Ensure icks is always an array
      } finally {
        setLoading(false);
      }
    };

    fetchIcks();
  }, []);

  // Safe filtering with array checks
  const filteredIcks = Array.isArray(icks) ? icks.filter((ick) => {
    const matchSentiment =
      !selectedSentiment || ick.sentiment === selectedSentiment;
    const matchTag = !selectedTag || (Array.isArray(ick.tags) && ick.tags.includes(selectedTag));
    return matchSentiment && matchTag;
  }) : [];

  // Safe tag extraction
  const tags = Array.isArray(icks) 
    ? Array.from(new Set(icks.flatMap((ick) => Array.isArray(ick.tags) ? ick.tags : [])))
    : [];

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "gross":
        return <ThumbsDown className="w-4 h-4" />;
      case "no way":
        return <AlertTriangle className="w-4 h-4" />;
      case "acceptable":
        return <ThumbsUp className="w-4 h-4" />;
      default:
        return <Lightbulb className="w-4 h-4" />;
    }
  };

  const getSentimentGradient = (sentiment: string) => {
    switch (sentiment) {
      case "gross":
        return "from-orange-400 to-red-500";
      case "no way":
        return "from-red-500 to-red-600";
      case "acceptable":
        return "from-yellow-400 to-orange-500";
      default:
        return "from-gray-400 to-gray-500";
    }
  };

  const highSeverityCount = Array.isArray(icks) 
    ? icks.filter((ick) => typeof ick.severity === 'number' && ick.severity >= 8).length 
    : 0;
    
  const todayCount = Array.isArray(icks) ? icks.filter(
    (ick) =>
      ick.createdAt && new Date(ick.createdAt).toDateString() === new Date().toDateString()
  ).length : 0;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-pink-50 relative">
        <div className="relative z-10 max-w-7xl mx-auto p-6 space-y-10">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-black mb-4 tracking-tight">
              <span className="bg-gradient-to-r from-red-500 via-orange-500 to-pink-500 bg-clip-text text-transparent">
                ICK
              </span>{" "}
              <span className="text-slate-800">Insights</span>
            </h1>
            <div className="flex items-center justify-center gap-3 text-xl text-slate-600">
              <Loader2 className="w-6 h-6 animate-spin" />
              Loading insights...
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-pink-50 relative">
        <div className="relative z-10 max-w-7xl mx-auto p-6 space-y-10">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-black mb-4 tracking-tight">
              <span className="bg-gradient-to-r from-red-500 via-orange-500 to-pink-500 bg-clip-text text-transparent">
                ICK
              </span>{" "}
              <span className="text-slate-800">Insights</span>
            </h1>
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 max-w-md mx-auto">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-800 mb-2">Oops! Something went wrong</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-pink-50 relative">
      {/* Floating emojis/icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {["💡", "💰", "🚀", "⚡", "🔥", "💎", "🎯", "✨"].map((icon, i) => (
          <div
            key={i}
            className="absolute animate-bounce text-2xl opacity-10"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.8}s`,
              animationDuration: `${4 + Math.random() * 3}s`,
            }}
          >
            {icon}
          </div>
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-6 space-y-10">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-black mb-4 tracking-tight">
            <span className="bg-gradient-to-r from-red-500 via-orange-500 to-pink-500 bg-clip-text text-transparent">
              ICK
            </span>{" "}
            <span className="text-slate-800">Insights</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Explore the goldmine of human frustrations. Discover patterns,
            trends, and hidden opportunities.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-gradient-to-r from-orange-400 to-orange-600 p-2 rounded-lg">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-semibold text-slate-600">
                Total Icks
              </span>
            </div>
            <div className="text-3xl font-black text-slate-800">
              {icks.length}
            </div>
            <div className="text-xs text-slate-500">Raw opportunities</div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-gradient-to-r from-red-400 to-red-600 p-2 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-semibold text-slate-600">
                High Severity
              </span>
            </div>
            <div className="text-3xl font-black text-slate-800">
              {highSeverityCount}
            </div>
            <div className="text-xs text-slate-500">Prime targets</div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-gradient-to-r from-purple-400 to-purple-600 p-2 rounded-lg">
                <Tag className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-semibold text-slate-600">
                Categories
              </span>
            </div>
            <div className="text-3xl font-black text-slate-800">
              {tags.length}
            </div>
            <div className="text-xs text-slate-500">Market segments</div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-gradient-to-r from-green-400 to-green-600 p-2 rounded-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-semibold text-slate-600">
                Today
              </span>
            </div>
            <div className="text-3xl font-black text-slate-800">
              {todayCount}
            </div>
            <div className="text-xs text-slate-500">Fresh insights</div>
          </div>
        </div>

        {/* Show empty state if no icks */}
        {icks.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200 shadow-lg max-w-md mx-auto">
              <Lightbulb className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-600 mb-2">No Icks Yet</h3>
              <p className="text-slate-500">Be the first to share what's bothering you!</p>
            </div>
          </div>
        ) : (
          <>
            {/* Sentiment Filters */}
            <div className="flex flex-wrap gap-4 mb-6 justify-center">
              {["gross", "acceptable", "no way"].map((sentiment) => (
                <button
                  key={sentiment}
                  onClick={() =>
                    setSelectedSentiment((prev) =>
                      prev === sentiment ? null : sentiment
                    )
                  }
                  className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition ${
                    selectedSentiment === sentiment
                      ? `bg-gradient-to-r ${getSentimentGradient(
                          sentiment
                        )} text-white shadow-lg`
                      : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                  }`}
                >
                  {getSentimentIcon(sentiment)}
                  {sentiment}
                </button>
              ))}
              <button
                className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition"
                onClick={() => setSelectedSentiment(null)}
              >
                Surprise me
              </button>
            </div>

            {/* Featured Icks / Canvas */}
            <section className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-800">What's popping?</h2>
              <IckCanvas />
              <h2 className="text-2xl font-bold text-slate-800">
                Outstanding Icks
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {filteredIcks
                  .sort(
                    (a, b) =>
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime()
                  )
                  .slice(0, 3)
                  .map((ick) => (
                    <div
                      key={ick.id}
                      className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-200 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer"
                    >
                      <div
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r ${getSentimentGradient(
                          ick.sentiment
                        )} text-white text-sm font-semibold mb-3`}
                      >
                        {getSentimentIcon(ick.sentiment)}
                        <span className="capitalize">{ick.sentiment}</span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 mb-2">
                        {ick.content}
                      </h3>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {Array.isArray(ick.tags) && ick.tags.map((tag) => (
                          <span
                            key={tag}
                            className="bg-white/30 px-2 py-1 rounded-full text-xs font-medium hover:bg-orange-100 hover:text-orange-700 cursor-pointer transition-colors"
                            onClick={() => setSelectedTag(tag)}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(ick.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1 text-orange-600 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Lightbulb className="w-3 h-3" />
                          Analyze opportunity
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </section>

            {/* Browse More Tags */}
            {tags.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Choose your niches
                </h2>
                <div className="flex flex-wrap gap-4">
                  {tags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() =>
                        setSelectedTag(selectedTag === tag ? null : tag)
                      }
                      className={`px-4 py-2 rounded-full font-semibold text-sm transition ${
                        selectedTag === tag
                          ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg"
                          : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Clear Filters */}
            {(selectedSentiment || selectedTag) && (
              <div className="text-center mt-8">
                <button
                  onClick={() => {
                    setSelectedSentiment(null);
                    setSelectedTag(null);
                  }}
                  className="text-orange-600 font-semibold hover:text-orange-700 flex items-center justify-center gap-2"
                >
                  Clear filters <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}