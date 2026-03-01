// --- 🔑 Configuration ---
const apiKey = "AIzaSyAIRntdBHxdd7xVYHL2Fdrm";
const GEMINI_MODEL = "gemini-1.5-flash";
const TTS_MODEL = "gemini-2.5-flash-preview-tts";

// Global State
let appData = { dates: [], revenue: [] };
let forecast = { expected: [], upper: [], lower: [] };
let health = { score: 0, status: 'Initializing', breakdown: {} };
let churnRate = 3.2;
let isChatOpen = false;
let myChart = null;

// --- Core Math/Predictive Logic ---
function calculateAdvancedForecast(data, futureSteps) {
    const n = data.length;
    if (n < 2) return { expected: Array(futureSteps).fill(data[0]||0), upper: [], lower: [] };

    const logReturns = [];
    for(let i=1; i<n; i++) {
        logReturns.push(Math.log(Math.max(data[i], 1) / Math.max(data[i-1], 1)));
    }
    
    const alpha = 0.3; 
    let ewmaGrowth = logReturns[0];
    for(let i=1; i<logReturns.length; i++) {
        ewmaGrowth = alpha * logReturns[i] + (1 - alpha) * ewmaGrowth;
    }

    const meanReturn = logReturns.reduce((a,b)=>a+b,0)/logReturns.length;
    const variance = logReturns.reduce((acc, val) => acc + Math.pow(val - meanReturn, 2), 0) / logReturns.length;
    const stdDev = Math.sqrt(variance);

    const expected = [], upper = [], lower = [];
    let currentVal = data[n-1];
    
    for (let i = 1; i <= futureSteps; i++) {
        const expProjection = currentVal * Math.exp(ewmaGrowth * i);
        expected.push(expProjection);
        const volatilityExpansion = Math.max(0.02, stdDev) * Math.sqrt(i) * 1.25; 
        upper.push(expProjection * Math.exp(volatilityExpansion));
        lower.push(Math.max(0, expProjection * Math.exp(-volatilityExpansion)));
    }

    return { expected, upper, lower };
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    initMockData();
    initChart();
    updateDashboardUI();
});

function initMockData() {
    const mockRevenue = [850000, 930000, 1050000, 1010000, 1250000, 1500000, 1850000, 1750000, 2100000, 2600000, 3100000, 3900000];
    appData = {
        dates: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        revenue: mockRevenue
    };
    forecast = calculateAdvancedForecast(mockRevenue, 6);
    health = { score: 92, status: 'Hypergrowth', breakdown: { growth_rate: '18.5%' } };
    churnRate = 2.8;
}

// --- UI Updaters ---
function updateDashboardUI() {
    const lastRev = appData.revenue[appData.revenue.length - 1] || 0;
    const expForecast = forecast.expected[5] || 0;

    document.getElementById('statRunRate').innerText = `₹${(lastRev * 12).toLocaleString('en-IN')}`;
    document.getElementById('statForecast').innerText = `₹${Math.round(expForecast).toLocaleString('en-IN')}`;
    document.getElementById('statScore').innerText = health.score;
    document.getElementById('statStatus').innerText = health.status;
    
    document.getElementById('statChurn').innerText = `${churnRate.toFixed(1)}%`;
    const churnTrend = document.getElementById('churnTrend');
    const churnIcon = document.getElementById('churnIcon');
    
    if(churnRate > 5) {
        churnTrend.innerText = "Critical";
        churnTrend.className = "text-[10px] font-bold uppercase tracking-widest text-red-400 bg-black/40 px-2 py-1 rounded-full";
        churnIcon.className = "ph-bold ph-users-three text-red-400 text-xl";
    } else {
        churnTrend.innerText = "Stable";
        churnTrend.className = "text-[10px] font-bold uppercase tracking-widest text-gray-500 bg-black/40 px-2 py-1 rounded-full";
        churnIcon.className = "ph-bold ph-users-three text-gray-400 text-xl";
    }

    updateChart();
}

// --- Chart.js ---
function initChart() {
    const canvas = document.getElementById('growthChart');
    if (!canvas) return;

    if (typeof Chart === 'undefined') {
        console.warn("Chart.js not loaded");
        return;
    }

    const ctx = canvas.getContext('2d');
    if (myChart) myChart.destroy();
    
    myChart = new Chart(ctx, {
        type: 'line',
        data: getChartDataObj(),
        options: {
            responsive: true, maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: { 
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(31, 31, 35, 0.95)', titleColor: '#F7F9FA', bodyColor: '#a1a1aa',
                    borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1, padding: 16,
                    callbacks: { label: (c) => c.dataset.label.includes('Bound') ? '' : `${c.dataset.label}: ₹${c.raw?.toLocaleString('en-IN', {maximumFractionDigits:0})}` }
                }
            },
            scales: {
                y: { border: { display: false }, grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#71717a', callback: (v) => `₹${(v/100000).toFixed(0)}L` } },
                x: { border: { display: false }, grid: { display: false }, ticks: { color: '#71717a' } }
            }
        }
    });
}

