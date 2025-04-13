import { useState, useRef } from "react";

export default function VideoTracker({
  videoUrl,
  children,
  topicId,
  videoId,
  onVideoEnd
}: {
  videoUrl: string;
  children: React.ReactNode;
  topicId: number | null;
  videoId: number | null;
  onVideoEnd?: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [lastPlaybackPosition, setLastPlaybackPosition] = useState(0);

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
  };

  const handleVideoEnd = () => {
    handlePauseOrExit();
    if (onVideoEnd) {
      onVideoEnd();
    }
  };

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
        onEnded={handleVideoEnd}
      >
        {children}
      </video>
    </div>
  );
}
