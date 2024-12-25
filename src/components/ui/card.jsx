import React from 'react';

export function Card({ className, children }) {
  return <div className={`bg-white rounded-lg shadow ${className}`}>{children}</div>;
}

export function CardHeader({ className, children }) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}

export function CardTitle({ className, children }) {
  return <h2 className={`text-xl font-semibold ${className}`}>{children}</h2>;
}

export function CardContent({ className, children }) {
  return <div className={`p-6 pt-0 ${className}`}>{children}</div>;
}