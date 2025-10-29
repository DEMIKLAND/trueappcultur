
import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { ContentType } from '../types';
import ContentCard from './ContentCard';
import PlaylistManager from './PlaylistManager';
import LiveStream from './LiveStream';

const Dashboard: React.FC = () => {
    const { content } = useData();
    const { t } = useLanguage();
    const [filter, setFilter] = useState<ContentType | 'ALL'>('ALL');
    const [tagSearch, setTagSearch] = useState('');

    const filteredContent = content
        .filter(c => filter === 'ALL' || c.type === filter)
        .filter(c => 
            !tagSearch.trim() || 
            (c.tags && c.tags.some(tag => tag.toLowerCase().includes(tagSearch.trim().toLowerCase().replace('#',''))))
        );

    const FilterButton: React.FC<{ type: ContentType | 'ALL'; label: string }> = ({ type, label }) => (
        <button
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${filter === type ? 'bg-accent text-white' : 'bg-primary hover:bg-gray-800'}`}
        >
            {label}
        </button>
    );

    return (
        <div className="container mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <LiveStream />

                <h1 className="text-3xl font-bold my-6 text-text-primary">{t('newsFeed')}</h1>

                <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
                    <div className="flex space-x-2 overflow-x-auto pb-2 w-full">
                        <FilterButton type="ALL" label={t('all')} />
                        <FilterButton type={ContentType.NEWS} label={t('news')} />
                        <FilterButton type={ContentType.VIDEO} label={t('videos')} />
                        <FilterButton type={ContentType.MIXES} label={t('mixes')} />
                        <FilterButton type={ContentType.RELEASES} label={t('releases')} />
                    </div>
                    <div className="relative w-full md:w-auto flex-shrink-0">
                        <input 
                            type="text"
                            value={tagSearch}
                            onChange={(e) => setTagSearch(e.target.value)}
                            placeholder="Search by #style..."
                            className="w-full md:w-64 px-4 py-2 bg-primary border border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-accent text-sm"
                        />
                         <span className="absolute right-4 top-2.5 text-text-secondary pointer-events-none">#</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredContent.map(item => (
                        <ContentCard key={item.id} content={item} onTagClick={setTagSearch} />
                    ))}
                </div>
            </div>
            <div className="lg:col-span-1">
                 <PlaylistManager />
            </div>
        </div>
    );
};

export default Dashboard;