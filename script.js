let token = localStorage.getItem('token');
let user = localStorage.getItem('user');
let currentTheme = localStorage.getItem('theme') || 'dark';
let trendChart, distChart, categoryChart, radarChart;
let editingVaultId = null;

// NETWORK IDENTITY (Relative for PC, IP for APK)
const API_URL = '/api'; // THE 100% VERCEL CLOUD BRIDGE
document.body.className = currentTheme;

window.onload = function() {
    const inputs = ['username', 'password', 'reg-username', 'reg-password'];
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if(el) { el.value = ''; el.onkeyup = (e) => { if(e.key === 'Enter') id.startsWith('reg') ? register() : login(); }; }
    });
    
    // AUTH-FIRST PRESENTATION PROTOCOL
    // Even if a token exists, we always show the Login Screen first for a professional demo
    document.getElementById('auth-screen').style.display = 'block';
    document.getElementById('sidebar').style.display = 'none';
    document.getElementById('main-view').style.display = 'none';
};

function isValidEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }

function toggleTheme() {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.body.className = currentTheme;
    localStorage.setItem('theme', currentTheme);
    if(document.getElementById('analytics').style.display !== 'none') renderAnalytics(); 
}

async function login() {
    const u = document.getElementById('username').value, p = document.getElementById('password').value;
    if(!u || !p || !isValidEmail(u)) return alert("Access Error: Valid identifier required.");
    const res = await fetch(`${API_URL}/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: u, password: p }) });
    const d = await res.json();
    if (d.token) { 
        localStorage.setItem('token', d.token); 
        localStorage.setItem('user', u); 
        token = d.token; // IMPORTANT: Update local token variable
        
        // SUCCESSFUL AUTH: Unlock Dashboard
        document.getElementById('auth-screen').style.display = 'none';
        document.getElementById('sidebar').style.display = 'flex';
        document.getElementById('main-view').style.display = 'block';
        document.getElementById('display-user').innerText = u.split('@')[0];
        loadHistory();
    }
    else alert(d.error || "Login fail.");
}

async function register() {
    const u = document.getElementById('reg-username').value, p = document.getElementById('reg-password').value;
    if(!u || !p || !isValidEmail(u)) return alert("Registration denied: Enter valid email and key.");
    const res = await fetch(`${API_URL}/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: u, password: p }) });
    if (res.ok) { alert("Identity Secured!"); toggleAuth(); }
    else {
        const d = await res.json();
        alert(d.error || "Registry fail.");
    }
}

function toggleAuth() {
    document.getElementById('login-form').style.display = document.getElementById('login-form').style.display === 'none' ? 'block' : 'none';
    document.getElementById('signup-form').style.display = document.getElementById('signup-form').style.display === 'none' ? 'block' : 'none';
}

function logout() { localStorage.clear(); location.reload(); }

function showSection(id) {
    document.querySelectorAll('section').forEach(s => s.style.display = 'none');
    document.getElementById(id).style.display = 'block';
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(it => { if(it.getAttribute('onclick') && it.getAttribute('onclick').includes(id)) it.classList.add('active'); });
    if (id === 'history') loadHistory();
    if (id === 'threat-log') loadThreatHistory();
    if (id === 'vault') openVault(); // Assuming openVault is the correct function, not loadVault
    if (id === 'analytics') setTimeout(renderAnalytics, 150); // Assuming renderAnalytics is the correct function, not loadAnalytics
}

