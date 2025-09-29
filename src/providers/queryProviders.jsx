'use client'

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

let browserQueryClient = null;

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 60, // 1 hour
        retry: 4,
      },
    },
  });
}

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Always create a new client for SSR
    return makeQueryClient();
  }

  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }

  return browserQueryClient;
}

const queryClient = getQueryClient();

export const QueryProvider = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};
