// scripts/build-extension.js - Script pour construire l'extension
import fs from 'fs/promises';
import path from 'path';
import archiver from 'archiver';
import { fileURLToPath } from 'url';
import { createWriteStream } from 'fs';

// Obtenir __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EXTENSION_DIR = path.resolve(__dirname, '..', 'extension');
const BUILD_DIR = path.resolve(__dirname, '..', 'build', 'extension');
const DIST_DIR = path.resolve(__dirname, '..', 'dist');

async function buildExtension() {
    console.log('🔨 Construction de l\'extension...');

    try {
        // Créer les dossiers de build
        await ensureDirectories();

        // Copier les fichiers de l'extension
        await copyExtensionFiles();

        // Créer le package ZIP pour Chrome Web Store
        await createZipPackage();

        console.log('✅ Extension construite avec succès!');
        console.log(`📦 Package disponible dans: ${path.relative(process.cwd(), DIST_DIR)}/security-scanner-extension.zip`);
        console.log(`📁 Fichiers build dans: ${path.relative(process.cwd(), BUILD_DIR)}/`);
        console.log('\n🚀 Pour tester l\'extension:');
        console.log('1. Ouvrez Chrome et allez sur chrome://extensions/');
        console.log('2. Activez le "Mode développeur"');
        console.log(`3. Cliquez "Charger l'extension non empaquetée" et sélectionnez le dossier: ${path.relative(process.cwd(), BUILD_DIR)}`);

    } catch (error) {
        console.error('❌ Erreur lors de la construction:', error);
        process.exit(1);
    }
}

async function ensureDirectories() {
    const dirs = [
        BUILD_DIR, 
        DIST_DIR, 
        path.join(BUILD_DIR, 'icons'), 
        path.join(BUILD_DIR, 'styles')
    ];
    
    for (const dir of dirs) {
        try {
            await fs.mkdir(dir, { recursive: true });
        } catch (error) {
            if (error.code !== 'EEXIST') throw error;
        }
    }
}

async function copyExtensionFiles() {
    const filesToCopy = [
        'manifest.json',
        'background.js',
        'content.js',
        'popup.html',
        'popup.js',
        'rules.json'
    ];

    const stylesToCopy = [
        'styles/popup.css'
    ];

    // Copier les fichiers principaux
    for (const file of filesToCopy) {
        const srcPath = path.join(EXTENSION_DIR, file);
        const destPath = path.join(BUILD_DIR, file);
        
        try {
            await fs.copyFile(srcPath, destPath);
            console.log(`✓ Copié: ${file}`);
        } catch (error) {
            console.warn(`⚠️ Fichier non trouvé: ${file} - ${error.message}`);
        }
    }

    // Copier les styles
    for (const style of stylesToCopy) {
        const srcPath = path.join(EXTENSION_DIR, style);
        const destPath = path.join(BUILD_DIR, style);
        
        try {
            await fs.copyFile(srcPath, destPath);
            console.log(`✓ Copié: ${style}`);
        } catch (error) {
            console.warn(`⚠️ Style non trouvé: ${style} - Création d'un fichier par défaut`);
            await createDefaultCSS(destPath);
        }
    }

    // Copier les icônes ou créer des icônes par défaut
    await copyOrCreateIcons();
}

async function copyOrCreateIcons() {
    const iconSizes = [16, 32, 48, 128];
    
    for (const size of iconSizes) {
        const srcPath = path.join(EXTENSION_DIR, 'icons', `icon-${size}.png`);
        const destPath = path.join(BUILD_DIR, 'icons', `icon-${size}.png`);
        
        try {
            // Essayer de copier l'icône existante
            await fs.copyFile(srcPath, destPath);
            console.log(`✓ Icône copiée: icon-${size}.png`);
        } catch (error) {
            // Créer une icône SVG simple si elle n'existe pas
            console.log(`⚠️ Création d'une icône par défaut: icon-${size}.png`);
            await createDefaultIcon(destPath, size);
        }
    }
}

