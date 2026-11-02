"use client";

import { useEffect, useRef, useState } from "react";

export default function SongPlayerControls() {
  const [liked, setLiked] = useState(false);
  const [added, setAdded] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const autoStarted = useRef(false);

  function getAudio() {
    if (!audioRef.current) {
      audioRef.current = new Audio("/images/wedding-song.mp3");
      audioRef.current.loop = true;
      audioRef.current.addEventListener("ended", () => setPlaying(false));
    }
    return audioRef.current;
  }

  useEffect(() => {
    function autoPlay() {
      if (autoStarted.current) return;
      autoStarted.current = true;
      const audio = getAudio();
      audio.play().then(() => setPlaying(true)).catch(() => {});
    }
    document.addEventListener("invitation-opened", autoPlay, { once: true });
    return () => {
      document.removeEventListener("invitation-opened", autoPlay);
    };
  }, []);

  function togglePlay() {
    const audio = getAudio();
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play();
      setPlaying(true);
    }
  }

  return (
    <div data-fade="0.12" className="mt-5 flex items-center justify-center gap-5 text-[#f3d58d]">
      <button
        type="button"
        aria-label={liked ? "Remove song from favorites" : "Add song to favorites"}
        aria-pressed={liked}
        onClick={() => setLiked((value) => !value)}
        className="grid h-9 w-9 place-items-center transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f3d58d]"
      >
        <svg aria-hidden viewBox="0 0 24 24" className="h-6 w-6" fill={liked ? "currentColor" : "none"}>
          <path d="M20.8 8.8c0 4.2-8.8 10-8.8 10s-8.8-5.8-8.8-10A4.7 4.7 0 0 1 12 6.1a4.7 4.7 0 0 1 8.8 2.7Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
      </button>

      <button
        type="button"
        aria-label={playing ? "Pause our song" : "Play our song"}
        onClick={togglePlay}
        className="grid h-14 w-14 place-items-center rounded-full border-[3px] border-[#d9b65e] bg-[#c9b48f]/35 text-[#5c0f1f] shadow-[0_0_14px_rgba(230,190,98,0.25)] transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f3d58d]"
      >
        {playing ? (
          <svg aria-hidden viewBox="0 0 24 24" className="h-6 w-6 fill-current">
            <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
          </svg>
        ) : (
          <svg aria-hidden viewBox="0 0 24 24" className="h-6 w-6 fill-current">
            <path d="M7 4.8c0-.8.9-1.3 1.6-.9l11 7.2a1.1 1.1 0 0 1 0 1.8l-11 7.2c-.7.4-1.6-.1-1.6-.9V4.8Z" />
          </svg>
        )}
      </button>

      <button
        type="button"
        aria-label={added ? "Remove song from playlist" : "Add song to playlist"}
        aria-pressed={added}
        onClick={() => setAdded((value) => !value)}
        className="grid h-9 w-9 place-items-center transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f3d58d]"
      >
        <svg aria-hidden viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
          {added ? (
            <path d="m5 12.5 4.4 4.4L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
          ) : (
            <>
              <circle cx="12" cy="12" r="8.8" />
              <path d="M12 7.5v9M7.5 12h9" strokeLinecap="round" />
            </>
          )}
        </svg>
      </button>
    </div>
  );
}