// --- VAULT ---
async function openVault() {
    try {
        const res = await fetch(`${API_URL}/vault`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
        const vault = await res.json(); window.cachedVault = vault;
        let html = '';
        vault.forEach(v => {
            html += `<div class="card app-tile fade-in" style="width:100%; text-align:left; padding:25px; align-items:flex-start; position:relative;">
                <div style="position:absolute; top:20px; right:20px; display:flex; gap:12px;">
                    <i class="fas fa-edit" style="cursor:pointer; opacity:0.4; font-size:14px;" onclick="editVaultItem(${v.id})"></i>
                    <i class="fas fa-trash-alt" style="cursor:pointer; opacity:0.4; font-size:14px; color:var(--danger);" onclick="deleteVaultItem(${v.id})"></i>
                </div>
                <div style="font-weight:800; color:#fbbf24; font-size:18px;">${v.app_name}</div>
                <div style="font-size:12px; opacity:0.6; margin-bottom:15px; letter-spacing:0.5px;">IDENTIFIER: ${v.app_username}</div>
                <div style="font-size:10px; font-weight:800; color:var(--primary); text-transform:uppercase; letter-spacing:1px; margin-bottom:8px;">PROTECTED SECRET KEY</div>
                <div class="vault-key" style="font-family:'Courier New', monospace; font-size:13px; background:rgba(0,0,0,0.3); padding:12px; border-radius:10px; border:1px solid rgba(255,255,255,0.05); color:var(--success); width:100%;">
                    ${v.encrypted_password}
                </div>
            </div>`;
        });
        document.getElementById('vault-list').innerHTML = html || '<p style="opacity:0.3; text-align:center; width:100%; padding:40px;">No encrypted volumes found.</p>';
    } catch(e) { console.error("Sync Error", e); }
}

function openVaultModal(id = null) {
    editingVaultId = id;
    const item = id ? window.cachedVault.find(x => x.id === id) : { app_name: '', app_username: '', encrypted_password: '' };
    document.getElementById('modal-content').innerHTML = `
    <i class="fas fa-times" style="position:absolute; top:20px; right:25px; cursor:pointer; font-size:20px; opacity:0.5;" onclick="closeModal()"></i>
    <h2 style="margin-bottom:25px;">${id ? 'Modify Record' : 'Register Secret'}</h2>
    <div style="display:flex; flex-direction:column; gap:12px;">
        <input type="text" id="v-app" class="btn-pro" style="width:100%; background:rgba(128,128,128,0.1); text-align:left; padding-left:15px;" placeholder="App Target Name" value="${item.app_name}">
        <input type="text" id="v-user" class="btn-pro" style="width:100%; background:rgba(128,128,128,0.1); text-align:left; padding-left:15px;" placeholder="Account Identifier" value="${item.app_username}">
        <input type="password" id="v-pass" class="btn-pro" style="width:100%; background:rgba(128,128,128,0.1); text-align:left; padding-left:15px;" placeholder="Secret Key Payload" value="${item.encrypted_password}">
        <button class="btn-pro" style="width:100%; margin-top:15px;" onclick="saveToVault()">${id ? 'Update Cryptogram' : 'Secure Storage'}</button>
    </div>`;
    document.getElementById('modal-container').style.display = 'flex';
}

async function saveToVault() {
    const url = editingVaultId ? `${API_URL}/vault/edit/${editingVaultId}` : `${API_URL}/vault/add`;
    const method = editingVaultId ? 'PUT' : 'POST';
    await fetch(url, {
        method, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ app_name: document.getElementById('v-app').value, app_username: document.getElementById('v-user').value, password: document.getElementById('v-pass').value })
    });
    closeModal(); openVault();
}

async function deleteVaultItem(id) {
    if(!confirm("Warning: Decommission this secret forever?")) return;
    await fetch(`${API_URL}/vault/delete/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
    openVault();
}

function editVaultItem(id) { openVaultModal(id); }

async function checkSpamAI() {
    const text = document.getElementById('spam-text').value;
    const from = document.getElementById('meta-from').innerText;
    const sub = document.getElementById('meta-subject').innerText;
    if (!text || text === "Paste packet payload...") return alert("Packet Payload is empty. Intercept a stream first.");
    
    document.getElementById('spam-btn').innerText = "Neural Handshake...";
    const res = await fetch(`${API_URL}/spam/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ email_text: text, from_meta: from, subject_meta: sub })
    });
    const data = await res.json();
    document.getElementById('spam-btn').innerText = "Analyse Threat";
    
    const resultDiv = document.getElementById('spam-result');
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `<h3 style="margin-bottom:10px;">Resolution: <span style="color:${data.prediction==='Spam'?'var(--danger)':'var(--primary)'};">${data.prediction}</span></h3><p>Threat Projection: ${data.confidence}%</p>`;
    resultDiv.scrollIntoView({ behavior: 'smooth' });
}

