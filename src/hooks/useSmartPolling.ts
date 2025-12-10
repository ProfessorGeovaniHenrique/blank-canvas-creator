import { useState, useEffect, useCallback, useRef } from 'react';

interface UseSmartPollingOptions {
  /** Base polling interval in ms (default: 30000) */
  interval?: number;
  /** Delay before resuming polling when tab becomes visible (default: 1000) */
  resumeDelay?: number;
  /** Start polling immediately (default: true) */
  enabled?: boolean;
}

interface UseSmartPollingReturn {
  /** Whether polling should be active */
  shouldPoll: boolean;
  /** Whether tab is currently visible */
  isTabVisible: boolean;
  /** Current polling interval (false when paused) */
  pollingInterval: number | false;
  /** Manually pause polling */
  pausePolling: () => void;
  /** Manually resume polling */
  resumePolling: () => void;
  /** Toggle polling state */
  togglePolling: () => void;
  /** Whether polling is manually paused */
  isManuallyPaused: boolean;
}

/**
 * Hook for smart polling that pauses when tab is not visible
 * Saves resources by not making unnecessary requests when user isn't looking
 */
export function useSmartPolling(options: UseSmartPollingOptions = {}): UseSmartPollingReturn {
  const { 
    interval = 30000, 
    resumeDelay = 1000,
    enabled = true 
  } = options;

  const [isTabVisible, setIsTabVisible] = useState(() => 
    typeof document !== 'undefined' ? document.visibilityState === 'visible' : true
  );
  const [isManuallyPaused, setIsManuallyPaused] = useState(false);
  const resumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle visibility change
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const handleVisibilityChange = () => {
      const visible = document.visibilityState === 'visible';
      
      // Clear any pending resume timeout
      if (resumeTimeoutRef.current) {
        clearTimeout(resumeTimeoutRef.current);
        resumeTimeoutRef.current = null;
      }

      if (visible) {
        // Delay resume to avoid immediate burst of requests
        resumeTimeoutRef.current = setTimeout(() => {
          setIsTabVisible(true);
        }, resumeDelay);
      } else {
        setIsTabVisible(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (resumeTimeoutRef.current) {
        clearTimeout(resumeTimeoutRef.current);
      }
    };
  }, [resumeDelay]);

  const pausePolling = useCallback(() => {
    setIsManuallyPaused(true);
  }, []);

  const resumePolling = useCallback(() => {
    setIsManuallyPaused(false);
  }, []);

  const togglePolling = useCallback(() => {
    setIsManuallyPaused(prev => !prev);
  }, []);

  // Calculate if polling should be active
  const shouldPoll = enabled && isTabVisible && !isManuallyPaused;
  const pollingInterval = shouldPoll ? interval : false;

  return {
    shouldPoll,
    isTabVisible,
    pollingInterval,
    pausePolling,
    resumePolling,
    togglePolling,
    isManuallyPaused
  };
}
