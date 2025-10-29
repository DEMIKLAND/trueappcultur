
import { User, Content, Playlist, Role, ContentType, StreamSettings, StreamChatMessage } from '../types';

export const getInitialData = () => {
    let users = JSON.parse(localStorage.getItem('cultur_users') || '[]') as User[];
    let content = JSON.parse(localStorage.getItem('cultur_content') || '[]') as Content[];
    let playlists = JSON.parse(localStorage.getItem('cultur_playlists') || '[]') as Playlist[];
    let stream = JSON.parse(localStorage.getItem('cultur_stream') || 'null') as StreamSettings | null;
    let streamChatMessages = JSON.parse(localStorage.getItem('cultur_stream_chat') || '[]') as StreamChatMessage[];

    // Add admin user if not present
    if (!users.some(u => u.role === Role.ADMIN)) {
        const adminUser: User = {
            id: 'admin_001',
            nickname: 'Admin',
            email: 'admin',
            passwordHash: 'admin',
            role: Role.ADMIN,
            badge: null
        };
        users.push(adminUser);
        localStorage.setItem('cultur_users', JSON.stringify(users));
    }
    
    // Add sample content if none exists
    if (content.length === 0) {
        const adminId = users.find(u => u.role === Role.ADMIN)?.id || 'admin_001';
        content = [
            {
                id: 'news_001',
                type: ContentType.NEWS,
                title_en: 'Cultur Platform Launch',
                title_ru: 'Запуск платформы Cultur',
                description_en: 'The new multimedia platform Cultur has officially launched, bringing together music, videos, and news in one place.',
                description_ru: 'Новая мультимедийная платформа Cultur официально запущена, объединяя музыку, видео и новости в одном месте.',
                url: '#',
                imageUrl: 'https://picsum.photos/seed/news1/600/400',
                authorId: adminId,
                createdAt: new Date().toISOString(),
                likes: [],
                comments: [],
            },
            {
                id: 'video_001',
                type: ContentType.VIDEO,
                title_en: 'Live Concert: The Rockers',
                title_ru: 'Живой концерт: The Rockers',
                description_en: 'An exclusive recording of The Rockers\' latest live performance. Experience the energy!',
                description_ru: 'Эксклюзивная запись последнего живого выступления The Rockers. Почувствуйте энергию!',
                url: 'https://www.w3schools.com/html/mov_bbb.mp4',
                imageUrl: 'https://picsum.photos/seed/video1/600/400',
                authorId: adminId,
                createdAt: new Date().toISOString(),
                tags: ['rock', 'live', 'concert'],
                likes: [],
                comments: [],
            },
            {
                id: 'mix_001',
                type: ContentType.MIXES,
                title_en: 'Chill Beats Mix',
                title_ru: 'Микс чилл-битов',
                description_en: 'A 2-hour mix of instrumental chillhop beats perfect for studying or relaxing.',
                description_ru: 'Двухчасовой микс инструментальных чилл-хоп битов, идеально подходящий для учебы или отдыха.',
                url: '#',
                imageUrl: 'https://picsum.photos/seed/music1/600/400',
                authorId: adminId,
                createdAt: new Date().toISOString(),
                tags: ['chillhop', 'lofi', 'instrumental'],
                likes: [],
                comments: [],
            },
             {
                id: 'release_001',
                type: ContentType.RELEASES,
                title_en: 'Synthwave Dreams',
                title_ru: 'Синтвейв мечты',
                description_en: 'Journey through a retro-futuristic soundscape with this synthwave compilation.',
                description_ru: 'Путешествие по ретро-футуристическому звуковому ландшафту с этой синтвейв-компиляцией.',
                url: '#',
                imageUrl: 'https://picsum.photos/seed/music2/600/400',
                authorId: adminId,
                createdAt: new Date().toISOString(),
                tags: ['synthwave', 'retrowave', '80s'],
                likes: [],
                comments: [],
            },
        ];
        content.forEach(c => c.comments.forEach(com => com.likes = com.likes || []));
        localStorage.setItem('cultur_content', JSON.stringify(content));
    }
    
    if (!stream) {
        stream = {
            title_en: 'Next Live Stream',
            title_ru: 'Следующий прямой эфир',
            startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Default to 24 hours from now
            embedHtml: `<div class="w-full h-full bg-black flex items-center justify-center"><p class="text-white text-lg">Stream will appear here!</p></div>`,
        };
        localStorage.setItem('cultur_stream', JSON.stringify(stream));
    }


    return { users, content, playlists, stream, streamChatMessages };
};