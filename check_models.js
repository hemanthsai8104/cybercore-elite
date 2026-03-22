require('dotenv').config();
const fs = require('fs');

async function listModels() {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        const data = await response.json();
        const list = data.models ? data.models.map(m => `- ${m.name}`).join('\n') : JSON.stringify(data);
        fs.writeFileSync('CLEAN_MODELS.txt', list, 'utf8');
        console.log("DIAGNOSTIC COMPLETE: See CLEAN_MODELS.txt");
    } catch (err) {
        console.error("DIAGNOSTIC FAILED:", err.message);
    }
}

listModels();
