import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User, Role, Content, ContentType, Playlist, PlaylistItem, Comment, StreamSettings, StreamChatMessage } from '../types';

interface DataContextType {
    users: User[];
    content: Content[];
    playlists: Playlist[];
    streamSettings: StreamSettings | null;
    streamChatMessages: StreamChatMessage[];
    addUser: (nickname: string, email: string, pass: string, role: Role, badge?: 'note' | 'gear' | null) => Promise<User>;
    updateUser: (updatedUser: User) => Promise<void>;
    deleteUser: (userId: string) => Promise<void>;
    addContent: (content: Omit<Content, 'id' | 'createdAt' | 'authorId' | 'likes' | 'comments'>, authorId: string) => Promise<void>;
    updateContent: (updatedContent: Content) => Promise<void>;
    deleteContent: (contentId: string) => Promise<void>;
    addPlaylist: (name: string, userId: string, isPublic: boolean, authorNickname: string) => Promise<Playlist>;
    deletePlaylist: (playlistId: string) => Promise<void>;
    addContentToPlaylist: (playlistId: string, contentItem: Content) => Promise<void>;
    removeContentFromPlaylist: (playlistId: string, contentId: string) => Promise<void>;
    toggleLike: (contentId: string, userId: string) => Promise<void>;
    addComment: (contentId: string, userId: string, userNickname: string, text: string) => Promise<void>;
    deleteComment: (contentId: string, commentId: string) => Promise<void>;
    toggleCommentLike: (contentId: string, commentId: string, userId: string) => Promise<void>;
    updateStreamSettings: (settings: StreamSettings) => Promise<void>;
    addStreamChatMessage: (userId: string, userNickname: string, text: string) => Promise<void>;
    loading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const API_BASE = '/.netlify/functions';

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [content, setContent] = useState<Content[]>([]);
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [streamSettings, setStreamSettings] = useState<StreamSettings | null>(null);
    const [streamChatMessages, setStreamChatMessages] = useState<StreamChatMessage[]>([]);
    const [loading, setLoading] = useState(true);

    // Загрузка всех данных при старте
    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setLoading(true);
                
                // Загружаем пользователей
                const usersResponse = await fetch(`${API_BASE}/get-users`);
                if (usersResponse.ok) {
                    const usersData = await usersResponse.json();
                    setUsers(usersData);
                }

                // Загружаем контент
                const contentResponse = await fetch(`${API_BASE}/get-full-content`);
                if (contentResponse.ok) {
                    const contentData = await contentResponse.json();
                    setContent(contentData);
                }

                // Загружаем плейлисты
                const playlistsResponse = await fetch(`${API_BASE}/get-playlists`);
                if (playlistsResponse.ok) {
                    const playlistsData = await playlistsResponse.json();
                    setPlaylists(playlistsData);
                }

                // Загружаем настройки стрима
                const streamResponse = await fetch(`${API_BASE}/get-stream-settings`);
                if (streamResponse.ok) {
                    const streamData = await streamResponse.json();
                    setStreamSettings(streamData[0] || null);
                }