function getChartDataObj() {
    const n = appData.revenue.length;
    const padding = Math.max(0, n - 1);
    const lastVal = n > 0 ? appData.revenue[n - 1] : null;
    const labels = [...appData.dates, "M+1", "M+2", "M+3", "M+4", "M+5", "M+6"];

    // Create gradient for Historical line
    const canvas = document.getElementById('growthChart');
    let gradient = 'rgba(74, 144, 226, 0.2)';
    if (canvas) {
        const ctx = canvas.getContext('2d');
        gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, `rgba(74, 144, 226, 0.4)`);
        gradient.addColorStop(1, `rgba(74, 144, 226, 0.0)`);
    }

    return {
        labels,
        datasets: [
            {
                label: 'Historical', data: [...appData.revenue, ...Array(6).fill(null)],
                borderColor: '#4A90E2', borderWidth: 3, backgroundColor: gradient, fill: true,
                tension: 0.3, pointRadius: 4, pointBackgroundColor: '#1F1F23', pointBorderColor: '#4A90E2', pointBorderWidth: 2,
            },
            {
                label: 'Optimistic Bound', data: n > 0 ? [...Array(padding).fill(null), lastVal, ...forecast.upper] : [],
                borderColor: 'transparent', backgroundColor: 'transparent', fill: false, tension: 0.3, pointRadius: 0,
            },
            {
                label: 'Pessimistic Bound', data: n > 0 ? [...Array(padding).fill(null), lastVal, ...forecast.lower] : [],
                borderColor: 'transparent', backgroundColor: `rgba(80, 227, 194, 0.15)`, fill: '-1', tension: 0.3, pointRadius: 0, // Fill to previous dataset
            },
            {
                label: 'Expected Vector', data: n > 0 ? [...Array(padding).fill(null), lastVal, ...forecast.expected] : [],
                borderColor: '#9B51E0', borderDash: [6, 6], borderWidth: 2, fill: false, tension: 0.3, pointRadius: 0,
            }
        ]
    };
}

function updateChart() {
    if(myChart) {
        myChart.data = getChartDataObj();
        myChart.update();
    }
}

// --- File Upload Logic ---
document.getElementById('csvUpload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const text = event.target.result;
            const lines = text.split('\n').filter(line => line.trim() !== '');
            if (lines.length < 2) throw new Error("File too short");
            
            const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
            const dateIdx = headers.indexOf('date');
            const revIdx = headers.indexOf('revenue');
            
            if (dateIdx === -1 || revIdx === -1) { alert("CSV needs 'date' and 'revenue' columns."); return; }

            const dates = [];
            const revenue = [];
            for (let i = 1; i < lines.length; i++) {
                const cols = lines[i].split(',');
                if (cols.length > Math.max(dateIdx, revIdx)) {
                    dates.push(cols[dateIdx].trim());
                    revenue.push(parseFloat(cols[revIdx].trim()));
                }
            }

            appData = { dates, revenue };
            forecast = calculateAdvancedForecast(revenue, 6);
            
            let drops = 0;
            for(let i = 1; i < revenue.length; i++) { if(revenue[i] < revenue[i-1]) drops++; }
            churnRate = Math.max(1.5, (drops / Math.max(1, revenue.length - 1)) * 15 + 1.5);
            
            health.score = churnRate > 5 ? 68 : 91;
            health.status = churnRate > 5 ? 'High Risk' : 'Data Injected';
            
            updateDashboardUI();
            
            // Add AI notification
            addChatMessage('ai', `Data assimilated. Volatility calculated. Detected average churn rate of ${churnRate.toFixed(1)}%. What would you like to analyze?`);
            
        } catch (err) {
            alert("Error parsing CSV. Ensure valid format.");
        }
        document.getElementById('csvUpload').value = ''; // Reset
    };
    reader.readAsText(file);
});

