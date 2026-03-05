const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const productsDir = path.join(__dirname, '../public/products');

async function optimizeImages() {
    const files = fs.readdirSync(productsDir);

    for (const file of files) {
        const filePath = path.join(productsDir, file);
        const ext = path.extname(file).toLowerCase();

        if (!['.png', '.jpg', '.jpeg', '.webp'].includes(ext)) continue;

        const stats = fs.statSync(filePath);
        console.log(`Processing: ${file} (${(stats.size / 1024).toFixed(0)}KB)`);

        const newName = path.basename(file, ext) + '.webp';
        const newPath = path.join(productsDir, newName);

        try {
            await sharp(filePath)
                .resize(800, null, { withoutEnlargement: true })
                .webp({ quality: 75 })
                .toFile(newPath + '.tmp');

            // If original was not already webp, remove original and rename
            if (ext !== '.webp') {
                fs.unlinkSync(filePath);
                fs.renameSync(newPath + '.tmp', newPath);
            } else {
                // Overwrite the original webp with optimized version
                fs.unlinkSync(filePath);
                fs.renameSync(newPath + '.tmp', newPath);
            }

            const newStats = fs.statSync(newPath);
            console.log(`  -> ${newName} (${(newStats.size / 1024).toFixed(0)}KB)`);
        } catch (err) {
            console.error(`  Error processing ${file}:`, err.message);
            // Clean up tmp if exists
            if (fs.existsSync(newPath + '.tmp')) fs.unlinkSync(newPath + '.tmp');
        }
    }

    console.log('\nImage optimization complete!');
}

optimizeImages();
