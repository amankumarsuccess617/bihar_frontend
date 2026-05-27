import React from "react";

export function GovernmentLogo() {
  return (
    <div className="flex items-center gap-3">
      {/* Logo */}
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-900 to-blue-700 shadow-md">
        <svg
          viewBox="0 0 100 100"
          className="h-8 w-8"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Ashoka Chakra representation */}
          <circle cx="50" cy="50" r="40" stroke="#FFA500" strokeWidth="2" />
          <circle cx="50" cy="50" r="30" stroke="#FFFFFF" strokeWidth="1.5" />
          
          {/* Center circle */}
          <circle cx="50" cy="50" r="8" fill="#FFFFFF" />
          
          {/* 12 spokes of chakra */}
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * 30 * Math.PI) / 180;
            const x1 = 50 + 8 * Math.cos(angle);
            const y1 = 50 + 8 * Math.sin(angle);
            const x2 = 50 + 30 * Math.cos(angle);
            const y2 = 50 + 30 * Math.sin(angle);
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#FFFFFF"
                strokeWidth="1"
              />
            );
          })}
          
          {/* Indian flag colors - top bar */}
          <rect x="20" y="20" width="60" height="6" fill="#FF9933" />
          {/* White bar */}
          <rect x="20" y="26" width="60" height="6" fill="#FFFFFF" />
          {/* Green bar */}
          <rect x="20" y="32" width="60" height="6" fill="#138808" />
        </svg>
      </div>

      {/* Text */}
      <div className="hidden sm:block">
        <div className="text-sm font-bold text-blue-900">Recruitment Portal</div>
        <div className="text-xs text-gray-600">Government of Bihar</div>
      </div>
    </div>
  );
}

export function LogoSmall() {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-900 to-blue-700">
      <span className="text-lg font-bold text-white">भ</span>
    </div>
  );
}