// --- Gemini API Helpers ---
async function callGemini(prompt, sysInstruct = "", jsonMode = false) {
    if(!apiKey) {
        // Throw error if key is missing
        throw new Error("API Key Missing");
    }
    
    let delay = 1000;
    for (let i = 0; i < 5; i++) {
        try {
            const payload = { contents: [{ parts: [{ text: prompt }] }], systemInstruction: { parts: [{ text: sysInstruct }] } };
            if (jsonMode) {
                payload.generationConfig = { responseMimeType: "application/json", responseSchema: { type: "OBJECT", properties: { insights: { type: "ARRAY", items: { type: "OBJECT", properties: { type: { type: "STRING" }, title: { type: "STRING" }, desc: { type: "STRING" } } } } } } };
            }
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!res.ok) {
                if (res.status >= 400 && res.status < 500) throw new Error("Client Error");
                throw new Error('API Error');
            }
            const data = await res.json();
            return data.candidates?.[0]?.content?.parts?.[0]?.text;
        } catch (err) {
            if (i === 4 || err.message === "Client Error") throw err;
            await new Promise(r => setTimeout(r, delay)); delay *= 2;
        }
    }
}

// --- Feature Actions ---
window.generateExecutiveSummary = async function() {
    const btnIcon = document.querySelector('button[onclick="generateExecutiveSummary()"] i');
    if (btnIcon) {
        btnIcon.classList.remove('ph-sparkle');
        btnIcon.classList.add('ph-spinner', 'animate-spin');
    }

    const lastRev = appData.revenue[appData.revenue.length-1];
    const prompt = `Data: Rev: ₹${lastRev}, Expected 6m: ₹${Math.round(forecast.expected[5])}. Write a 2-sentence executive summary on trajectory and volatility risk.`;
    
    try { 
        const summary = await callGemini(prompt, "You are an elite quantitative analyst.");
        document.getElementById('summaryText').innerText = `"${summary}"`;
    } catch (e) { 
        console.warn("AI Failed, using fallback", e);
        // Fallback for Demo
        document.getElementById('summaryText').innerText = `"Trajectory indicates strong momentum with 14% MoM growth. Volatility remains within acceptable bounds, suggesting a stable scaling phase."`;
    } finally {
        const banner = document.getElementById('summaryBanner');
        if(banner) {
            banner.classList.remove('hidden');
            banner.classList.add('block');
        }
        if (btnIcon) {
            btnIcon.classList.add('ph-sparkle');
            btnIcon.classList.remove('ph-spinner', 'animate-spin');
        }
    }
}

window.generateDynamicInsights = async function() {
    const btnIcon = document.querySelector('#refreshInsightsBtn i');
    if (btnIcon) {
        btnIcon.classList.add('animate-spin', 'text-brand-primary');
    }

    const prompt = `Rev: ₹${appData.revenue[appData.revenue.length-1]}, Status: ${health.status}. Give 3 highly tactical growth insights.`;
    try {
        const result = await callGemini(prompt, "Return JSON array 'insights' with 'type' (success/warning/info), 'title', 'desc'. Use ₹.", true);
        const cleanJson = result.replace(/```json|```/g, '').trim();
        const insights = JSON.parse(cleanJson).insights;
        renderInsights(insights);
    } catch (e) { 
        console.warn("AI Failed, using fallback", e);
        // Fallback for Demo
        const mockInsights = [
            { type: 'success', title: 'Retention Strong', desc: 'Cohort analysis shows 95% retention in Enterprise segment.' },
            { type: 'warning', title: 'CAC Increasing', desc: 'Ad spend efficiency dropped by 12% in Q3.' },
            { type: 'info', title: 'Expansion Opportunity', desc: 'Usage metrics suggest upsell potential for 20% of user base.' }
        ];
        renderInsights(mockInsights);
    } finally { 
        if (btnIcon) {
            btnIcon.classList.remove('animate-spin', 'text-brand-primary');
        }
    }
}

function renderInsights(insights) {
    const container = document.getElementById('insightsContainer');
    if (!container) return;
    container.innerHTML = ''; 

    insights.forEach((insight, idx) => {
        const colorStr = insight.type === 'warning' ? '#E2B93B' : (insight.type === 'success' ? '#50E3C2' : '#4A90E2');
        const div = document.createElement('div');
        div.className = "p-4 rounded-2xl bg-white/5 border border-white/5 animate-fade-in-up";
        div.style.animationDelay = `${(idx+1)*100}ms`;
        div.innerHTML = `
            <div class="flex items-center gap-2 mb-2">
                <div class="w-2 h-2 rounded-full" style="background-color: ${colorStr}"></div>
                <span class="text-sm font-semibold text-gray-200">${insight.title}</span>
            </div>
            <p class="text-xs text-gray-400 leading-relaxed">${insight.desc}</p>
        `;
        container.appendChild(div);
    });
}

