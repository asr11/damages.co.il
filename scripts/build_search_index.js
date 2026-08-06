const fs = require('fs');
const path = require('path');

/**
 * Akasha Knowledge Vault — Search Index Builder
 * © HUB האב מערכות מתקדמות בע"מ
 * 
 * Scans all Markdown files in the content/ directory tree,
 * extracts frontmatter metadata (including Sefira/Pillar),
 * and builds a lightweight JSON search index.
 */

const contentDir = path.join(__dirname, '../public/content');
const outputFile = path.join(__dirname, '../public/search_index.json');

function scanDirectory(directory, fileList = []) {
    if (!fs.existsSync(directory)) return fileList;
    
    const files = fs.readdirSync(directory);
    
    files.forEach(file => {
        const filePath = path.join(directory, file);
        if (fs.statSync(filePath).isDirectory()) {
            // Skip _index directory
            if (file !== '_index' && file !== 'node_modules') {
                scanDirectory(filePath, fileList);
            }
        } else if (filePath.endsWith('.md') && file !== 'README.md') {
            fileList.push(filePath);
        }
    });
    
    return fileList;
}

function extractFrontmatter(content) {
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return {};
    
    const frontmatter = {};
    match[1].split('\n').forEach(line => {
        const colonIndex = line.indexOf(':');
        if (colonIndex === -1) return;
        const key = line.substring(0, colonIndex).trim();
        const value = line.substring(colonIndex + 1).trim().replace(/^"|"$/g, '');
        if (key && value) {
            frontmatter[key] = value;
        }
    });
    return frontmatter;
}

function buildIndex() {
    console.log('🔮 Building Akasha Search Index...');
    console.log(`   Scanning: ${contentDir}`);
    
    const allFiles = scanDirectory(contentDir);
    const searchIndex = [];

    allFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf-8');
        const meta = extractFrontmatter(content);
        
        const relativePath = file
            .replace(path.join(__dirname, '../public/content/'), '')
            .replace(/\\/g, '/');
        
        const slug = relativePath.replace(/\.md$/, '');
        
        const bodyText = content.replace(/^---\n[\s\S]*?\n---/, '').replace(/[#*`>|]/g, ' ').replace(/\s+/g, ' ');
        
        searchIndex.push({
            id: slug,
            title: meta.title || path.basename(file, '.md'),
            title_he: meta.title_he || '',
            description: meta.description || '',
            description_he: meta.description_he || '',
            keywords: meta.keywords || '',
            keywords_he: meta.keywords_he || '',
            category: meta.category || 'כללי',
            sefira: meta.sefira || '',
            pillar: meta.pillar || '',
            era: meta.era || '',
            source: meta.source || '',
            content_text: bodyText.substring(0, 1500),
            verified: meta.verified === 'true',
            url: `/${slug}/`
        });
    });

    // Sort by pillar then sefira
    searchIndex.sort((a, b) => {
        if (a.pillar !== b.pillar) return a.pillar.localeCompare(b.pillar);
        return a.sefira.localeCompare(b.sefira);
    });

    fs.writeFileSync(outputFile, JSON.stringify(searchIndex, null, 2));
    
    console.log(`\n   ✅ Index built: ${searchIndex.length} documents`);
    console.log(`   📁 Output: ${outputFile}`);
    
    // Print summary by pillar
    const pillars = {};
    searchIndex.forEach(item => {
        const p = item.pillar || 'ללא עמוד';
        pillars[p] = (pillars[p] || 0) + 1;
    });
    console.log('\n   📊 Summary:');
    Object.entries(pillars).forEach(([p, count]) => {
        console.log(`      ${p}: ${count} documents`);
    });
}

buildIndex();
