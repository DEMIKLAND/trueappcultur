
import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Role, StreamSettings, User } from '../types';

const LiveStream: React.FC = () => {
    const { streamSettings, streamChatMessages, updateStreamSettings, addStreamChatMessage, users } = useData();
    const { currentUser } = useAuth();
    const { t, language } = useLanguage();

    const [timeLeft, setTimeLeft] = useState('');
    const [isLive, setIsLive] = useState(false);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [formState, setFormState] = useState<StreamSettings>({ title_en: '', title_ru: '', startTime: '', embedHtml: '' });
    const [chatMessage, setChatMessage] = useState('');
    const chatContainerRef = useRef<HTMLDivElement>(null);

    const canManageStream = currentUser?.role === Role.ADMIN || currentUser?.role === Role.MODERATOR;

    useEffect(() => {
        if (streamSettings) {
            setFormState(streamSettings);
            const interval = setInterval(() => {
                const startTime = new Date(streamSettings.startTime).getTime();
                const now = new Date().getTime();
                const distance = startTime - now;

                if (distance < 0) {
                    setTimeLeft('');
                    setIsLive(true);
                    clearInterval(interval);
                } else {
                    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                    setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
                    setIsLive(false);
                }
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [streamSettings]);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [streamChatMessages]);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormState({ ...formState, [e.target.name]: e.target.value });
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateStreamSettings(formState);
        setIsEditorOpen(false);
    };

    const handleChatSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (chatMessage.trim() && currentUser) {
            addStreamChatMessage(currentUser.id, currentUser.nickname, chatMessage.trim());
            setChatMessage('');
        }
    };
    
    const EMOJIS = ['👍', '❤️', '😂', '🔥', '🎉'];

    if (!streamSettings) return <div className="bg-secondary p-4 rounded-lg text-center">{t('loading')}...</div>;

    const streamTitle = language === 'ru' ? streamSettings.title_ru : streamSettings.title_en;

    const roleColor: Record<Role, string> = {
        [Role.ADMIN]: 'text-red-500',
        [Role.MODERATOR]: 'text-green-600',
        [Role.USER]: 'text-blue-400',
    };

    const badgeIcon: Record<'note' | 'gear', string> = {
        note: '🎵',
        gear: '⚙️',
    };

    return (
        <div className="bg-secondary rounded-lg shadow-lg p-4 mb-8">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-accent">{t('liveStream')}</h2>
                {canManageStream && (
                    <button onClick={() => setIsEditorOpen(!isEditorOpen)} className="bg-accent/20 text-accent px-3 py-1 rounded-md text-sm font-semibold hover:bg-accent/40">
                        {isEditorOpen ? t('cancel') : t('edit')}
                    </button>
                )}
            </div>
            
            {isEditorOpen && canManageStream && (
                <form onSubmit={handleFormSubmit} className="space-y-3 p-4 bg-primary rounded-md mb-4">
                     <input type="text" name="title_en" value={formState.title_en} onChange={handleFormChange} placeholder={t('streamTitle') + ' (EN)'} className="w-full px-3 py-2 bg-secondary border border-gray-600 rounded-md text-sm"/>
                     <input type="text" name="title_ru" value={formState.title_ru} onChange={handleFormChange} placeholder={t('streamTitle') + ' (RU)'} className="w-full px-3 py-2 bg-secondary border border-gray-600 rounded-md text-sm"/>
                     <input type="datetime-local" name="startTime" value={formState.startTime.substring(0, 16)} onChange={handleFormChange} placeholder={t('startTime')} className="w-full px-3 py-2 bg-secondary border border-gray-600 rounded-md text-sm"/>
                     <textarea name="embedHtml" value={formState.embedHtml} onChange={handleFormChange} placeholder={t('embedCode')} rows={3} className="w-full px-3 py-2 bg-secondary border border-gray-600 rounded-md text-sm"/>
                     <button type="submit" className="w-full bg-accent text-white py-2 rounded-md font-semibold">{t('updateStream')}</button>
                </form>
            )}

            {!isLive ? (
                 <div className="text-center py-8">
                    <h3 className="text-xl md:text-3xl font-semibold mb-2">{streamTitle}</h3>
                    <p className="text-text-secondary mb-4">{t('streamStartsIn')}</p>
                    <p className="text-3xl md:text-5xl font-mono font-bold text-accent tracking-wider">{timeLeft}</p>
                </div>
            ) : (
                <div>
                     <h3 className="text-2xl font-semibold mb-4 text-center">{streamTitle}</h3>
                     <div className="flex flex-col md:flex-row gap-4">
                        <div className="w-full md:w-2/3 aspect-video bg-black rounded-lg overflow-hidden" dangerouslySetInnerHTML={{ __html: streamSettings.embedHtml }} />
                        <div className="w-full md:w-1/3 flex flex-col bg-primary rounded-lg p-3 h-[60vh] md:h-auto">
                            <h4 className="font-bold mb-2 border-b border-gray-700 pb-2">{t('liveChat')}</h4>
                            <div ref={chatContainerRef} className="flex-grow space-y-2 overflow-y-auto pr-2 -mr-2 mb-2">
                                {streamChatMessages.map(msg => {
                                    const user = users.find(u => u.id === msg.userId);
                                    return (
                                    <div key={msg.id} className="text-sm">
                                        <span className={`font-semibold mr-2 ${user ? roleColor[user.role] : roleColor[Role.USER]}`}>
                                            {msg.userNickname}
                                            {user?.badge && user.role === Role.MODERATOR && <span className="ml-1">{badgeIcon[user.badge]}</span>}
                                        </span>
                                        <span className="text-text-secondary break-words">{msg.text}</span>
                                    </div>
                                )})}
                            </div>
                            <form onSubmit={handleChatSubmit} className="flex-shrink-0">
                                <div className="flex gap-1 mb-2">
                                    {EMOJIS.map(emoji => <button type="button" key={emoji} onClick={() => setChatMessage(p => p + emoji)} className="p-1 rounded bg-secondary hover:bg-gray-700 text-lg">{emoji}</button>)}
                                </div>
                                <div className="flex gap-2">
                                    <input type="text" value={chatMessage} onChange={e => setChatMessage(e.target.value)} placeholder={t('sendMessage')} className="flex-grow px-3 py-2 bg-secondary border border-gray-600 rounded-md text-sm"/>
                                    <button type="submit" className="bg-accent text-white px-4 rounded-md font-semibold text-sm">{t('send')}</button>
                                </div>
                            </form>
                        </div>
                     </div>
                </div>
            )}
        </div>
    );
};

export default LiveStream;