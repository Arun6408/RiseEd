import { setToken } from "@/utils/util";
import axios from "axios";
import { useState, useEffect, useRef } from "react";

export default function VideoTracker({
  videoUrl,
  children,
  topicId,
  videoId
}: {
  videoUrl: string;
  children: React.ReactNode;
  topicId: number | null;
  videoId: number | null;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [watchTime, setWatchTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [lastPlaybackPosition, setLastPlaybackPosition] = useState(0);
  const [lastSentMinute, setLastSentMinute] = useState(-1); // Track last sent minute

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isPlaying) {
      interval = setInterval(() => {
        setWatchTime((prev) => {
          const newWatchTime = prev + 1;

          if (newWatchTime % 60 === 0) {
            sendWatchTime(false); // Send update every 60 seconds
          }

          return newWatchTime;
        });
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying]);

  const sendWatchTime = async (isPaused: boolean) => {
    const currentMinute = Math.floor(watchTime / 60);
    
    if (isPaused || currentMinute > lastSentMinute) { 
      try {
        setToken();
        await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/videos/updateWatchStatus`, {
          videoId,
          watchTime,
          lastPlaybackPosition,
        });
        setLastSentMinute(currentMinute);
      } catch (error) {
        console.error("Error sending watch time: ", error);
      }
    }
  };

  const handlePlay = () => {
    setIsPlaying(true);
    if (videoRef.current) {
      videoRef.current.currentTime = lastPlaybackPosition; 
    }
  };

  const handlePauseOrExit = () => {
    setIsPlaying(false);
    if (videoRef.current) {
      setLastPlaybackPosition(Math.floor(videoRef.current.currentTime));
    }
    sendWatchTime(true);
  };

  useEffect(() => {
    window.addEventListener("beforeunload", () => sendWatchTime(true));
    return () => {
      sendWatchTime(true);
      window.removeEventListener("beforeunload", () => sendWatchTime(true));
    };
  }, []);

  return (
    <div>
      <video
        ref={videoRef}
        controls
        className="w-full rounded-lg shadow-lg"
        src={videoUrl}
        autoPlay={true}
        onPlay={handlePlay}
        onPause={handlePauseOrExit}
        onEnded={handlePauseOrExit}
      >
        {children}
      </video>
    </div>
  );
}
