'use client';

import { Bookmark } from 'lucide-react';

interface BookmarkIconProps {
  isBookmarked: boolean;
  className?: string;
}

export default function BookmarkIcon({ isBookmarked, className = '' }: BookmarkIconProps) {
  return (
    <Bookmark
      className={`${className} ${isBookmarked ? 'fill-current' : ''}`}
      aria-label={isBookmarked ? 'Bookmarked' : 'Not bookmarked'}
    />
  );
}

