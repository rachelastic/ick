"use client";

import React, { useState } from "react";
import { X, TrendingUp, CheckCircle, AlertCircle } from "lucide-react";

const TAGS = ["relationship", "product", "work & productivity", "minor"];

export default function IckSubmissionForm(): React.ReactElement {
  const [ick, setIck] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ick.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/icks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: ick, tags: selectedTags }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      await response.json();
      setSubmitStatus('success');
      setIck("");
      setSelectedTags([]);
    } catch (err) {
      console.error("Failed to save Ick:", err);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubmitStatus('idle'), 3000);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative bg-white/80 backdrop-blur-md border border-orange-200 rounded-3xl shadow-2xl w-full max-w-xl mx-auto p-8 space-y-6 animate-floatIn"
    >
      {/* Feedback */}
      {submitStatus === 'success' && (
        <div className="flex items-center gap-3 bg-green-100 border border-green-300 rounded-xl p-4">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <span className="text-green-700 font-semibold">Ick submitted successfully! 🎉</span>
        </div>
      )}
      {submitStatus === 'error' && (
        <div className="flex items-center gap-3 bg-red-100 border border-red-300 rounded-xl p-4">
          <AlertCircle className="w-6 h-6 text-red-600" />
          <span className="text-red-700 font-semibold">Submission failed. Please try again.</span>
        </div>
      )}

      <h2 className="text-2xl font-bold text-slate-800">What's your latest ick?</h2>

      <textarea
        value={ick}
        onChange={(e) => setIck(e.target.value)}
        placeholder="E.g., TikTok keeps showing the SAME videos AGAIN"
        rows={4}
        className="w-full p-4 rounded-2xl bg-white/70 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
        required
      />
       

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {TAGS.map((tag) => {
          const isSelected = selectedTags.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`px-4 py-2 rounded-xl font-medium transition ${
                isSelected
                  ? "bg-gradient-to-r from-orange-400 to-pink-400 text-white shadow-md"
                  : "bg-orange-100 text-orange-700 hover:bg-orange-200 hover:text-orange-800"
              }`}
            >
              {tag}
            </button>
          );
        })}
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !ick.trim()}
        className="w-full bg-gradient-to-r from-orange-400 via-pink-400 to-purple-500 text-white font-bold py-3 rounded-2xl hover:scale-[1.02] transition-all disabled:opacity-50 flex justify-center items-center gap-2"
      >
        {isSubmitting ? "Submitting..." : "Submit Ick"}
      </button>
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200">
  <div className="flex items-start gap-3">
    <div className="bg-gradient-to-r from-blue-400 to-purple-500 p-2 rounded-lg">
      <TrendingUp className="w-4 h-4 text-white" />
    </div>
    <div>
      <h4 className="font-bold text-slate-800 mb-1">Why submit an ick?</h4>
      <p className="text-sm text-slate-600 leading-relaxed">
        Your frustration could be the inspiration for the next billion-dollar startup. 
        Help builders discover untapped opportunities and be part of the innovation process!
      </p>
    </div>
  </div>
</div>


      <style jsx>{`
        @keyframes floatIn {
          0% { opacity: 0; transform: translateY(20px); }
          50% { opacity: 1; transform: translateY(-5px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-floatIn {
          animation: floatIn 0.8s ease-out;
        }
      `}</style>
    </form>
  );
}
