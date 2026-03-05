const fs = require('fs');
const path = require('path');

// Basic .env parser
function loadEnv() {
    const envPath = path.join(__dirname, '../.env');
    if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf-8');
        content.split('\n').forEach(line => {
            const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
            if (match) {
                const key = match[1];
                let value = match[2] || '';
                if (value.length > 0 && value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') {
                    value = value.replace(/\\n/gm, '\n');
                }
                value = value.replace(/(^['"]|['"]$)/g, '').trim();
                process.env[key] = value;
            }
        });
    }
}

loadEnv();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error("Missing Supabase configuration in .env");
    process.exit(1);
}

// Built-in fetch was added in Node 18+, we can use it since Vite requires Node 18+ usually.
async function fetchWithRetry(url, options, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                if (Math.floor(response.status / 100) === 5 || response.status === 408) {
                    console.warn(`Request failed with status ${response.status}. Retrying... (${i + 1}/${retries})`);
                    await new Promise(res => setTimeout(res, 1000 * (i + 1)));
                    continue;
                }
                throw new Error(`HTTP error! status: ${response.status} - ${await response.text()}`);
            }
            return response;
        } catch (error) {
            if (i === retries - 1) throw error;
            console.warn(`Request failed: ${error.message}. Retrying... (${i + 1}/${retries})`);
            await new Promise(res => setTimeout(res, 1000 * (i + 1)));
        }
    }
}

async function migrateImages() {
    console.log('Starting image migration...');
    const productsDir = path.join(__dirname, '../public/products');

    // Ensure directories exist
    if (!fs.existsSync(productsDir)) {
        fs.mkdirSync(productsDir, { recursive: true });
    }

    try {
        // Fetch product IDs
        console.log('Fetching product IDs...');
        const idsResponse = await fetchWithRetry(`${SUPABASE_URL}/rest/v1/products?select=id`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        });
        const productsList = await idsResponse.json();

        console.log(`Found ${productsList.length} products to process.`);

        for (const { id } of productsList) {
            console.log(`\nProcessing product ID: ${id}`);

            // Fetch product full data specific to ID to avoid timeout
            const prodRes = await fetchWithRetry(`${SUPABASE_URL}/rest/v1/products?select=id,images&id=eq.${id}`, {
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Accept': 'application/vnd.pgrst.object+json'
                }
            });
            const product = await prodRes.json();

            if (!product.images || !Array.isArray(product.images) || product.images.length === 0) {
                console.log(`  No images to process for product ${id}`);
                continue;
            }

            const newImageUrls = [];
            let imageUpdated = false;

            for (let i = 0; i < product.images.length; i++) {
                const imgData = product.images[i];

                // Check if it's actually a base64 string
                if (imgData && imgData.startsWith('data:image/')) {
                    console.log(`  Found base64 image at index ${i}`);

                    // Extract base64 content
                    const matches = imgData.match(/^data:image\/([a-zA-Z0-9.+]+);base64,(.+)$/);
                    if (matches && matches.length === 3) {
                        const extension = matches[1] === 'jpeg' ? 'jpg' : matches[1];
                        const base64Data = matches[2];
                        const buffer = Buffer.from(base64Data, 'base64');

                        const fileName = `product-${id}-${i}.${extension}`;
                        const filePath = path.join(productsDir, fileName);

                        // Save file
                        fs.writeFileSync(filePath, buffer);
                        console.log(`  Saved image to ${fileName}`);

                        // Add new URL path to array
                        newImageUrls.push(`/products/${fileName}`);
                        imageUpdated = true;
                    } else {
                        console.log(`  Invalid base64 format for image at index ${i}`);
                        newImageUrls.push(imgData); // Keep original if parsing fails
                    }
                } else {
                    // Keep original if not base64 (e.g., already a URL)
                    newImageUrls.push(imgData);
                }
            }

            // Update database if any images were converted
            if (imageUpdated) {
                console.log(`  Updating database for product ${id}...`);
                await fetchWithRetry(`${SUPABASE_URL}/rest/v1/products?id=eq.${id}`, {
                    method: 'PATCH',
                    headers: {
                        'apikey': SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=minimal'
                    },
                    body: JSON.stringify({ images: newImageUrls })
                });
                console.log(`  Database updated successfully for product ${id}`);
            } else {
                console.log(`  No base64 images to update for product ${id}`);
            }
        }

        console.log('\nMigration completed successfully.');
    } catch (error) {
        console.error('Migration failed:', error);
    }
}

migrateImages();
