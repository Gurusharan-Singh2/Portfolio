"use client";

import Link from "next/link";

export default function FeatureCard({ feature }) {
  return (
    <Link
      href={feature.enabled ? feature.href : "#"}
      style={{
        pointerEvents: feature.enabled ? "auto" : "none",
      }}
    >
      <div
        style={{
          padding: 20,
          borderRadius: 14,
          background: "#fff",
          border: "1px solid #e5e7eb",
          cursor: feature.enabled ? "pointer" : "not-allowed",
          opacity: feature.enabled ? 1 : 0.5,
          transition: "0.2s",
        }}
      >
        <div style={{ fontSize: 36 }}>{feature.icon}</div>

        <h3 style={{ marginTop: 10 }}>{feature.title}</h3>

        <p style={{ fontSize: 14, color: "#6b7280" }}>
          {feature.description}
        </p>

        {!feature.enabled && (
          <span style={{ fontSize: 12, color: "red" }}>
            Coming Soon
          </span>
        )}
      </div>
    </Link>
  );
}
