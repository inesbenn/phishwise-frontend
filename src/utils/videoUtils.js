// src/utils/videoUtils.js - Utilitaires pour la gestion des vidéos

/**
 * Convertit une URL YouTube en URL d'embed appropriée
 * @param {string} url - L'URL YouTube originale
 * @returns {string} - L'URL d'embed formatée
 */
export const convertYouTubeToEmbed = (url) => {
    if (!url) return '';
    
    try {
        // Différents formats d'URLs YouTube possibles
        const patterns = [
            // https://www.youtube.com/watch?v=VIDEO_ID
            /(?:youtube\.com\/watch\?v=)([\w-]+)/,
            // https://youtu.be/VIDEO_ID
            /(?:youtu\.be\/)([\w-]+)/,
            // https://www.youtube.com/embed/VIDEO_ID (déjà en format embed)
            /(?:youtube\.com\/embed\/)([\w-]+)/,
            // https://m.youtube.com/watch?v=VIDEO_ID
            /(?:m\.youtube\.com\/watch\?v=)([\w-]+)/,
            // https://youtube.com/v/VIDEO_ID
            /(?:youtube\.com\/v\/)([\w-]+)/
        ];

        let videoId = null;
        
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) {
                videoId = match[1];
                break;
            }
        }

        if (!videoId) {
            console.warn('ID vidéo YouTube non trouvé dans l\'URL:', url);
            return url; // Retourner l'URL originale si pas de match
        }

        // Construire l'URL d'embed avec les paramètres appropriés
        const embedUrl = `https://www.youtube.com/embed/${videoId}`;
        
        // Ajouter des paramètres pour améliorer l'expérience
        const params = new URLSearchParams({
            'autoplay': '0',           // Ne pas démarrer automatiquement
            'controls': '1',           // Afficher les contrôles
            'modestbranding': '1',     // Réduire la marque YouTube
            'rel': '0',                // Ne pas afficher de vidéos suggérées à la fin
            'showinfo': '0',           // Ne pas afficher les infos de la vidéo
            'fs': '1',                 // Autoriser le plein écran
            'cc_load_policy': '1',     // Charger les sous-titres si disponibles
            'iv_load_policy': '3',     // Ne pas charger les annotations
            'enablejsapi': '1'         // Activer l'API JavaScript
        });

        return `${embedUrl}?${params.toString()}`;
        
    } catch (error) {
        console.error('Erreur lors de la conversion de l\'URL YouTube:', error);
        return url; // Retourner l'URL originale en cas d'erreur
    }
};

/**
 * Vérifie si une URL est une URL YouTube valide
 * @param {string} url - L'URL à vérifier
 * @returns {boolean} - true si c'est une URL YouTube valide
 */
export const isYouTubeUrl = (url) => {
    if (!url) return false;
    
    const youtubePatterns = [
        /^https?:\/\/(www\.)?youtube\.com\/(watch\?v=|embed\/|v\/)/,
        /^https?:\/\/youtu\.be\//,
        /^https?:\/\/m\.youtube\.com\/watch\?v=/
    ];
    
    return youtubePatterns.some(pattern => pattern.test(url));
};

/**
 * Extrait l'ID de la vidéo YouTube depuis une URL
 * @param {string} url - L'URL YouTube
 * @returns {string|null} - L'ID de la vidéo ou null si non trouvé
 */
export const extractYouTubeVideoId = (url) => {
    if (!url) return null;
    
    const patterns = [
        /(?:youtube\.com\/watch\?v=)([\w-]+)/,
        /(?:youtu\.be\/)([\w-]+)/,
        /(?:youtube\.com\/embed\/)([\w-]+)/,
        /(?:m\.youtube\.com\/watch\?v=)([\w-]+)/,
        /(?:youtube\.com\/v\/)([\w-]+)/
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
            return match[1];
        }
    }
    
    return null;
};

/**
 * Génère une URL de thumbnail pour une vidéo YouTube
 * @param {string} videoId - L'ID de la vidéo YouTube
 * @param {string} quality - La qualité de l'image (default, mqdefault, hqdefault, sddefault, maxresdefault)
 * @returns {string} - L'URL de la thumbnail
 */
export const getYouTubeThumbnail = (videoId, quality = 'hqdefault') => {
    if (!videoId) return '';
    return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
};

/**
 * Formate une durée en secondes vers le format MM:SS ou HH:MM:SS
 * @param {number} seconds - Durée en secondes
 * @returns {string} - Durée formatée
 */
export const formatDuration = (seconds) => {
    if (!seconds || seconds < 0) return '0:00';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    } else {
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
};

/**
 * Valide et nettoie une URL de vidéo
 * @param {string} url - L'URL à valider
 * @returns {object} - Objet avec les informations de validation
 */
export const validateVideoUrl = (url) => {
    if (!url) {
        return {
            isValid: false,
            error: 'URL manquante',
            cleanUrl: null,
            videoId: null,
            platform: null
        };
    }

    try {
        // Vérifier si c'est une URL YouTube
        if (isYouTubeUrl(url)) {
            const videoId = extractYouTubeVideoId(url);
            if (videoId) {
                return {
                    isValid: true,
                    error: null,
                    cleanUrl: convertYouTubeToEmbed(url),
                    videoId: videoId,
                    platform: 'youtube',
                    thumbnail: getYouTubeThumbnail(videoId)
                };
            } else {
                return {
                    isValid: false,
                    error: 'ID vidéo YouTube invalide',
                    cleanUrl: null,
                    videoId: null,
                    platform: 'youtube'
                };
            }
        }

        // Pour d'autres plateformes (Vimeo, etc.)
        if (url.includes('vimeo.com')) {
            return {
                isValid: true,
                error: null,
                cleanUrl: url,
                videoId: null,
                platform: 'vimeo'
            };
        }

        // URL générique (MP4, WebM, etc.)
        if (url.match(/\.(mp4|webm|ogg|avi|mov)$/i)) {
            return {
                isValid: true,
                error: null,
                cleanUrl: url,
                videoId: null,
                platform: 'direct'
            };
        }

        return {
            isValid: false,
            error: 'Format de vidéo non supporté',
            cleanUrl: null,
            videoId: null,
            platform: 'unknown'
        };

    } catch (error) {
        return {
            isValid: false,
            error: `Erreur de validation: ${error.message}`,
            cleanUrl: null,
            videoId: null,
            platform: 'error'
        };
    }
};