require('dotenv').config();
const twilio = require('twilio');
const fs = require('fs');

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const LOG_FILE = './contacted_numbers.json';
const NICHE_QUERY = "שיקום נזקים בישראל";

let contacted = [];
if (fs.existsSync(LOG_FILE)) {
    contacted = JSON.parse(fs.readFileSync(LOG_FILE));
}

async function scrapeAndMessage() {
    console.log(`Starting scraper for query: ${NICHE_QUERY}`);
    
    // Mock leads for structural demonstration
    const mockLeads = [
        { name: 'מומחה נזקי מים', phone: '+972501234567' }
    ];

    for (const lead of mockLeads) {
        if (!contacted.includes(lead.phone)) {
            const msg = `שלום ${lead.name}, פתחנו פורטל שמאות ושיקום נזקים מוביל שמייצר פניות חמות מאנשים שצריכים עזרה מעכשיו לעכשיו. מחפשים קבלן אמין ויסודי להעביר אליו את העבודות באופן קבוע. מעוניין לקבל 5 לידים ראשונים לניסיון בחינם? (השב 'כן' או 'לא')`;
            
            console.log(`Sending SMS to ${lead.phone}...`);
            // await client.messages.create({ body: msg, from: process.env.TWILIO_PHONE_NUMBER, to: lead.phone });
            
            contacted.push(lead.phone);
        }
    }
    
    fs.writeFileSync(LOG_FILE, JSON.stringify(contacted));
    console.log('Done!');
}

scrapeAndMessage();
