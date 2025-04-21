"use client";

import { TypewriterEffect } from "./ui/typewriter-effect";


export default function Text() {
  const words = [
    { text: "Simple" },
    { text: "ideas" },
    { text: "Big" },
    { text: "impact" },
    { text: "Always", className: " text-violet-500 dark:text-violet-500" }
  ];
  
  
  return (
    <div className="flex flex-col items-center justify-center h-[40rem] ">
      
      <TypewriterEffect words={words} />
      
    </div>
  );
}
