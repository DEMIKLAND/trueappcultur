
import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Content, ContentType, Role } from '../types';
// import { generateAIDescription } from '../services/geminiService';

const ContentManagement: React.FC = () => {
    const { content, addContent, updateContent, deleteContent } = useData();
    const { t } = useLanguage();
    const { currentUser } = useAuth();

    const initialFormState = {
        title_en: '', title_ru: '',
        description_en: '', description_ru: '',
        imageUrl: '', url: '',
        type: ContentType.NEWS,
        tags: '',
    };

    const [isFormVisible, setIsFormVisible] = useState(false);
    const [editingContent, setEditingContent] = useState<Content | null>(null);
    const [formData, setFormData] = useState(initialFormState);
    const [isGenerating, setIsGenerating] = useState(false);
    const [fileName, setFileName] = useState('');

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (loadEvent) => {
                setFormData({ ...formData, url: loadEvent.target?.result as string });
                setFileName(file.name);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const resetForm = () => {
        setFormData(initialFormState);
        setEditingContent(null);
        setIsFormVisible(false);
        setFileName('');
    };

    const handleEdit = (c: Content) => {
        setEditingContent(c);
        setFormData({
            title_en: c.title_en,
            title_ru: c.title_ru,
            description_en: c.description_en,
            description_ru: c.description_ru,
            imageUrl: c.imageUrl,
            url: c.url,
            type: c.type,
            tags: c.tags?.join(', ') || ''
        });
        setIsFormVisible(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;
        
        const contentData = {
            ...formData,
            tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        };

        if (editingContent) {
            updateContent({ ...editingContent, ...contentData });
        } else {
            addContent(contentData, currentUser.id);
        }
        resetForm();
    };
    
    const canManageContent = currentUser?.role === Role.ADMIN || currentUser?.role === Role.MODERATOR;

    if (!canManageContent) return <p>You do not have permission to manage content.</p>;
    
    const isAudioUpload = formData.type === ContentType.MIXES || formData.type === ContentType.RELEASES;

    return (
        <div className="bg-secondary p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">{t('contentManagement')}</h2>
                <button onClick={() => { resetForm(); setIsFormVisible(!isFormVisible); }} className="bg-accent text-white px-4 py-2 rounded-md font-semibold hover:bg-opacity-90">{isFormVisible ? t('cancel') : t('publish')}</button>
            </div>

            {isFormVisible && (
                <form onSubmit={handleSubmit} className="space-y-4 mb-8 p-4 bg-primary rounded-md">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="title_en" value={formData.title_en} onChange={handleFormChange} placeholder={t('title_en')} required className="px-3 py-2 bg-secondary border border-gray-600 rounded-md"/>
                        <input name="title_ru" value={formData.title_ru} onChange={handleFormChange} placeholder={t('title_ru')} required className="px-3 py-2 bg-secondary border border-gray-600 rounded-md"/>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <textarea name="description_en" value={formData.description_en} onChange={handleFormChange} placeholder={t('description_en') + ' (HTML supported)'} required rows={4} className="w-full px-3 py-2 bg-secondary border border-gray-600 rounded-md"/>
                        <textarea name="description_ru" value={formData.description_ru} onChange={handleFormChange} placeholder={t('description_ru') + ' (HTML supported)'} required rows={4} className="w-full px-3 py-2 bg-secondary border border-gray-600 rounded-md"/>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="imageUrl" value={formData.imageUrl} onChange={handleFormChange} placeholder={t('imageURL')} required className="px-3 py-2 bg-secondary border border-gray-600 rounded-md"/>
                        <select name="type" value={formData.type} onChange={handleFormChange} className="px-3 py-2 bg-secondary border border-gray-600 rounded-md">
                            <option value={ContentType.NEWS}>{t('news')}</option>
                            <option value={ContentType.VIDEO}>{t('videos')}</option>
                            <option value={ContentType.MIXES}>{t('mixes')}</option>
                            <option value={ContentType.RELEASES}>{t('releases')}</option>
                        </select>
                    </div>
                    
                    {isAudioUpload ? (
                        <div>
                             <label htmlFor="audio-upload" className="block text-sm font-medium text-text-secondary mb-1">{t('uploadAudio')}</label>
                             <input id="audio-upload" type="file" accept="audio/*" onChange={handleFileChange} className="w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-white hover:file:bg-opacity-90"/>
                             {fileName && <p className="text-xs text-green-400 mt-1">File: {fileName}</p>}
                        </div>
                    ) : (
                        <input name="url" value={formData.url} onChange={handleFormChange} placeholder={t('contentURL')} required className="w-full px-3 py-2 bg-secondary border border-gray-600 rounded-md"/>
                    )}

                     <input name="tags" value={formData.tags} onChange={handleFormChange} placeholder="Tags (comma-separated, e.g. rock, live)" className="w-full px-3 py-2 bg-secondary border border-gray-600 rounded-md"/>
                    <button type="submit" className="w-full py-2 font-semibold text-white bg-accent rounded-md hover:bg-opacity-90">{editingContent ? t('save') : t('publish')}</button>
                </form>
            )}

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-primary">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">{t('title')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">{t('type')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">{t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-secondary divide-y divide-gray-700">
                        {content.map(c => (
                            <tr key={c.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">{c.title_en} / {c.title_ru}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{c.type}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                    <button onClick={() => handleEdit(c)} className="text-indigo-400 hover:text-indigo-300">{t('edit')}</button>
                                    <button onClick={() => window.confirm(t('confirmDelete')) && deleteContent(c.id)} className="text-red-500 hover:text-red-400">{t('delete')}</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ContentManagement;
