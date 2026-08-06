require('dotenv').config();
const { Client } = require('ssh2');

const articles = [
    { title: "איך להתמודד עם נזקי מים בבית", content: "מדריך מלא לשיקום נזקי מים, איתור רטיבות וייבוש תת רצפתי. חשוב להזמין מומחה שמאות נזקים." },
    { title: "שיקום אחרי שריפה: מה עושים?", content: "הצעדים הראשונים אחרי נזקי אש - פינוי פיח, נטרול ריחות ושיקום מבנים מקצועי." },
    { title: "ייבוש תת רצפתי ללא הרס - כל המידע", content: "טכנולוגיות מתקדמות לייבוש מים מתחת לריצוף מבלי לשבור קרמיקה או להרוס את הבית." },
    { title: "שמאי רכוש: מתי חובה להזמין?", content: "נזק כבד מצנרת שהתפוצצה? גלו למה שמאי רכוש פרטי ישיג לכם פיצוי גבוה יותר מהביטוח." },
    { title: "איתור נזילות במצלמה טרמית", content: "איתור מקור הנזילה במדויק מונע נזק נוסף ומוזיל את עלויות שיקום המבנה." }
    // 15 additional articles generated here dynamically in production
];

const conn = new Client();
conn.on('ready', () => {
    console.log('SSH Client :: ready');
    
    articles.forEach((article, index) => {
        const year = Math.floor(Math.random() * (2025 - 2021 + 1)) + 2021;
        const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
        const date = `${year}-${month}-01 10:00:00`;
        
        const b64Title = Buffer.from(article.title).toString('base64');
        const b64Content = Buffer.from(article.content).toString('base64');
        
        const cmd = `cd ${process.env.WP_INSTALL_PATH} && wp post create --post_title="$(echo ${b64Title} | base64 --decode)" --post_content="$(echo ${b64Content} | base64 --decode)" --post_status=publish --post_date="${date}" --allow-root`;
        
        conn.exec(cmd, (err, stream) => {
            if (err) throw err;
            stream.on('close', () => {
                console.log(`Article ${index + 1} published.`);
                if (index === articles.length - 1) conn.end();
            });
        });
    });
}).connect({
    host: process.env.WP_SSH_HOST,
    port: 22,
    username: process.env.WP_SSH_USER,
    password: process.env.WP_SSH_PASSWORD
});
