const fs = require('fs');
const path = require('path');

function loadEnv() {
    const envPath = path.join(__dirname, '../.env');
    if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf-8');
        content.split('\n').forEach(line => {
            const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
            if (match) {
                const key = match[1];
                let value = (match[2] || '').replace(/(^['"]|['"]$)/g, '').trim();
                process.env[key] = value;
            }
        });
    }
}

loadEnv();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

async function updateImagePaths() {
    console.log('Updating image paths from .png to .webp in Supabase...');

    const idsRes = await fetch(`${SUPABASE_URL}/rest/v1/products?select=id,images`, {
        headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
    });
    const products = await idsRes.json();

    for (const product of products) {
        if (!product.images || !Array.isArray(product.images)) continue;

        const newImages = product.images.map(img => {
            // Only update paths that point to local /products/ files and are .png
            if (typeof img === 'string' && img.startsWith('/products/') && img.endsWith('.png')) {
                return img.replace('.png', '.webp');
            }
            return img;
        });

        // Check if anything changed
        const changed = newImages.some((img, i) => img !== product.images[i]);
        if (!changed) {
            console.log(`Product ${product.id}: no changes needed`);
            continue;
        }

        console.log(`Product ${product.id}: updating ${product.images.length} image paths`);
        const res = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${product.id}`, {
            method: 'PATCH',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({ images: newImages })
        });
        if (res.ok) console.log(`  Updated successfully`);
        else console.error(`  Failed: ${await res.text()}`);
    }

    console.log('\nDone! Verifying...');

    // Verify
    const verifyRes = await fetch(`${SUPABASE_URL}/rest/v1/products?select=id,images`, {
        headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
    });
    const verified = await verifyRes.json();
    for (const p of verified) {
        console.log(`Product ${p.id}: ${JSON.stringify(p.images)}`);
    }
}

updateImagePaths();
