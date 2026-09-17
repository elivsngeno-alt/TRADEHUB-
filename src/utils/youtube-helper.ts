/**
 * Parses any standard YouTube link (watch, short link, embed) and returns the standard embed URL.
 * Examples:
 * - https://www.youtube.com/watch?v=dQw4w9WgXcQ -> https://www.youtube.com/embed/dQw4w9WgXcQ
 * - https://youtu.be/dQw4w9WgXcQ -> https://www.youtube.com/embed/dQw4w9WgXcQ
 */
export const getYouTubeEmbedUrl = (url?: string): string | null => {
    if (!url || typeof url !== 'string') return null;
    const trimmed = url.trim();
    if (!trimmed) return null;

    // Direct embed URL already
    if (trimmed.includes('youtube.com/embed/')) {
        return trimmed;
    }

    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = trimmed.match(regExp);

    if (match && match[2] && match[2].length === 11) {
        return `https://www.youtube.com/embed/${match[2]}`;
    }

    return null;
};