                // Загружаем сообщения чата
                const chatResponse = await fetch(`${API_BASE}/get-stream-chat`);
                if (chatResponse.ok) {
                    const chatData = await chatResponse.json();
                    setStreamChatMessages(chatData);
                }

            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []);

    // Users
    const addUser = async (nickname: string, email: string, pass: string, role: Role, badge: 'note' | 'gear' | null = null): Promise<User> => {
        const response = await fetch(`${API_BASE}/add-user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nickname, email, password_hash: pass, role, badge })
        });

        if (response.ok) {
            const newUser = await response.json();
            setUsers(prev => [...prev, newUser]);
            return newUser;
        }
        throw new Error('Failed to add user');
    };

    const updateUser = async (updatedUser: User) => {
        const response = await fetch(`${API_BASE}/update-user`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedUser)
        });

        if (response.ok) {
            setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
        } else {
            throw new Error('Failed to update user');
        }
    };

    const deleteUser = async (userId: string) => {
        const response = await fetch(`${API_BASE}/delete-user`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: userId })
        });

        if (response.ok) {
            setUsers(prev => prev.filter(u => u.id !== userId));
        } else {
            throw new Error('Failed to delete user');
        }
    };

    // Content
    const addContent = async (newContent: Omit<Content, 'id' | 'createdAt' | 'authorId' | 'likes' | 'comments'>, authorId: string) => {
        const response = await fetch(`${API_BASE}/add-content`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...newContent, author_id: authorId })
        });

        if (response.ok) {
            const savedContent = await response.json();
            setContent(prev => [savedContent, ...prev]);
        } else {
            throw new Error('Failed to add content');
        }
    };

    const updateContent = async (updatedContent: Content) => {
        const response = await fetch(`${API_BASE}/update-content`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedContent)
        });

        if (response.ok) {
            setContent(prev => prev.map(c => c.id === updatedContent.id ? updatedContent : c));
        } else {
            throw new Error('Failed to update content');
        }
    };

    const deleteContent = async (contentId: string) => {
        const response = await fetch(`${API_BASE}/delete-content`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: contentId })
        });

        if (response.ok) {
            setContent(prev => prev.filter(c => c.id !== contentId));
        } else {
            throw new Error('Failed to delete content');
        }
    };

    // Playlists
    const addPlaylist = async (name: string, userId: string, isPublic: boolean, authorNickname: string): Promise<Playlist> => {
        const response = await fetch(`${API_BASE}/add-playlist`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, user_id: userId, is_public: isPublic, author_nickname: authorNickname })
        });

        if (response.ok) {
            const newPlaylist = await response.json();
            setPlaylists(prev => [...prev, newPlaylist]);
            return newPlaylist;
        }
        throw new Error('Failed to add playlist');
    };

    const deletePlaylist = async (playlistId: string) => {
        const response = await fetch(`${API_BASE}/delete-playlist`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: playlistId })
        });

        if (response.ok) {
            setPlaylists(prev => prev.filter(p => p.id !== playlistId));
        } else {
            throw new Error('Failed to delete playlist');
        }
    };

    const addContentToPlaylist = async (playlistId: string, contentItem: Content) => {
        const response = await fetch(`${API_BASE}/add-to-playlist`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                playlist_id: playlistId,
                content_id: contentItem.id,
                title: contentItem.title_en,
                image_url: contentItem.imageUrl,
                type: contentItem.type
            })
        });

        if (response.ok) {
            setPlaylists(prev => prev.map(p => {
                if (p.id === playlistId && !p.items.some(item => item.contentId === contentItem.id)) {
                    const newItem: PlaylistItem = {
                        contentId: contentItem.id,
                        title: contentItem.title_en,
                        imageUrl: contentItem.imageUrl,
                        type: contentItem.type
                    };
                    return { ...p, items: [...p.items, newItem] };
                }
                return p;
            }));
        } else {
            throw new Error('Failed to add content to playlist');
        }
    };

    const removeContentFromPlaylist = async (playlistId: string, contentId: string) => {
        const response = await fetch(`${API_BASE}/remove-from-playlist`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ playlist_id: playlistId, content_id: contentId })
        });

        if (response.ok) {
            setPlaylists(prev => prev.map(p => 
                p.id === playlistId 
                    ? { ...p, items: p.items.filter(item => item.contentId !== contentId) }
                    : p
            ));
        } else {
            throw new Error('Failed to remove content from playlist');
        }
    };

    // Likes and Comments
    const toggleLike = async (contentId: string, userId: string) => {
        const isCurrentlyLiked = content.find(c => c.id === contentId)?.likes.includes(userId);
        const action = isCurrentlyLiked ? 'unlike' : 'like';

        const response = await fetch(`${API_BASE}/toggle-like`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content_id: contentId, user_id: userId, action })
        });

        if (response.ok) {
            setContent(prev => prev.map(c => {
                if (c.id === contentId) {
                    const likes = c.likes || [];
                    return action === 'like' 
                        ? { ...c, likes: [...likes, userId] }
                        : { ...c, likes: likes.filter(id => id !== userId) };
                }
                return c;
            }));
        } else {
            throw new Error('Failed to toggle like');
        }
    };

    const addComment = async (contentId: string, userId: string, userNickname: string, text: string) => {
        const response = await fetch(`${API_BASE}/add-comment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content_id: contentId, user_id: userId, user_nickname: userNickname, text })
        });

        if (response.ok) {
            const newComment = await response.json();
            setContent(prev => prev.map(c => 
                c.id === contentId 
                    ? { ...c, comments: [...(c.comments || []), newComment] }
                    : c
            ));
        } else {
            throw new Error('Failed to add comment');
        }
    };

    const deleteComment = async (contentId: string, commentId: string) => {
        const response = await fetch(`${API_BASE}/delete-comment`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: commentId })
        });

        if (response.ok) {
            setContent(prev => prev.map(c => 
                c.id === contentId 
                    ? { ...c, comments: c.comments.filter(comment => comment.id !== commentId) }
                    : c
            ));
        } else {
            throw new Error('Failed to delete comment');
        }
    };

    const toggleCommentLike = async (contentId: string, commentId: string, userId: string) => {
        const comment = content.find(c => c.id === contentId)?.comments.find(com => com.id === commentId);
        const isCurrentlyLiked = comment?.likes.includes(userId);
        const action = isCurrentlyLiked ? 'unlike' : 'like';

        const response = await fetch(`${API_BASE}/toggle-comment-like`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ comment_id: commentId, user_id: userId, action })
        });

        if (response.ok) {
            setContent(prev => prev.map(c => {
                if (c.id === contentId) {
                    const updatedComments = c.comments.map(comment => {
                        if (comment.id === commentId) {
                            const likes = comment.likes || [];
                            return action === 'like' 
                                ? { ...comment, likes: [...likes, userId] }
                                : { ...comment, likes: likes.filter(id => id !== userId) };
                        }
                        return comment;
                    });
                    return { ...c, comments: updatedComments };
                }
                return c;
            }));
        } else {
            throw new Error('Failed to toggle comment like');
        }
    };

    // Stream
    const updateStreamSettings = async (settings: StreamSettings) => {
        const response = await fetch(`${API_BASE}/update-stream-settings`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings)
        });

        if (response.ok) {
            setStreamSettings(settings);
        } else {
            throw new Error('Failed to update stream settings');
        }
    };

    const addStreamChatMessage = async (userId: string, userNickname: string, text: string) => {
        const response = await fetch(`${API_BASE}/add-stream-chat-message`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, user_nickname: userNickname, text })
        });

        if (response.ok) {
            const newMessage = await response.json();
            setStreamChatMessages(prev => [...prev, newMessage].slice(-100));
        } else {
            throw new Error('Failed to add stream chat message');
        }
    };

    const value = {
        users, content, playlists, streamSettings, streamChatMessages, loading,
        addUser, updateUser, deleteUser,
        addContent, updateContent, deleteContent,
        addPlaylist, deletePlaylist, addContentToPlaylist, removeContentFromPlaylist,
        toggleLike, addComment, deleteComment, toggleCommentLike,
        updateStreamSettings, addStreamChatMessage
    };

    return (
        <DataContext.Provider value={value}>
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
