"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export function Logo({ size = 'md', showText = true, className = '' }: LogoProps) {
  const sizes = {
    sm: { width: 32, height: 32, textSize: 'text-lg' },
    md: { width: 40, height: 40, textSize: 'text-xl' },
    lg: { width: 60, height: 60, textSize: 'text-2xl' },
    xl: { width: 80, height: 80, textSize: 'text-3xl' },
  };

  const { width, height, textSize } = sizes[size];

  return (
    <Link href="/" className={`flex items-center gap-3 ${className}`}>
      <div className="relative flex-shrink-0">
        <Image
          src="/logo.png"
          alt="HB CLASSES"
          width={width}
          height={height}
          className="rounded-full"
          priority
        />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={`font-syne font-bold ${textSize} text-gradient leading-tight`}>
            HB CLASSES
          </span>
          <span className="text-[10px] text-muted tracking-wider uppercase">
            Online English Coaching
          </span>
        </div>
      )}
    </Link>
  );
}

export function LogoIcon({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <Image
      src="/logo.png"
      alt="HB CLASSES"
      width={size}
      height={size}
      className={`rounded-full ${className}`}
      priority
    />
  );
}