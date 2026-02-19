"use client";

import React, { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";

const facts = [
  // Technical History
  "Fun fact: The first computer bug was an actual moth found in a relay in 1947.",
  "Did you know? The first web page ever created is still online today.",
  "JavaScript was famously developed in only 10 days back in 1995.",
  "The 'QWERTY' keyboard was designed to slow typists down so mechanical keys wouldn't jam.",
  
  // Brain & Learning
  "Consistent practice improves memory retention by up to 40%.",
  "Your brain is more creative when you're slightly tired—perfect for out-of-the-box coding!",
  "Focused breathing for just 30 seconds can significantly lower test anxiety.",
  "The 'Rubber Duck' debugging method is scientifically proven to help solve logic gaps.",
  
  // Encouragement & Tips
  "Pro-tip: Read every question twice; the second read often reveals hidden details.",
  "Don't rush! Speed is good, but accuracy wins the assessment.",
  "Almost there! We're tailoring the questions to your specific skill level...",
  "Take a deep breath. You've got this!",
  "Success is the sum of small efforts, repeated day in and day out."
];

export function StaggeredLoader() {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false); // Start fade out
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % facts.length);
        setFade(true); // Start fade in
      }, 1000); // Wait for fade out to finish
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6 text-center">
      {/* Animated Icon */}
      <div className="relative mb-8">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary w-6 h-6 animate-pulse" />
      </div>

      <div className="space-y-4 max-w-md">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Preparing Your Assessment
        </h2>
        
        {/* Fact Container with smooth height and fade */}
        <div className="min-h-[60px] flex items-center justify-center">
          <p
            className={`text-muted-foreground italic transition-opacity duration-500 ease-in-out ${
              fade ? "opacity-100" : "opacity-0"
            }`}
          >
            {facts[index]}
          </p>
        </div>
      </div>

      {/* Decorative Progress bar */}
      <div className="mt-12 w-64 h-1.5 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-primary animate-[loading_2s_infinite_ease-in-out] w-1/3"></div>
      </div>

      <style jsx>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
}