"use client";
import { ReactLenis } from 'lenis/react';

function SmoothScrolling({ children }) {
  return (
    <ReactLenis root>
      {children}
    </ReactLenis>
  );
}

export default SmoothScrolling;