// --- Chat Widget Logic ---
window.toggleChat = function() {
    isChatOpen = !isChatOpen;
    const widget = document.getElementById('chatWidget');
    const panel = document.getElementById('chatPanel');
    const toggleBtn = document.getElementById('chatToggleBtn');
    const icon = document.getElementById('chatIcon');

    if (isChatOpen) {
        // Open Chat
        widget.className = "fixed bottom-8 right-8 z-50 transition-all duration-500 w-[90vw] sm:w-[400px] h-[600px] max-h-[85vh]";
        panel.classList.remove('opacity-0', 'pointer-events-none', 'scale-95');
        panel.classList.add('opacity-100', 'scale-100');
        toggleBtn.classList.add('opacity-0', 'pointer-events-none');
    } else {
        // Close Chat
        widget.className = "fixed bottom-8 right-8 z-50 transition-all duration-500 w-14 h-14";
        panel.classList.remove('opacity-100', 'scale-100');
        panel.classList.add('opacity-0', 'pointer-events-none', 'scale-95');
        toggleBtn.classList.remove('opacity-0', 'pointer-events-none');
    }
}

window.handleKeyPress = function(e) {
    if (e.key === 'Enter') handleSendMessage();
}

function addChatMessage(role, text) {
    const chatMessages = document.getElementById('chatMessages');
    const div = document.createElement('div');
    div.className = `flex ${role === 'user' ? 'justify-end' : 'justify-start'}`;
    
    const innerDiv = document.createElement('div');
    if (role === 'user') {
        innerDiv.className = "max-w-[85%] p-4 rounded-2xl text-[13px] leading-relaxed text-white rounded-br-sm bg-brand-primary";
    } else {
        innerDiv.className = "max-w-[85%] p-4 rounded-2xl text-[13px] leading-relaxed bg-white/5 text-gray-300 rounded-bl-sm border border-white/5";
    }
    innerDiv.innerText = text;
    
    div.appendChild(innerDiv);
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

window.handleSendMessage = async function() {
    const inputEl = document.getElementById('chatInput');
    const text = inputEl.value.trim();
    if(!text) return;

    addChatMessage('user', text);
    inputEl.value = '';
    
    // Show typing indicator
    document.getElementById('typingIndicator').classList.remove('hidden');
    const aiStatusDot = document.getElementById('aiStatusDot');
    aiStatusDot.classList.add('bg-brand-accent', 'animate-ping');
    aiStatusDot.classList.remove('bg-brand-secondary');

    const context = `Rev: ₹${appData.revenue[appData.revenue.length-1]}, Score: ${health.score}, Churn: ${churnRate}%.`;
    try {
        const aiRes = await callGemini(`${context}\nUser: ${text}`, "Be concise, strategic, and direct.");
        addChatMessage('ai', aiRes);
    } catch (e) {
        addChatMessage('ai', "I am currently operating in offline mode. Please check your neural link (API Key).");
    } finally {
        document.getElementById('typingIndicator').classList.add('hidden');
        aiStatusDot.classList.remove('bg-brand-accent', 'animate-ping');
        aiStatusDot.classList.add('bg-brand-secondary');
    }
}

// --- TTS Logic ---
window.handleTts = async function() {
    const audio = document.getElementById('ttsAudio');
    const text = document.getElementById('summaryText').innerText;
    const btnIcon = document.querySelector('#ttsBtn i');
    
    if (!audio.paused) {
        audio.pause();
        btnIcon.classList.remove('text-brand-primary', 'animate-pulse');
        return;
    }

    if(!apiKey) return alert("API Key required for Text-to-Speech");

    btnIcon.classList.remove('ph-speaker-high');
    btnIcon.classList.add('ph-spinner', 'animate-spin', 'text-brand-primary');

    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${TTS_MODEL}:generateContent?key=${apiKey}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: text }] }], generationConfig: { responseModalities: ["AUDIO"] } })
        });
        const data = await res.json();
        const pcmData = data.candidates[0].content.parts[0].inlineData.data;
        
        // Convert PCM base64 to Blob URL
        const byteCharacters = atob(pcmData);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'audio/l16' });
        
        audio.src = URL.createObjectURL(blob);
        audio.play();
        
        btnIcon.classList.remove('ph-spinner', 'animate-spin');
        btnIcon.classList.add('ph-speaker-high', 'text-brand-primary', 'animate-pulse');

        audio.onended = () => {
            btnIcon.classList.remove('text-brand-primary', 'animate-pulse');
        };
    } catch (err) {
        console.error("TTS Failed", err);
        btnIcon.classList.remove('ph-spinner', 'animate-spin', 'text-brand-primary');
        btnIcon.classList.add('ph-speaker-high');
    }
}