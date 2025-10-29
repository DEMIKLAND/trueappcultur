
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Content, Comment, Role, User } from '../types';

const CommentItem: React.FC<{
    contentId: string,
    comment: Comment,
}> = ({ contentId, comment }) => {
    const { t } = useLanguage();
    const { currentUser } = useAuth();
    const { users, deleteComment, toggleCommentLike } = useData();
    
    const canModerate = currentUser?.role === Role.ADMIN || currentUser?.role === Role.MODERATOR;
    const hasLiked = currentUser && comment.likes?.includes(currentUser.id);

    const user = users.find(u => u.id === comment.userId);

    const roleColor = user ? {
        [Role.ADMIN]: 'text-red-500',
        [Role.MODERATOR]: 'text-green-600',
        [Role.USER]: 'text-blue-400',
    }[user.role] : 'text-blue-400';

    const badgeIcon = user && user.badge ? {
        note: '🎵',
        gear: '⚙️',
    }[user.badge] : null;


    const handleDelete = () => {
        if (window.confirm(t('confirmDelete'))) {
            deleteComment(contentId, comment.id);
        }
    };
    
    const handleLike = () => {
        if(currentUser){
            toggleCommentLike(contentId, comment.id, currentUser.id);
        }
    };

    return (
        <div className="flex items-start space-x-4 py-4 border-b border-gray-800">
            <div className="flex-shrink-0 h-10 w-10 bg-accent rounded-full flex items-center justify-center font-bold text-lg">
                {comment.userNickname.charAt(0).toUpperCase()}
            </div>
            <div className="flex-grow">
                <div className="flex justify-between items-center">
                    <div>
                         <span className={`font-bold ${roleColor}`}>
                             {comment.userNickname}
                             {badgeIcon && user?.role === Role.MODERATOR && <span className="ml-1">{badgeIcon}</span>}
                        </span>
                         <span className="text-xs text-text-secondary ml-2">{new Date(comment.createdAt).toLocaleString()}</span>
                    </div>
                     {(currentUser?.id === comment.userId || canModerate) && (
                        <button onClick={handleDelete} className="text-red-500 hover:text-red-400 p-1 text-xs">{t('delete')}</button>
                    )}
                </div>
                <p className="text-text-secondary mt-1">{comment.text}</p>
                <div className="flex items-center mt-2">
                    <button onClick={handleLike} className="flex items-center space-x-1 text-text-secondary hover:text-accent transition-colors text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${hasLiked ? 'text-accent' : ''}`} fill={hasLiked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" /></svg>
                        <span>{comment.likes?.length || 0}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

const ContentDetailPage: React.FC = () => {
    const { contentId } = useParams<{ contentId: string }>();
    const { content, addComment } = useData();
    const { language, t } = useLanguage();
    const { currentUser } = useAuth();
    const [newComment, setNewComment] = useState('');

    const currentContent = content.find(c => c.id === contentId);

    if (!currentContent) {
        return (
            <div className="text-center py-10">
                <h2 className="text-2xl text-accent">Content not found</h2>
                <Link to="/" className="text-text-primary hover:underline mt-4 inline-block">Back to dashboard</Link>
            </div>
        );
    }
    
    const title = language === 'ru' ? currentContent.title_ru : currentContent.title_en;
    const description = language === 'ru' ? currentContent.description_ru : currentContent.description_en;

    const handleAddComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (newComment.trim() && currentUser) {
            addComment(currentContent.id, currentUser.id, currentUser.nickname, newComment.trim());
            setNewComment('');
        }
    };
    
    const sortedComments = currentContent.comments?.slice().sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) || [];

    return (
        <div className="container mx-auto max-w-4xl">
            <div className="bg-secondary rounded-lg overflow-hidden shadow-lg">
                <img src={currentContent.imageUrl} alt={title} className="w-full h-96 object-cover" />
                <div className="p-6">
                    <h1 className="text-4xl font-bold mb-4">{title}</h1>
                    <div className="prose prose-invert text-text-secondary" dangerouslySetInnerHTML={{ __html: description }} />
                </div>
            </div>
            
            <div className="bg-secondary rounded-lg shadow-lg mt-8 p-6">
                <h2 className="text-2xl font-bold mb-4">{t('comments')} ({sortedComments.length})</h2>
                {currentUser && (
                     <form onSubmit={handleAddComment} className="flex gap-4 mb-6">
                         <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder={t('addComment')} required className="flex-grow px-4 py-2 bg-primary border border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-accent"/>
                         <button type="submit" className="bg-accent text-white px-6 py-2 rounded-full font-semibold hover:bg-opacity-90">{t('postComment')}</button>
                    </form>
                )}

                <div>
                    {sortedComments.length > 0 ? (
                        sortedComments.map(comment => <CommentItem key={comment.id} contentId={currentContent.id} comment={comment}/>)
                    ) : (
                        <p className="text-center text-text-secondary py-8">{t('noComments')}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContentDetailPage;