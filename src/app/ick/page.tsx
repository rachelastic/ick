"use client";
import IckSubmissionForm from "@/components/Form";
import ComicBubble from "@/components/ComicBubble";

export default function SubmitIckPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex flex-col md:flex-row items-center justify-center gap-10 px-6 py-24">
      {/* Left bubble */}
      <ComicBubble
        messages={[
          "TikTok keeps sending me the SAME videos",
          "I got fatigue from browsing clothing sites",
          "Note-taking is so pretentious",
          "Why do they clap after landing?",
        ]}
        peepUrl="https://cdn.prod.website-files.com/5e51c674258ffe10d286d30a/5e535bb6e35d38cae7684f8c_peep-86.svg"
        direction="left"
      />

      {/* Form container */}
    
        <IckSubmissionForm />
  

      {/* Right bubble */}
      <ComicBubble
        messages={[
          "I don't trust ChatGPT answers",
          "I got fatigue from browsing clothing sites",
          "Note-taking is so pretentious",
          "Why does my phone die so fast?",
        ]}
        peepUrl="https://cdn.prod.website-files.com/5e51c674258ffe10d286d30a/5e535b00550b76252bf719e6_peep-80.svg"
        direction="right"
      />
   

      {/* Animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}
