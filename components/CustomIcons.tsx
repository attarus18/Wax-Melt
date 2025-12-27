
import React from 'react';

export const WaxProIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle cx="50" cy="50" r="50" fill="#2D2D2D" />
    <path 
      d="M50 15C50 15 65 38 65 52C65 62 58.2843 69 50 69C41.7157 69 35 62 35 52C35 38 50 15 50 15Z" 
      fill="url(#paint0_linear)"
    />
    <path 
      d="M32 62C32 60.8954 32.8954 60 34 60H66C67.1046 60 68 60.8954 68 62V84C68 86.2091 66.2091 88 64 88H36C33.7909 88 32 86.2091 32 84V62Z" 
      fill="url(#paint1_linear)"
    />
    <text 
      x="50" 
      y="82" 
      textAnchor="middle" 
      fill="#2D2D2D" 
      fontSize="24" 
      fontWeight="900" 
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      2
    </text>
    <defs>
      <linearGradient id="paint0_linear" x1="50" y1="15" x2="50" y2="69" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FDBB2D" />
        <stop offset="1" stopColor="#F9A602" />
      </linearGradient>
      <linearGradient id="paint1_linear" x1="50" y1="60" x2="50" y2="88" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFD200" />
        <stop offset="1" stopColor="#F9A602" />
      </linearGradient>
    </defs>
  </svg>
);
