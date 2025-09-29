"use client";
import React from "react";

export default function PageContainer({ title, subtitle, children, maxWidth = "md" }) {
  const widthClass = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
    full: "max-w-full",
  }[maxWidth] || "max-w-md";

  return (
    <div className={`px-4 py-10 sm:px-6 lg:px-8 w-full ${widthClass} mx-auto mt-10 pointer-events-auto relative z-50`}>
      <div className="bg-white/70 dark:bg-zinc-800/70 backdrop-blur border border-zinc-200 dark:border-zinc-700 rounded-lg shadow">
        {(title || subtitle) && (
          <div className="px-5 sm:px-6 md:px-8 pt-5 sm:pt-6 md:pt-8 pb-3 border-b border-zinc-200 dark:border-zinc-700">
            {title && <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">{title}</h1>}
            {subtitle && <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{subtitle}</p>}
          </div>
        )}
        <div className="p-5 sm:p-6 md:p-8">{children}</div>
      </div>
    </div>
  );
}


