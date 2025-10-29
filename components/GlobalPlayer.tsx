
import React, { useRef, useEffect } from 'react';
import { usePlayer } from '../contexts/PlayerContext';
import { useLanguage } from '../contexts/LanguageContext';
import { RepeatMode, ContentType } from '../types';

const GlobalPlayer: React.FC = () => {
    const {
        isPlaying,
        currentTrack,
        togglePlayPause,
        playNext,
        playPrev,
        isShuffled,
        toggleShuffle,
        repeatMode,
        setRepeatMode
    } = usePlayer();
    const { language } = useLanguage();

    const audioRef = useRef<HTMLAudioElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const isVideo = currentTrack?.type === ContentType.VIDEO;

    useEffect(() => {
        const mediaElement = isVideo ? videoRef.current : audioRef.current;
        if (!mediaElement || !currentTrack) return;

        if (mediaElement.src !== currentTrack.url) {
            mediaElement.src = currentTrack.url;
        }

        if (isPlaying) {
            mediaElement.play().catch(error => {
                if (error.name !== 'AbortError') {
                    console.error("Playback failed", error);
                }
            });
        } else {
            mediaElement.pause();
        }
    }, [isPlaying, currentTrack, isVideo]);


    const handleEnded = () => {
        if (repeatMode === 'one') {
            const mediaElement = isVideo ? videoRef.current : audioRef.current;
            if (mediaElement) {
                mediaElement.currentTime = 0;
                mediaElement.play();
            }
        } else {
            playNext();
        }
    };
    
    const toggleRepeat = () => {
        const modes: RepeatMode[] = ['none', 'all', 'one'];
        const currentIndex = modes.indexOf(repeatMode);
        const nextIndex = (currentIndex + 1) % modes.length;
        setRepeatMode(modes[nextIndex]);
    };

    if (!currentTrack) {
        return null;
    }

    const title = language === 'ru' ? currentTrack.title_ru : currentTrack.title_en;

    return (
        <div className="fixed bottom-0 left-0 right-0 h-24 bg-secondary border-t border-gray-700 shadow-2xl z-50 p-2 flex items-center">
            <audio ref={audioRef} onEnded={handleEnded} className="hidden" />
            
            <div className="flex items-center w-1/3">
                 {isVideo ? (
                    <video ref={videoRef} onEnded={handleEnded} className="w-20 h-20 object-contain bg-black rounded" muted={false} />
                 ) : (
                    <img src={currentTrack.imageUrl} alt={title} className="w-20 h-20 object-cover rounded" />
                 )}
                <div className="ml-4 min-w-0">
                    <p className="font-bold text-white truncate">{title}</p>
                    <p className="text-sm text-text-secondary truncate">{currentTrack.type}</p>
                </div>
            </div>

            <div className="flex flex-col items-center justify-center w-1/3">
                <div className="flex items-center space-x-6">
                    <button onClick={toggleShuffle} title="Shuffle" className={isShuffled ? 'text-accent' : 'text-text-secondary hover:text-white'}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l-7-7 7-7m5 14l7-7-7-7" /></svg>
                    </button>
                     <button onClick={playPrev} title="Previous" className="text-text-secondary hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    </button>
                     <button onClick={togglePlayPause} title={isPlaying ? "Pause" : "Play"} className="bg-white text-black rounded-full p-3 transform hover:scale-110 transition-transform">
                        {isPlaying ? (
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 4h3v12H5V4zm7 0h3v12h-3V4z" clipRule="evenodd"/></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                        )}
                    </button>
                     <button onClick={playNext} title="Next" className="text-text-secondary hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                    </button>
                    <button onClick={toggleRepeat} title="Repeat" className={repeatMode !== 'none' ? 'text-accent' : 'text-text-secondary hover:text-white'}>
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 2a1 1 0 00-1 1v4.586A1 1 0 004 9h6a1 1 0 001-1V4a1 1 0 00-1-1H4zm1 2h4v4H5V4zM15 4a1 1 0 10-2 0v5.586a1 1 0 001 1h.586a1 1 0 00.707-1.707L13 7.414V4zM4 11a1 1 0 102 0v5.586a1 1 0 001 1h.586a1 1 0 00.707-1.707L6 14.414V11z" clipRule="evenodd" /></svg>
                       {repeatMode === 'one' && <span className="absolute text-accent text-xs -mt-4 ml-1 font-bold">1</span>}
                    </button>
                </div>
                {/* Progress bar could be added here */}
            </div>
            
             <div className="w-1/3">
                {/* Volume control could be added here */}
            </div>
        </div>
    );
};

export default GlobalPlayer;