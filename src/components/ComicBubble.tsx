"use client";

import React, { useEffect, useState } from "react";

interface ComicBubbleProps {
  messages: string[];
  peepUrl: string;
  direction?: "left" | "right";
}

export default function ComicBubble({
  messages,
  peepUrl,
  direction = "left",
}: ComicBubbleProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const isRight = direction === "right";

  // Cycle messages every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="flex flex-col items-center gap-3 mb-6">
      {/* Animated bubble */}
      <div className="bg-white border-2 border-black rounded-xl shadow-[2px_2px_0px_black] px-6 py-4 font-[Patrick_Hand] text-lg max-w-sm text-center animate-bounce">
        {messages[currentIndex]}
      </div>

      {/* Peeps character */}
      <div className="transition-transform hover:scale-105 duration-300">
        <img
          src={peepUrl}
          alt="Open Peeps Character"
          className={`w-36 h-36 object-contain ${
            isRight ? "scale-x-[-1]" : ""
          }`}
        />
      </div>
    </div>
  );
}
