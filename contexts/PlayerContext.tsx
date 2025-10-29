import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { Content, PlaylistItem, Playlist, RepeatMode, ContentType } from '../types';
import { useData } from './DataContext';

// Helper to shuffle an array
// FIX: Converted to a standard function to avoid ambiguity with JSX syntax in .tsx files, which was causing a syntax error.
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  let currentIndex = newArray.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [newArray[currentIndex], newArray[randomIndex]] = [newArray[randomIndex], newArray[currentIndex]];
  }
  return newArray;
}

interface PlayerContextType {
    isPlaying: boolean;
    currentTrack: Content | null;
    activeQueue: Content[];
    currentTrackIndex: number;
    isShuffled: boolean;
    repeatMode: RepeatMode;
    playTrack: (track: Content) => void;
    playPlaylist: (playlist: Playlist, startIndex?: number) => void;
    togglePlayPause: () => void;
    playNext: () => void;
    playPrev: () => void;
    toggleShuffle: () => void;
    setRepeatMode: (mode: RepeatMode) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { content: allContent } = useData();
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrack, setCurrentTrack] = useState<Content | null>(null);
    const [activeQueue, setActiveQueue] = useState<Content[]>([]);
    const [originalQueue, setOriginalQueue] = useState<Content[]>([]);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(-1);
    const [isShuffled, setIsShuffled] = useState(false);
    const [repeatMode, setRepeatMode] = useState<RepeatMode>('none');

    const startPlayback = (queue: Content[], index: number) => {
        const trackToStart = queue[index];
        if (!trackToStart) return;

        const newQueue = isShuffled ? shuffleArray(queue) : queue;
        const newIndex = isShuffled ? newQueue.findIndex(item => item.id === trackToStart.id) : index;

        setActiveQueue(newQueue);
        setOriginalQueue(queue);
        setCurrentTrackIndex(newIndex);
        setCurrentTrack(newQueue[newIndex] ?? null);
        setIsPlaying(true);
    };

    const playTrack = (track: Content) => {
        setIsShuffled(false);
        setRepeatMode('none');
        startPlayback([track], 0);
    };

    const playPlaylist = (playlist: Playlist, startIndex = 0) => {
        if (playlist.items.length === 0) return;
        
        const fullPlaylistTracks: Content[] = playlist.items
            .map(item => allContent.find(c => c.id === item.contentId))
            .filter((c): c is Content => c !== undefined);

        if (fullPlaylistTracks.length > 0) {
            const adjustedStartIndex = Math.max(0, Math.min(startIndex, fullPlaylistTracks.length - 1));
            startPlayback(fullPlaylistTracks, adjustedStartIndex);
        }
    };

    const togglePlayPause = () => {
        if (currentTrack) {
            setIsPlaying(prev => !prev);
        }
    };

    const playNext = useCallback(() => {
        if (activeQueue.length === 0) return;

        let nextIndex = currentTrackIndex + 1;

        if (nextIndex >= activeQueue.length) {
            if (repeatMode === 'all') {
                nextIndex = 0;
            } else {
                setIsPlaying(false);
                return; // End of queue
            }
        }
        setCurrentTrackIndex(nextIndex);
        setCurrentTrack(activeQueue[nextIndex]);
    }, [activeQueue, currentTrackIndex, repeatMode]);

    const playPrev = () => {
        if (activeQueue.length === 0) return;
        let prevIndex = currentTrackIndex - 1;
        if (prevIndex < 0) {
            prevIndex = activeQueue.length - 1; // Loop to the end
        }
        setCurrentTrackIndex(prevIndex);
        setCurrentTrack(activeQueue[prevIndex]);
    };
    
    const toggleShuffle = () => {
        const newShuffleState = !isShuffled;
        setIsShuffled(newShuffleState);

        if (!currentTrack) return;

        if (newShuffleState) {
            const shuffledQueue = shuffleArray(originalQueue);
            // FIX: Explicitly type `item` as `Content` to resolve TS error where `item` is inferred as `unknown`.
            const newIndex = shuffledQueue.findIndex((item: Content) => item.id === currentTrack.id);
            setActiveQueue(shuffledQueue);
            setCurrentTrackIndex(newIndex);
        } else {
            // FIX: Explicitly type `item` as `Content` to resolve TS error where `item` is inferred as `unknown`.
            const originalIndex = originalQueue.findIndex((item: Content) => item.id === currentTrack.id);
            setActiveQueue(originalQueue);
            setCurrentTrackIndex(originalIndex);
        }
    };

    const value = {
        isPlaying,
        currentTrack,
        activeQueue,
        currentTrackIndex,
        isShuffled,
        repeatMode,
        playTrack,
        playPlaylist,
        togglePlayPause,
        playNext,
        playPrev,
        toggleShuffle,
        setRepeatMode,
    };

    return (
        <PlayerContext.Provider value={value}>
            {children}
        </PlayerContext.Provider>
    );
};

export const usePlayer = (): PlayerContextType => {
    const context = useContext(PlayerContext);
    if (!context) {
        throw new Error('usePlayer must be used within a PlayerProvider');
    }
    return context;
};