async function loadThreatHistory() {
    const res = await fetch(`${API_URL}/quiz/history`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
    const history = await res.json();
    const body = document.getElementById('threat-history-body');
    if (!body) return; body.innerHTML = '';
    
    // EXTREME CAPTURE: Match any variant of the Neural Audit name
    const threats = history.filter(h => h.app_name.includes("Neural") || h.app_name.includes("Forensic"));

    const intelHeader = document.querySelector('#threat-log h1');
    if (intelHeader) intelHeader.innerHTML = `Threat Intelligence Log <span style="font-size:12px; opacity:0.5; margin-left:10px;">(${threats.length} Captured)</span>`;

    if (threats.length === 0) {
        body.innerHTML = `<tr><td colspan="5" style="padding:60px; text-align:center; opacity:0.3;">NO NEURAL RECORDS DETECTED. INTERCEPT A PACKET FIRST.</td></tr>`;
        return;
    }

    threats.forEach(h => {
        let from = "Neural Source";
        let sub = "Digital Protocol";
        let reslt = "Unknown";
        
        // ROBUST DISSECTION: Handle any recommendation format
        if (h.recommendations.includes(' | ')) {
            const parts = h.recommendations.split(' | ');
            parts.forEach(p => {
                if (p.includes('SOURCE:')) from = p.split('SOURCE: ')[1] || from;
                if (p.includes('TOPIC:')) sub = p.split('TOPIC: ')[1] || sub;
                if (p.includes('identified packet as')) reslt = p.split('identified packet as ')[1]?.split('.')[0] || reslt;
            });
        } else {
            // Fallback for older scan formats
            reslt = h.recommendations.includes('Spam') ? 'Spam' : 'Safe';
            sub = "Legacy Stream Audit";
        }

        const color = reslt.toLowerCase().includes('spam') ? 'var(--danger)' : '#34d399';
        const row = document.createElement('tr');
        row.style.borderBottom = '1px solid rgba(255,255,255,0.03)';
        row.innerHTML = `
            <td style="padding:15px; font-size:12px;"><strong>${from}</strong></td>
            <td style="padding:15px; font-size:11px; opacity:0.7;">${sub}</td>
            <td style="padding:15px;"><span style="color:${color}; font-weight:900; letter-spacing:1px; font-size:10.5px;">${reslt.toUpperCase()}</span></td>
            <td style="padding:15px; font-size:12px; font-weight:700;">${h.score}%</td>
            <td style="padding:15px; font-size:10px; opacity:0.4;">${new Date(h.created_at).toLocaleString()}</td>
        `;
        body.appendChild(row);
    });
}

async function fetchLiveEmails(isReal = false) {
    const list = document.getElementById('email-list'); document.getElementById('mock-inbox').style.display = 'block';
    list.innerHTML = `<div style="text-align:center; padding:20px;"><h4>Decrypting Inbound Streams...</h4></div>`;
    let emails = [];
    if (isReal) {
        const e = document.getElementById('g-email').value, p = document.getElementById('g-pass').value;
        closeModal();
        const res = await fetch(`${API_URL}/emails/fetch`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` }, body: JSON.stringify({ email: e, password: p }) });
        const d = await res.json(); if (d.error) { list.innerHTML = `<p style="color:var(--danger);">${d.error}</p>`; return; }
        emails = d;
    } else {
        emails = [{ from: "Paytm-Security", subject: "KYC Suspended!", body: "Your wallet KYC is expired. Click: paytm-kyc.io" }, { from: "Netflix", subject: "Billing info", body: "Payment failed. Update here: netflix-billing.com" }];
    }
    setTimeout(() => {
        let html = '';
        emails.forEach(m => { 
            const cleanBody = (m.body || "").replace(/\n/g, ' ').replace(/\r/g, ' ').replace(/'/g, "\\'").replace(/"/g, '&quot;');
            const cleanFrom = (m.from || "Unknown").replace(/'/g, "\\'").replace(/"/g, '&quot;');
            const cleanSub = (m.subject || "No Subject").replace(/'/g, "\\'").replace(/"/g, '&quot;');
            html += `<div class="card" style="margin-bottom:8px; display:flex; justify-content:space-between; align-items:center; gap: 15px;"><div><strong style="color:var(--primary); font-size:12px;">${m.from}</strong><div style="font-size:10px; opacity:0.8;">${m.subject}</div></div><button class="btn-pro" style="width: 80px; height: 35px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; color: white !important;" onclick="prepareForensicScan('${cleanFrom}', '${cleanSub}', '${cleanBody}')">SCAN</button></div>`; 
        });
        list.innerHTML = html;
    }, 1000);
}

function prepareForensicScan(from, sub, body) {
    document.getElementById('forensic-meta').style.display = 'block';
    document.getElementById('meta-from').innerText = from;
    document.getElementById('meta-subject').innerText = sub;
    document.getElementById('spam-text').value = body;
    document.getElementById('spam-result').style.display = 'none';
}

function openGmailModal() {
    document.getElementById('modal-content').innerHTML = `<i class="fas fa-times" style="position:absolute; top:20px; right:25px; cursor:pointer; font-size:20px; opacity:0.5;" onclick="closeModal()"></i><h2 style="margin-bottom:20px;">Connect Stream</h2><input type="text" id="g-email" class="btn-pro" style="width:100%; background:rgba(128,128,128,0.1); margin-bottom:10px;" placeholder="Email address" autocomplete="off" name="live-bridge-email"><input type="password" id="g-pass" class="btn-pro" style="width:100%; background:rgba(128,128,128,0.1); margin-bottom:20px;" placeholder="App Password" autocomplete="new-password" name="live-bridge-key"><button class="btn-pro" style="width:100%;" onclick="fetchLiveEmails(true)">Initiate Bridge</button></div>`;
    document.getElementById('modal-container').style.display = 'flex';
}

// --- QUIZ ---
let currentApp = '';
function startQuiz(app) { currentApp = app; window.currentIdx = 0; window.userAnswers = []; showQuizModal(); }

const quizQuestions = [
    { q: "Multifactor Authentication Status?", o: ["Single-Phase (Disabled)", "SMS-Based (Weak)", "Biometric/FIDO2 (Ideal)"] },
    { q: "Credential Freshness?", o: ["Legacy (>1 Year)", "Modified (6 Months)", "Recent Rotation (<30 Days)"] },
    { q: "Shared Access Sensitivity?", o: ["Public/Shared Machine", "Restricted Access", "Unique Device Hardware Binding"] },
    { q: "Encrypted Storage?", o: ["Plain Text Data", "Standard AES-256", "Quantum-Safe Hashing"] },
    { q: "Inbound Stream Validation?", o: ["Permissive (Allow All)", "Blacklist Filter", "Deep Packet AI Interception"] },
    { q: "Third-Party Permissions?", o: ["Full Access Granted", "Standard Access", "Zero-Trust Least Privilege"] },
    { q: "Login Anomaly Monitoring?", o: ["No Monitoring", "Basic Alerts", "AI Behavioral Forensics"] },
    { q: "Recovery Protocols?", o: ["Single Email Link", "Knowledge-Based Auth", "Decentralized PGP/Hardware Key"] },
    { q: "Data Export Sensitivity?", o: ["Open Export", "Manager Approval", "Biometric Signature Required"] },
    { q: "Cloud Sync Integrity?", o: ["Automatic Proxy-Sync", "Manual Validation", "End-to-End Zero-Knowledge"] }
];

function showQuizModal() {
    if(window.currentIdx >= 10) return handleQuizSubmit();
    const q = quizQuestions[window.currentIdx];
    let html = `<div class="fade-in"><i class="fas fa-times" style="position:absolute; top:20px; right:25px; cursor:pointer; font-size:20px; opacity:0.5;" onclick="closeModal()"></i>
    <div style="margin-bottom:10px; font-weight:800; color:var(--primary); font-size:12px; text-transform:uppercase; letter-spacing:1px;">Question ${window.currentIdx + 1} of 10</div>
    <h2 style="margin-bottom:5px;">${currentApp} Forensic Scan</h2><h3 style="margin:25px 0; color:var(--text-primary);">${q.q}</h3></div>`;
    q.o.forEach((opt, i) => { 
        html += `<button class="btn-pro quiz-option" id="opt-${i}" onclick="selectOption(${i})">
            <span>${opt}</span><i class="fas fa-chevron-right" style="opacity:0.3; font-size:12px;"></i>
        </button>`; 
    });
    document.getElementById('modal-content').innerHTML = html;
    document.getElementById('modal-container').style.display = 'flex';
}

function selectOption(i) {
    const el = document.getElementById(`opt-${i}`);
    el.style.background = 'rgba(99, 102, 241, 0.2)'; el.style.borderColor = 'var(--primary)'; el.style.transform = 'scale(0.99)';
    window.userAnswers.push(i); window.currentIdx++; 
    setTimeout(showQuizModal, 150); 
}

async function handleQuizSubmit() {
    const res = await fetch(`${API_URL}/quiz/submit`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` }, body: JSON.stringify({ app_name: currentApp, answers: window.userAnswers }) });
    const d = await res.json();
    document.getElementById('modal-content').innerHTML = `<i class="fas fa-times" style="position:absolute; top:20px; right:25px; cursor:pointer; font-size:20px; opacity:0.5;" onclick="closeModal()"></i><h1>Scan Resolution: ${d.score}%</h1><div class="card" style="background:rgba(128,128,128,0.1); margin-top:15px; font-size:14px; text-align:left; border-left:4px solid var(--primary);">${d.recommendation}</div><button class="btn-pro" style="width:100%; margin-top:20px;" onclick="closeModal()">Apply Fixes</button>`;
    loadHistory();
}

