'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import BookmarkIcon from './BookmarkIcon';

interface BookmarkButtonProps {
  conferenceId: string;
  className?: string;
  showLabel?: boolean;
  onToggle?: (isBookmarked: boolean) => void;
}

export default function BookmarkButton({
  conferenceId,
  className = '',
  showLabel = false,
  onToggle,
}: BookmarkButtonProps) {
  const { user, loading: authLoading } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Check if conference is bookmarked
  useEffect(() => {
    const checkBookmarkStatus = async () => {
      if (!user) {
        setIsChecking(false);
        return;
      }

      try {
        const response = await fetch(`/api/bookmarks/${conferenceId}/check`);
        if (response.ok) {
          const data = await response.json();
          setIsBookmarked(data.isBookmarked || false);
        }
      } catch (error) {
        console.error('Error checking bookmark status:', error);
      } finally {
        setIsChecking(false);
      }
    };

    if (!authLoading) {
      checkBookmarkStatus();
    }
  }, [user, conferenceId, authLoading]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      // Redirect to login if not authenticated
      window.location.href = `/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      return;
    }

    setIsLoading(true);

    try {
      if (isBookmarked) {
        // Remove bookmark
        const response = await fetch(`/api/bookmarks/${conferenceId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setIsBookmarked(false);
          onToggle?.(false);
        } else {
          let errorMessage = 'Unknown error occurred';
          try {
            const error = await response.json();
            errorMessage = error.error || error.message || errorMessage;
          } catch (e) {
            // If response is not JSON, try to get text
            try {
              const text = await response.text();
              errorMessage = text || errorMessage;
            } catch (textError) {
              // Fallback to status text
              errorMessage = response.statusText || errorMessage;
            }
          }
          alert(`Failed to remove bookmark: ${errorMessage}`);
        }
      } else {
        // Add bookmark
        const response = await fetch('/api/bookmarks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ conferenceId }),
        });

        if (response.ok) {
          setIsBookmarked(true);
          onToggle?.(true);
        } else {
          let errorMessage = 'Unknown error occurred';
          try {
            const error = await response.json();
            errorMessage = error.error || error.message || errorMessage;
          } catch (e) {
            // If response is not JSON, try to get text
            try {
              const text = await response.text();
              errorMessage = text || errorMessage;
            } catch (textError) {
              // Fallback to status text
              errorMessage = response.statusText || errorMessage;
            }
          }
          alert(`Failed to add bookmark: ${errorMessage}`);
        }
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      alert('An error occurred while updating bookmark.');
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render if still checking auth or bookmark status
  if (authLoading || isChecking) {
    return (
      <button
        className={`${className} opacity-50 cursor-not-allowed`}
        disabled
        aria-label="Loading bookmark status"
      >
        <BookmarkIcon isBookmarked={false} className="w-5 h-5" />
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`${className} ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'} transition-opacity`}
      aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
      title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
    >
      <div className="flex items-center space-x-1">
        <BookmarkIcon
          isBookmarked={isBookmarked}
          className={`w-5 h-5 ${isBookmarked ? 'text-yellow-500' : 'text-gray-400'}`}
        />
        {showLabel && (
          <span className="text-sm">
            {isBookmarked ? 'Bookmarked' : 'Bookmark'}
          </span>
        )}
      </div>
    </button>
  );
}

