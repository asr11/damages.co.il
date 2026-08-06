/**
 * Data.gov.il API Fetcher for damages.co.il
 * Pulls open data regarding traffic accidents, workplace injuries, etc.
 * Uses CKAN API format: /api/3/action/datastore_search
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Fallback dataset ID for traffic accidents (example ID)
const DEFAULT_DATASET_ID = '03cb3f36-5eb8-466d-8e6d-67e416fb90fb';
const BASE_URL = 'https://data.gov.il/api/3/action/datastore_search';
const CACHE_FILE = path.join(__dirname, 'data_gov_cache.json');

class DataGovFetcher {
    constructor(resourceId = DEFAULT_DATASET_ID) {
        this.resourceId = resourceId;
    }

    /**
     * Fetches data from data.gov.il API
     */
    async fetchStatistics(limit = 100) {
        return new Promise((resolve, reject) => {
            const url = `${BASE_URL}?resource_id=${this.resourceId}&limit=${limit}`;
            
            https.get(url, (res) => {
                let data = '';
                
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    try {
                        const parsed = JSON.parse(data);
                        if (parsed.success) {
                            resolve(parsed.result.records);
                        } else {
                            reject('API returned unsuccessful response');
                        }
                    } catch (e) {
                        reject(e);
                    }
                });
            }).on('error', (err) => {
                reject(err);
            });
        });
    }

    /**
     * Updates the local cache to prevent spamming the gov API
     */
    async updateCache() {
        try {
            console.log(`[DataGov] Fetching fresh data for resource: ${this.resourceId}`);
            const records = await this.fetchStatistics(500); // Get latest 500 records
            
            const cacheData = {
                lastUpdated: new Date().toISOString(),
                datasetId: this.resourceId,
                data: records
            };

            fs.writeFileSync(CACHE_FILE, JSON.stringify(cacheData, null, 2), 'utf-8');
            console.log('[DataGov] Cache updated successfully.');
            return cacheData;
        } catch (error) {
            console.error('[DataGov] Failed to update cache:', error);
            throw error;
        }
    }

    /**
     * Retrieves data, preferring cache if fresh (< 7 days)
     */
    async getCachedData() {
        if (fs.existsSync(CACHE_FILE)) {
            const cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
            const cacheAge = Date.now() - new Date(cache.lastUpdated).getTime();
            const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
            
            if (cacheAge < SEVEN_DAYS) {
                return cache.data;
            }
        }
        
        // Cache expired or missing, update it
        const newCache = await this.updateCache();
        return newCache.data;
    }

    /**
     * Calculate average compensation or baseline based on age and injury (Mock logic representing data derivation)
     */
    async calculateEstimatedCompensation(age, injuryType, severity) {
        // In a real scenario, this would aggregate data from the cached datasets.
        // For demonstration, we use a baseline calculation inspired by typical Israeli torts averages.
        
        let baseAmount = 0;
        
        switch(injuryType) {
            case 'whiplash':
                baseAmount = 15000;
                break;
            case 'fracture':
                baseAmount = 45000;
                break;
            case 'property':
                baseAmount = 25000;
                break;
            default:
                baseAmount = 10000;
        }
        
        // Severity multiplier
        const severityMultiplier = { 'low': 1, 'medium': 2.5, 'high': 5 };
        baseAmount *= (severityMultiplier[severity] || 1);
        
        // Age factor (loss of earning capacity is higher for younger people)
        if (age >= 18 && age <= 45) {
            baseAmount *= 1.3;
        } else if (age > 45 && age <= 65) {
            baseAmount *= 1.1;
        }
        
        return Math.floor(baseAmount);
    }
}

module.exports = DataGovFetcher;

// Execute standalone test if called directly
if (require.main === module) {
    const fetcher = new DataGovFetcher();
    fetcher.updateCache().then(() => {
        console.log('Test successful');
    }).catch(console.error);
}
