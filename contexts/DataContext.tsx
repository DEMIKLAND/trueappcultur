
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User, Role, Content, ContentType, Playlist, PlaylistItem, Comment, StreamSettings, StreamChatMessage } from '../types';
import { getInitialData } from '../services/localStorageService';

interface DataContextType {
    users: User[];
    content: Content[];
    playlists: Playlist[];
    streamSettings: StreamSettings | null;
    streamChatMessages: StreamChatMessage[];
    addUser: (nickname: string, email: string, pass: string, role: Role, badge?: 'note' | 'gear' | null) => User;
    updateUser: (updatedUser: User) => void;
    deleteUser: (userId: string) => void;
    addContent: (content: Omit<Content, 'id' | 'createdAt' | 'authorId' | 'likes' | 'comments'>, authorId: string) => void;
    updateContent: (updatedContent: Content) => void;
    deleteContent: (contentId: string) => void;
    addPlaylist: (name: string, userId: string, isPublic: boolean, authorNickname: string) => Playlist;
    deletePlaylist: (playlistId: string) => void;
    addContentToPlaylist: (playlistId: string, contentItem: Content) => void;
    removeContentFromPlaylist: (playlistId: string, contentId: string) => void;
    toggleLike: (contentId: string, userId: string) => void;
    addComment: (contentId: string, userId: string, userNickname: string, text: string) => void;
    deleteComment: (contentId: string, commentId: string) => void;
    toggleCommentLike: (contentId: string, commentId: string, userId: string) => void;
    updateStreamSettings: (settings: StreamSettings) => void;
    addStreamChatMessage: (userId: string, userNickname: string, text: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [content, setContent] = useState<Content[]>([]);
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [streamSettings, setStreamSettings] = useState<StreamSettings | null>(null);
    const [streamChatMessages, setStreamChatMessages] = useState<StreamChatMessage[]>([]);

    useEffect(() => {
        const { users, content, playlists, stream, streamChatMessages } = getInitialData();
        setUsers(users);
        setContent(content);
        setPlaylists(playlists);
        setStreamSettings(stream);
        setStreamChatMessages(streamChatMessages);
    }, []);

    useEffect(() => { try { localStorage.setItem('cultur_users', JSON.stringify(users)); } catch (e) { console.error(e); } }, [users]);
    useEffect(() => { try { localStorage.setItem('cultur_content', JSON.stringify(content)); } catch (e) { console.error(e); } }, [content]);
    useEffect(() => { try { localStorage.setItem('cultur_playlists', JSON.stringify(playlists)); } catch (e) { console.error(e); } }, [playlists]);
    useEffect(() => { try { if(streamSettings) localStorage.setItem('cultur_stream', JSON.stringify(streamSettings)); } catch (e) { console.error(e); } }, [streamSettings]);
    useEffect(() => { try { localStorage.setItem('cultur_stream_chat', JSON.stringify(streamChatMessages)); } catch (e) { console.error(e); } }, [streamChatMessages]);

    const addUser = (nickname: string, email: string, pass: string, role: Role, badge: 'note' | 'gear' | null = null): User => {
        const newUser: User = { id: `user_${Date.now()}`, nickname, email, passwordHash: pass, role, badge };
        setUsers(prev => [...prev, newUser]);
        return newUser;
    };
    
    const updateUser = (updatedUser: User) => setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    const deleteUser = (userId: string) => setUsers(prev => prev.filter(u => u.id !== userId));

    const addContent = (newContent: Omit<Content, 'id' | 'createdAt' | 'authorId' | 'likes' | 'comments'>, authorId: string) => {
        const fullContent: Content = { ...newContent, id: `content_${Date.now()}`, authorId, createdAt: new Date().toISOString(), likes: [], comments: [] };
        setContent(prev => [fullContent, ...prev]);
    };
    
    const updateContent = (updatedContent: Content) => setContent(prev => prev.map(c => c.id === updatedContent.id ? updatedContent : c));
    const deleteContent = (contentId: string) => setContent(prev => prev.filter(c => c.id !== contentId));

    const addPlaylist = (name: string, userId: string, isPublic: boolean, authorNickname: string): Playlist => {
        const newPlaylist: Playlist = { id: `playlist_${Date.now()}`, name, userId, items: [], isPublic, authorNickname };
        setPlaylists(prev => [...prev, newPlaylist]);
        return newPlaylist;
    };

    const deletePlaylist = (playlistId: string) => setPlaylists(prev => prev.filter(p => p.id !== playlistId));

    const addContentToPlaylist = (playlistId: string, contentItem: Content) => {
        setPlaylists(prev => prev.map(p => {
            if (p.id === playlistId && !p.items.some(item => item.contentId === contentItem.id)) {
                const newPlaylistItem: PlaylistItem = { contentId: contentItem.id, title: contentItem.title_en, imageUrl: contentItem.imageUrl, type: contentItem.type };
                return { ...p, items: [...p.items, newPlaylistItem] };
            }
            return p;
        }));
    };
    
    const removeContentFromPlaylist = (playlistId: string, contentId: string) => {
        setPlaylists(prev => prev.map(p => p.id === playlistId ? { ...p, items: p.items.filter(item => item.contentId !== contentId) } : p));
    };

    const toggleLike = (contentId: string, userId: string) => {
        setContent(prev => prev.map(c => {
            if (c.id === contentId) {
                const likes = c.likes || [];
                return likes.includes(userId) ? { ...c, likes: likes.filter(id => id !== userId) } : { ...c, likes: [...likes, userId] };
            }
            return c;
        }));
    };

    const addComment = (contentId: string, userId: string, userNickname: string, text: string) => {
        const newComment: Comment = { id: `comment_${Date.now()}`, userId, userNickname, text, createdAt: new Date().toISOString(), likes: [] };
        setContent(prev => prev.map(c => c.id === contentId ? { ...c, comments: [...(c.comments || []), newComment] } : c));
    };

    const deleteComment = (contentId: string, commentId: string) => {
        setContent(prev => prev.map(c => c.id === contentId ? { ...c, comments: c.comments.filter(comment => comment.id !== commentId) } : c));
    };

    const toggleCommentLike = (contentId: string, commentId: string, userId: string) => {
        setContent(prev => prev.map(c => {
            if (c.id === contentId) {
                const updatedComments = c.comments.map(comment => {
                    if (comment.id === commentId) {
                        const likes = comment.likes || [];
                        return likes.includes(userId) ? { ...comment, likes: likes.filter(id => id !== userId) } : { ...comment, likes: [...likes, userId] };
                    }
                    return comment;
                });
                return { ...c, comments: updatedComments };
            }
            return c;
        }));
    };

    const updateStreamSettings = (settings: StreamSettings) => {
        setStreamSettings(settings);
    };

    const addStreamChatMessage = (userId: string, userNickname: string, text: string) => {
        const newMessage: StreamChatMessage = { id: `msg_${Date.now()}`, userId, userNickname, text, createdAt: new Date().toISOString() };
        setStreamChatMessages(prev => [...prev, newMessage].slice(-100)); // Keep last 100 messages
    };

    return (
        <DataContext.Provider value={{ 
            users, content, playlists, streamSettings, streamChatMessages,
            addUser, updateUser, deleteUser,
            addContent, updateContent, deleteContent,
            addPlaylist, deletePlaylist, addContentToPlaylist, removeContentFromPlaylist,
            toggleLike, addComment, deleteComment, toggleCommentLike,
            updateStreamSettings, addStreamChatMessage
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = (): DataContextType => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};