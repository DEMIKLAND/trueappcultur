
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { usePlayer } from '../contexts/PlayerContext';
import { Playlist, PlaylistItem, Role } from '../types';

const PlaylistItemRow: React.FC<{ item: PlaylistItem, playlist: Playlist, itemIndex: number, canEdit: boolean }> = ({ item, playlist, itemIndex, canEdit }) => {
    const { removeContentFromPlaylist } = useData();
    const { playPlaylist, currentTrack } = usePlayer();
    const isCurrentlyPlaying = currentTrack?.id === item.contentId;

    return (
        <li className={`flex items-center justify-between p-1 rounded ${isCurrentlyPlaying ? 'bg-accent/20' : ''}`}>
            <div className="flex items-center gap-2 cursor-pointer flex-grow min-w-0" onClick={() => playPlaylist(playlist, itemIndex)}>
                <img src={item.imageUrl} alt={item.title} className="w-8 h-8 rounded object-cover flex-shrink-0" />
                <span className={`text-sm truncate ${isCurrentlyPlaying ? 'text-accent' : 'text-text-secondary'}`}>{item.title}</span>
            </div>
            {canEdit && (
                <button onClick={() => removeContentFromPlaylist(playlist.id, item.contentId)} className="text-red-500 hover:text-red-400 p-1 flex-shrink-0">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            )}
        </li>
    );
};

const PlaylistCard: React.FC<{playlist: Playlist, canEdit: boolean}> = ({ playlist, canEdit }) => {
    const { deletePlaylist, users } = useData();
    const { playPlaylist } = usePlayer();
    const [isExpanded, setIsExpanded] = useState(false);
    
    const author = users.find(u => u.id === playlist.userId);
    const roleColor = author ? {
        [Role.ADMIN]: 'text-red-500',
        [Role.MODERATOR]: 'text-green-600',
        [Role.USER]: 'text-blue-400',
    }[author.role] : 'text-blue-400';
    const badgeIcon = author && author.badge ? { note: '🎵', gear: '⚙️' }[author.badge] : null;

    return (
        <div className="bg-primary p-3 rounded-md">
            <div className="flex justify-between items-center">
                <div className="flex-grow min-w-0 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                    <h3 className="font-semibold truncate">{playlist.name}</h3>
                    {playlist.isPublic && (
                         <p className="text-xs text-text-secondary">{`by `} 
                            <span className={`font-bold ${roleColor}`}>
                                {playlist.authorNickname}
                                {badgeIcon && author?.role === Role.MODERATOR && <span className="ml-1">{badgeIcon}</span>}
                            </span>
                        </p>
                    )}
                </div>
                 <div className="flex items-center space-x-2 flex-shrink-0">
                    <span className="text-xs text-text-secondary">{playlist.items.length} items</span>
                     <button onClick={() => playPlaylist(playlist)} className="text-accent hover:text-accent/80 p-1" title={`Play ${playlist.name}`}>
                         <svg xmlns="http://www.w.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"/></svg>
                    </button>
                    {canEdit && (
                        <button onClick={(e) => { e.stopPropagation(); deletePlaylist(playlist.id); }} className="text-red-500 hover:text-red-400 p-1" title={`Delete ${playlist.name}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                    )}
                </div>
            </div>
            {isExpanded && (
                <ul className="mt-3 space-y-2 border-t border-gray-700 pt-3">
                    {playlist.items.map((item, index) => (
                        <PlaylistItemRow key={item.contentId} item={item} playlist={playlist} itemIndex={index} canEdit={canEdit} />
                    ))}
                    {playlist.items.length === 0 && <p className="text-xs text-text-secondary text-center">Empty playlist</p>}
                </ul>
            )}
        </div>
    );
};


const PlaylistManager: React.FC = () => {
    const { currentUser } = useAuth();
    const { playlists, addPlaylist } = useData();
    const { t } = useLanguage();
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [isPublic, setIsPublic] = useState(false);

    if (!currentUser) return null;

    const userPlaylists = playlists.filter(p => p.userId === currentUser.id);
    const publicPlaylists = playlists.filter(p => p.isPublic && p.userId !== currentUser.id);
    
    const canCreatePublic = currentUser.role === Role.ADMIN || currentUser.role === Role.MODERATOR;

    const handleCreatePlaylist = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPlaylistName.trim()) {
            addPlaylist(newPlaylistName.trim(), currentUser.id, canCreatePublic && isPublic, currentUser.nickname);
            setNewPlaylistName('');
            setIsPublic(false);
        }
    };

    return (
        <div className="bg-secondary p-6 rounded-lg shadow-lg sticky top-28">
            <h2 className="text-2xl font-bold mb-4">{t('myPlaylists')}</h2>
            <p className="text-xs text-text-secondary mb-4">{t('offlineNote')}</p>
            
            <form onSubmit={handleCreatePlaylist} className="space-y-3 mb-6">
                <input
                    type="text"
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                    placeholder={t('playlistName')}
                    required
                    className="w-full px-3 py-2 bg-primary border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-accent text-sm"
                />
                {canCreatePublic && (
                     <div className="flex items-center">
                        <input type="checkbox" id="isPublic" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="h-4 w-4 rounded bg-primary border-gray-600 text-accent focus:ring-accent"/>
                        <label htmlFor="isPublic" className="ml-2 block text-sm text-text-secondary">{t('makePublic')}</label>
                    </div>
                )}
                <button type="submit" className="w-full bg-accent text-white px-4 py-2 rounded-md font-semibold hover:bg-opacity-90 text-sm">{t('createPlaylist')}</button>
            </form>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 -mr-2">
                {userPlaylists.map(playlist => <PlaylistCard key={playlist.id} playlist={playlist} canEdit={true} />)}

                {publicPlaylists.length > 0 && (
                    <>
                        <h2 className="text-2xl font-bold mb-4 pt-4 border-t border-gray-700">{t('publicPlaylists')}</h2>
                        {publicPlaylists.map(playlist => <PlaylistCard key={playlist.id} playlist={playlist} canEdit={false}/>)}
                    </>
                )}
            </div>
        </div>
    );
};

export default PlaylistManager;