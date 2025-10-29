
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Content } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { usePlayer } from '../contexts/PlayerContext';


interface ContentCardProps {
    content: Content;
    onTagClick: (tag: string) => void;
}

const ContentCard: React.FC<ContentCardProps> = ({ content, onTagClick }) => {
    const { t, language } = useLanguage();
    const { playlists, addContentToPlaylist, addPlaylist, toggleLike } = useData();
    const { currentUser } = useAuth();
    const { playTrack } = usePlayer();
    const [showPlaylistModal, setShowPlaylistModal] = useState(false);
    const [newPlaylistName, setNewPlaylistName] = useState('');

    const userPlaylists = playlists.filter(p => p.userId === currentUser?.id);
    
    const title = language === 'ru' ? content.title_ru : content.title_en;
    const description = language === 'ru' ? content.description_ru : content.description_en;
    
    const hasLiked = currentUser && content.likes?.includes(currentUser.id);

    const handleAddToPlaylist = (playlistId: string) => {
        addContentToPlaylist(playlistId, content);
        setShowPlaylistModal(false);
    };

    const handleCreateAndAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPlaylistName.trim() && currentUser) {
            const newPlaylist = addPlaylist(newPlaylistName.trim(), currentUser.id, false, currentUser.nickname);
            if(newPlaylist){
                addContentToPlaylist(newPlaylist.id, content);
            }
            setNewPlaylistName('');
            setShowPlaylistModal(false);
        }
    };
    
    const handlePlay = () => {
        playTrack(content);
    };

    const handleLike = () => {
        if (currentUser) {
            toggleLike(content.id, currentUser.id);
        }
    };

    return (
        <div className="bg-secondary rounded-lg overflow-hidden shadow-lg group flex flex-col">
            <div className="relative">
                <img src={content.imageUrl} alt={title} className="w-full h-64 object-cover"/>

                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>
                 <div className="absolute bottom-0 left-0 p-4">
                     <h3 className="text-2xl font-bold text-white line-clamp-2">{title}</h3>
                 </div>

                <button onClick={handlePlay} className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black bg-opacity-50" aria-label={`Play ${title}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                </button>
                
                 <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button onClick={() => setShowPlaylistModal(true)} title={t('addToPlaylist')} className="bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-80 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                    </button>
                 </div>
            </div>
            <div className="p-4 flex-grow flex flex-col">
                 <div className="text-text-secondary text-sm mb-4 flex-grow line-clamp-3" dangerouslySetInnerHTML={{ __html: description }} />
                 
                 <div className="flex items-center space-x-4 text-text-secondary py-2 border-t border-gray-700">
                    <button onClick={handleLike} className="flex items-center space-x-1 hover:text-accent transition-colors" title={t('like')}>
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${hasLiked ? 'text-accent' : ''}`} fill={hasLiked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" /></svg>
                        <span>{content.likes?.length || 0}</span>
                    </button>
                    <Link to={`/content/${content.id}`} className="flex items-center space-x-1 hover:text-accent transition-colors" title={t('comments')}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                        <span>{content.comments?.length || 0}</span>
                    </Link>
                </div>

                 {content.tags && content.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-700 mt-2">
                        {content.tags.map(tag => (
                            <button key={tag} onClick={() => onTagClick(`#${tag}`)} className="px-3 py-1 bg-primary text-text-secondary text-xs font-semibold rounded-full hover:bg-accent hover:text-white transition-colors">
                                #{tag}
                            </button>
                        ))}
                    </div>
                )}
            </div>
            
            {showPlaylistModal && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={() => setShowPlaylistModal(false)}>
                    <div className="bg-secondary p-6 rounded-lg shadow-xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
                        <h4 className="text-lg font-bold mb-4">{t('addToPlaylist')}</h4>
                        
                        <form onSubmit={handleCreateAndAdd} className="flex gap-2 mb-4 pb-4 border-b border-gray-700">
                             <input
                                type="text"
                                value={newPlaylistName}
                                onChange={(e) => setNewPlaylistName(e.target.value)}
                                placeholder={t('playlistName')}
                                required
                                className="flex-grow px-3 py-2 bg-primary border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-accent text-sm"
                            />
                            <button type="submit" className="bg-accent text-white px-4 rounded-md font-semibold hover:bg-opacity-90 text-sm">{t('createPlaylist')}</button>
                        </form>
                        
                        <h5 className="text-md font-semibold mb-2 text-text-secondary">Existing Playlists</h5>
                        {userPlaylists.length > 0 ? (
                            <ul className="space-y-2 max-h-40 overflow-y-auto">
                                {userPlaylists.map(playlist => (
                                    <li key={playlist.id}>
                                        <button onClick={() => handleAddToPlaylist(playlist.id)} className="w-full text-left p-2 rounded hover:bg-primary transition-colors">
                                            {playlist.name}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-text-secondary text-sm text-center py-4">No playlists yet. Create one above.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContentCard;