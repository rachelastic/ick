// components/RotatingExample.tsx (Client Component)
"use client";

import { useEffect, useState } from "react";

const examples = [
  "People who don't return shopping carts",
  "Chewing loudly in a quiet room",
  "Texting only 'k' as a reply",
  "Leaving wet towels on the bed",
  "Talking during movies",
];

export default function RotatingExample() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(
      () => setIndex((prev) => (prev + 1) % examples.length),
      3000
    );
    return () => clearInterval(interval);
  }, []);

  return <>{examples[index]}</>;
}