async function createDefaultIcon(iconPath, size) {
    // Créer une icône SVG simple
    const svgIcon = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${size}" height="${size}" fill="#3b82f6" rx="4"/>
        <text x="50%" y="50%" fill="white" text-anchor="middle" dominant-baseline="central" font-size="${Math.floor(size * 0.5)}" font-family="Arial, sans-serif">🛡️</text>
    </svg>`;
    
    // Créer un fichier SVG
    const svgPath = iconPath.replace('.png', '.svg');
    await fs.writeFile(svgPath, svgIcon);
    
    // Créer un fichier PNG placeholder simple (pour éviter les erreurs de chargement)
    // En production, vous devriez utiliser une vraie conversion SVG->PNG
    const pngData = Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
        0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
        0x00, 0x00, 0x00, size, 0x00, 0x00, 0x00, size,
        0x08, 0x02, 0x00, 0x00, 0x00
    ]);
    await fs.writeFile(iconPath, pngData);
}

async function createDefaultCSS(cssPath) {
    const defaultCSS = `/* Default Extension CSS */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    background: #f8fafc;
    min-height: 400px;
}

.popup-container {
    width: 350px;
    min-height: 400px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    position: relative;
    overflow: hidden;
}

.header {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    padding: 16px 20px;
    display: flex;
    align-items: center;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.header-icon {
    font-size: 24px;
    margin-right: 12px;
}

.header-title {
    color: white;
    font-size: 18px;
    font-weight: 600;
}

.status-section {
    background: white;
    margin: 16px;
    border-radius: 12px;
    padding: 20px;
    text-align: center;
    border: 3px solid #e5e7eb;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.status-icon {
    font-size: 48px;
    margin-bottom: 12px;
    transition: transform 0.3s ease;
}

.status-text {
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.url-display {
    color: #6b7280;
    font-size: 14px;
    font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
    background: #f3f4f6;
    padding: 8px 12px;
    border-radius: 6px;
    margin-top: 12px;
    word-break: break-all;
    border: 1px solid #e5e7eb;
}

.scan-details {
    background: white;
    margin: 0 16px 16px 16px;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.actions-section {
    padding: 0 16px 16px 16px;
    display: flex;
    gap: 8px;
}

.action-btn {
    flex: 1;
    padding: 12px 16px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.action-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.action-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
}

.action-btn.primary {
    background: linear-gradient(135deg, #3b82f6, #1e40af);
    color: white;
}

.action-btn.danger {
    background: linear-gradient(135deg, #dc2626, #991b1b);
    color: white;
}

.stats-section {
    background: rgba(255, 255, 255, 0.9);
    margin: 0 16px 16px 16px;
    border-radius: 8px;
    padding: 16px;
    backdrop-filter: blur(10px);
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
}

.stat-item {
    text-align: center;
    padding: 8px;
    background: white;
    border-radius: 6px;
    border: 1px solid #e5e7eb;
}

.stat-number {
    font-size: 20px;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 4px;
}

.stat-number.danger {
    color: #dc2626;
}

.stat-number.safe {
    color: #059669;
}

.footer {
    background: rgba(255, 255, 255, 0.1);
    padding: 12px 20px;
    text-align: center;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.footer-text {
    color: rgba(255, 255, 255, 0.8);
    font-size: 12px;
    font-weight: 500;
}`;
    
    await fs.writeFile(cssPath, defaultCSS);
}

async function createZipPackage() {
    return new Promise((resolve, reject) => {
        const output = createWriteStream(path.join(DIST_DIR, 'security-scanner-extension.zip'));
        const archive = archiver('zip', {
            zlib: { level: 9 }
        });

        output.on('close', () => {
            console.log(`📦 Package ZIP créé (${archive.pointer()} bytes)`);
            resolve();
        });

        archive.on('error', (err) => {
            reject(err);
        });

        archive.pipe(output);
        archive.directory(BUILD_DIR, false);
        archive.finalize();
    });
}

// Exécuter le build
buildExtension();