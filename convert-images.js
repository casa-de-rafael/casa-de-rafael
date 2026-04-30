const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const convert = require('heic-convert');

const PICS_DIR = path.resolve(__dirname, '..', 'Menu', 'CASA DE RAFAEL MNL', 'Pics');
const LOGO_DIR = path.resolve(__dirname, '..', 'Menu', 'CASA DE RAFAEL MNL', 'LOGO');
const BRAND_PACK = path.resolve(__dirname, '..', 'Menu', 'CASA DE RAFAEL MNL', 'Brand Pack_20260423_211919_0002.png');
const FOOD_OUT = path.resolve(__dirname, 'images', 'food');
const LOGO_OUT = path.resolve(__dirname, 'images', 'logos');

async function convertHeicToWebp(inputPath, outputPath, quality = 82) {
    try {
        const inputBuffer = fs.readFileSync(inputPath);
        const jpegBuffer = await convert({
            buffer: inputBuffer,
            format: 'JPEG',
            quality: 0.95
        });
        await sharp(jpegBuffer)
            .resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true })
            .webp({ quality })
            .toFile(outputPath);
        console.log(`✓ ${path.basename(inputPath)} → ${path.basename(outputPath)}`);
    } catch (err) {
        console.error(`✗ ${path.basename(inputPath)}: ${err.message}`);
    }
}

async function convertPngToWebp(inputPath, outputPath, quality = 90) {
    try {
        await sharp(inputPath)
            .webp({ quality })
            .toFile(outputPath);
        console.log(`✓ ${path.basename(inputPath)} → ${path.basename(outputPath)}`);
    } catch (err) {
        console.error(`✗ ${path.basename(inputPath)}: ${err.message}`);
    }
}

async function main() {
    // Ensure output dirs exist
    fs.mkdirSync(FOOD_OUT, { recursive: true });
    fs.mkdirSync(LOGO_OUT, { recursive: true });

    // Convert HEIC photos
    console.log('\n=== Converting HEIC Photos to WebP ===\n');
    const heicFiles = fs.readdirSync(PICS_DIR).filter(f => f.toLowerCase().endsWith('.heic'));
    console.log(`Found ${heicFiles.length} HEIC files\n`);
    
    for (const file of heicFiles) {
        const inputPath = path.join(PICS_DIR, file);
        const baseName = path.parse(file).name.toLowerCase();
        const outputPath = path.join(FOOD_OUT, `${baseName}.webp`);
        await convertHeicToWebp(inputPath, outputPath);
    }

    // Convert Logo PNGs
    console.log('\n=== Converting Logo PNGs to WebP ===\n');
    const logoFiles = fs.readdirSync(LOGO_DIR).filter(f => f.toLowerCase().endsWith('.png'));
    
    for (const file of logoFiles) {
        const inputPath = path.join(LOGO_DIR, file);
        const baseName = path.parse(file).name.toLowerCase().replace(/[^a-z0-9]/g, '_');
        const outputPath = path.join(LOGO_OUT, `${baseName}.webp`);
        await convertPngToWebp(inputPath, outputPath);
    }

    // Also copy the PNG originals for favicon/fallback
    for (const file of logoFiles) {
        const inputPath = path.join(LOGO_DIR, file);
        const baseName = path.parse(file).name.toLowerCase().replace(/[^a-z0-9]/g, '_');
        fs.copyFileSync(inputPath, path.join(LOGO_OUT, `${baseName}.png`));
        console.log(`✓ Copied ${file} → ${baseName}.png`);
    }

    // Convert brand pack
    console.log('\n=== Converting Brand Pack ===\n');
    await convertPngToWebp(BRAND_PACK, path.join(LOGO_OUT, 'brand_pack.webp'));

    console.log('\n=== Done! ===\n');
}

main().catch(console.error);
