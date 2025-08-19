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
  const [selectedSentiment, setSelectedSentiment] = useState<string | null>(
    null
  );
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/icks")
      .then((res) => res.json())
      .then((data) => setIcks(data))
      .catch((err) => console.error("Failed to fetch icks:", err));
  }, []);

  const filteredIcks = icks.filter((ick) => {
    const matchSentiment =
      !selectedSentiment || ick.sentiment === selectedSentiment;
    const matchTag = !selectedTag || ick.tags.includes(selectedTag);
    return matchSentiment && matchTag;
  });

  const tags = Array.from(new Set(icks.flatMap((ick) => ick.tags)));

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

  const highSeverityCount = icks.filter((ick) => ick.severity >= 8).length;
  const todayCount = icks.filter(
    (ick) =>
      new Date(ick.createdAt).toDateString() === new Date().toDateString()
  ).length;

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
                    {ick.tags.map((tag) => (
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
      </div>
    </div>
  );
}