async function loadHistory() {
    try {
        const res = await fetch(`${API_URL}/quiz/history`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
        const h = await res.json(); window.cachedHistory = h;
        let html = '';
        h.forEach(l => { 
            let c = l.score >= 50 ? 'var(--success)' : 'var(--danger)';
            // CONTEXT-AWARE CHROMA: If it's a Neural Scan and it's Spam, color it RED.
            if (l.app_name.includes("Neural") && l.recommendations.toLowerCase().includes("spam")) {
                c = 'var(--danger)';
            }
            const ts = new Date(l.created_at).toLocaleString('en-US', { hour12: true, month: 'numeric', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric' });
            html += `<tr>
                <td style="font-weight:700;">${l.app_name}</td>
                <td style="color:${c}; font-weight:800;">${l.score}%</td>
                <td style="font-size:13px; opacity:0.9;">${l.recommendations}</td>
                <td style="font-size:12px; opacity:0.6;">${ts}</td>
            </tr>`; 
        });
        document.getElementById('history-body').innerHTML = html;
        if(h.length > 0) {
            const avg = Math.round(h.reduce((a,b)=>a+b.score,0)/h.length);
            const svg = document.getElementById('score-val'); svg.innerText = avg;
            svg.style.color = avg >= 50 ? 'var(--success)' : 'var(--danger)';
        }
    } catch(e) { console.error("Sync Error"); }
}

function renderAnalytics() {
    const h = window.cachedHistory || []; if(h.length === 0) return;
    const avg = Math.round(h.reduce((a,b)=>a+b.score,0)/h.length);
    const avs = document.getElementById('avg-score-stat'); avs.innerText = `${avg}%`;
    avs.style.color = avg >= 50 ? 'var(--success)' : 'var(--danger)';
    document.getElementById('total-scans-stat').innerText = h.length;
    
    const rl = document.getElementById('risk-level-stat'); rl.innerText = avg >= 50 ? 'LOW' : 'HIGH';
    rl.style.color = avg >= 50 ? 'var(--success)' : 'var(--danger)';
    
    const hs = document.getElementById('health-stat'); hs.innerText = avg >= 50 ? 'STRENGTHENED' : 'CRITICAL';
    hs.style.color = avg >= 50 ? 'var(--success)' : 'var(--danger)';
    
    const cats = { 
        'Social': ['WhatsApp', 'Instagram', 'Snapchat', 'Facebook', 'Twitter', 'Telegram', 'Discord', 'Pinterest', 'TikTok', 'Reddit'], 
        'Finance': ['Paytm', 'PhonePe', 'GPay', 'Binance', 'PayPal', 'CRED', 'Stripe', 'Groww'], 
        'Travel': ['Uber', 'Ola', 'Rapido', 'MakeMyTrip', 'Airbnb', 'IRCTC', 'redBus'], 
        'Shopping': ['Amazon', 'Flipkart', 'Myntra', 'Ajio', 'Meesho', 'Nykaa'], 
        'Lifestyle': ['Zomato', 'Swiggy', 'Blinkit', 'Zepto', 'Urban Company', 'Tata 1mg'], 
        'Media': ['YouTube', 'Netflix', 'Spotify', 'Prime Video', 'Twitch', 'Disney+'], 
        'Work': ['LinkedIn', 'Microsoft', 'Google Drive', 'Dropbox', 'Naukri', 'Slack', 'Zoom', 'GitHub'] 
    };
    const radarData = Object.keys(cats).map(k => { const scs = h.filter(x => cats[k].includes(x.app_name)).map(x => x.score); return scs.length > 0 ? Math.round(scs.reduce((a,b)=>a+b,0)/scs.length) : 0; });
    
    const chartCols = currentTheme === 'dark' ? '#94a3b8' : '#64748b';

    if(radarChart) radarChart.destroy();
    radarChart = new Chart(document.getElementById('radarChart'), { type: 'radar', data: { labels: Object.keys(cats), datasets: [{ data: radarData, backgroundColor: 'rgba(99,102,241,0.2)', borderColor: '#6366f1', borderWidth: 2, pointBackgroundColor: '#6366f1' }] }, 
        options: { responsive: true, maintainAspectRatio: false, scales: { r: { grid: { color: 'rgba(128,128,128,0.2)' }, angleLines: { color: 'rgba(128,128,128,0.2)' }, ticks: { display: false }, pointLabels: { color: chartCols, font: { weight: '700', size: 11 } } } }, plugins: { legend: { display: false } } } });
    
    if(trendChart) trendChart.destroy();
    trendChart = new Chart(document.getElementById('trendChart'), { type: 'line', data: { labels: h.map((_,i)=>`E${i+1}`), datasets: [{ data: h.slice().reverse().map(x=>x.score), borderColor: '#6366f1', tension: 0.4, fill: true, backgroundColor: 'rgba(99,102,241,0.1)' }] }, 
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { min: 0, max: 100, ticks: { color: chartCols, font: { size: 10 } }, grid: { color: 'rgba(128,128,128,0.1)' } }, x: { ticks: { color: chartCols, font: { size: 10 } }, grid: { display: false } } }, plugins: { legend: { display: false } } } });
    
    if(distChart) distChart.destroy();
    distChart = new Chart(document.getElementById('distChart'), { type: 'doughnut', data: { labels: ['Safe', 'Weak'], datasets: [{ data: [h.filter(x=>x.score>=50).length, h.filter(x=>x.score<50).length], backgroundColor: ['#10b981', '#ef4444'], borderWidth: 0 }] }, 
        options: { responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { position: 'bottom', labels: { color: chartCols, padding: 20, font: { size: 12, weight: '700' } } } } } });
    
    if(categoryChart) categoryChart.destroy();
    categoryChart = new Chart(document.getElementById('categoryChart'), { type: 'bar', data: { labels: Object.keys(cats), datasets: [{ data: radarData, backgroundColor: (ctx) => ctx.raw >= 50 ? '#10b981' : '#ef4444', borderRadius: 6 }] }, 
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, max: 100, ticks: { color: chartCols, font: { size: 10 } }, grid: { color: 'rgba(128,128,128,0.1)' } }, x: { ticks: { color: chartCols, font: { size: 11, weight: '700' } }, grid: { display: false } } }, plugins: { legend: { display: false } } } });
}

function closeModal() { document.getElementById('modal-container').style.display = 'none'; }
