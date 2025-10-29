
export enum Role {
    USER = 'USER',
    MODERATOR = 'MODERATOR',
    ADMIN = 'ADMIN',
}

export interface User {
    id: string;
    nickname: string;
    email: string;
    passwordHash: string; // In a real app, never store plain text passwords
    role: Role;
    badge?: 'note' | 'gear' | null;
}

export enum ContentType {
    NEWS = 'NEWS',
    VIDEO = 'VIDEO',
    MIXES = 'MIXES',
    RELEASES = 'RELEASES',
}

export interface Comment {
    id: string;
    userId: string;
    userNickname: string;
    text: string;
    createdAt: string;
    likes: string[]; // Array of user IDs who liked the comment
}

export interface Content {
    id: string;
    type: ContentType;
    title_en: string;
    title_ru: string;
    description_en: string;
    description_ru: string;
    url: string; // URL to video, music file, or news article
    imageUrl: string;
    authorId: string;
    createdAt: string;
    tags?: string[];
    likes: string[]; // Array of user IDs
    comments: Comment[];
}

export interface PlaylistItem {
    contentId: string;
    title: string;
    imageUrl: string;
    type: ContentType;
}

export interface Playlist {
    id: string;
    name: string;
    userId: string;
    items: PlaylistItem[];
    isPublic: boolean;
    authorNickname: string;
}

export interface StreamSettings {
    title_en: string;
    title_ru: string;
    startTime: string; // ISO Date String
    embedHtml: string;
}

export interface StreamChatMessage {
    id: string;
    userId: string;
    userNickname: string;
    text: string;
    createdAt: string;
}


export type Language = 'en' | 'ru';

export type RepeatMode = 'none' | 'one' | 'all';