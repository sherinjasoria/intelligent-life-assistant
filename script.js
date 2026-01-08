/* =======================
   Intelligent Life Assistant
   INSANE VERSION - FIXED
   ======================= */

let data = JSON.parse(localStorage.getItem("lifeAI")) || [];
let lastDate = localStorage.getItem("lastDate") || null;

/* ---------- SAVE DAY ---------- */
function saveDay() {

    const sleepInput = document.getElementById("sleep");
    const studyInput = document.getElementById("study");
    const screenInput = document.getElementById("screen");
    const moodInput = document.getElementById("mood");

    if (
        sleepInput.value === "" ||
        studyInput.value === "" ||
        screenInput.value === "" ||
        moodInput.value === ""
    ) {
        alert("Fill all fields");
        return;
    }

    const s = Number(sleepInput.value);
    const st = Number(studyInput.value);
    const sc = Number(screenInput.value);
    const m = Number(moodInput.value);

    const today = new Date().toLocaleDateString();

    // Prevent duplicate same-day entry
    if (data.length && data[data.length - 1].date === today) {
        alert("Today's data already added!");
        return;
    }

    const entry = { date: today, s, st, sc, m };
    data.push(entry);
    localStorage.setItem("lifeAI", JSON.stringify(data));

    calculateScore(entry);
    detectBurnout();
    generateInsights(entry);
    predictTomorrow();
    updateStreak(today);
    weeklySummary();
    drawChart();
}

/* ---------- LIFE SCORE ---------- */
function calculateScore(e) {
    let score = 100;

    if (e.s < 6) score -= 15;
    if (e.st < 2) score -= 15;
    if (e.sc > 6) score -= 20;
    if (e.m <= 2) score -= 20;

    score = Math.max(score, 0);

    document.getElementById("score").innerText = score;
    document.getElementById("bar").style.width = score + "%";

    document.getElementById("burnout").innerText =
        score > 75 ? "🔥 Excellent balance" :
        score > 50 ? "⚠️ Needs improvement" :
        "🚨 High burnout risk";
}

/* ---------- BURNOUT DETECTOR ---------- */
function detectBurnout() {
    if (data.length < 3) {
        document.getElementById("burnout").innerText += " (collecting data)";
        return;
    }

    const recent = data.slice(-3);
    const avgMood = recent.reduce((sum, d) => sum + d.m, 0) / recent.length;

    if (avgMood <= 2) {
        document.getElementById("burnout").innerText = "🚨 HIGH Burnout Risk";
    } else if (avgMood <= 3) {
        document.getElementById("burnout").innerText = "⚠️ Medium Burnout Risk";
    } else {
        document.getElementById("burnout").innerText = "✅ Low Burnout Risk";
    }
}

/* ---------- AI INSIGHTS ---------- */
function generateInsights(e) {
    let insights = [];

    if (e.s < 6) insights.push("Chronic sleep deprivation detected.");
    if (e.sc > 6) insights.push("Excessive screen time affecting focus.");
    if (e.st < 2) insights.push("Low productivity trend noticed.");
    if (e.m <= 2) insights.push("Emotional fatigue signals observed.");

    if (!insights.length) {
        insights.push("Lifestyle balance looks strong today.");
    }

    document.getElementById("insights").innerHTML =
        insights.map(i => "• " + i).join("<br>");
}

/* ---------- TOMORROW PREDICTION ---------- */
function predictTomorrow() {
    const recent = data.slice(-5);
    const avgMood = recent.reduce((sum, d) => sum + d.m, 0) / recent.length;

    const prediction =
        avgMood >= 4 ? "🔥 Tomorrow looks highly productive" :
        avgMood >= 3 ? "⚠️ Moderate productivity expected" :
        "💤 Low energy predicted — rest advised";

    document.getElementById("prediction").innerText = prediction;
}

/* ---------- STREAK LOGIC ---------- */
function updateStreak(today) {
    let streakEl = document.getElementById("streak");

    if (!lastDate) {
        streakEl.innerText = 1;
    } else {
        const diff =
            (new Date(today) - new Date(lastDate)) / (1000 * 60 * 60 * 24);

        streakEl.innerText = diff <= 1.1 ? Number(streakEl.innerText) + 1 : 1;
    }

    lastDate = today;
    localStorage.setItem("lastDate", lastDate);
}

/* ---------- WEEKLY SUMMARY ---------- */
function weeklySummary() {
    if (data.length < 7) {
        document.getElementById("summary").innerText =
            "Add more days to generate weekly AI summary.";
        return;
    }

    const week = data.slice(-7);
    const avgMood =
        (week.reduce((sum, d) => sum + d.m, 0) / 7).toFixed(1);

    document.getElementById("summary").innerText =
        `This week shows an average mood of ${avgMood}. 
        Your productivity strongly correlates with sleep consistency and screen usage. 
        Improving sleep hygiene can significantly enhance performance.`;
}

/* ---------- CHART ---------- */
function drawChart() {
    const ctx = document.getElementById("chart");

    if (window.lifeChart) window.lifeChart.destroy();

    window.lifeChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: data.map(d => d.date),
            datasets: [
                {
                    label: "Sleep",
                    data: data.map(d => d.s),
                    borderColor: "#00ffcc",
                    fill: false
                },
                {
                    label: "Study",
                    data: data.map(d => d.st),
                    borderColor: "#00c6ff",
                    fill: false
                },
                {
                    label: "Screen",
                    data: data.map(d => d.sc),
                    borderColor: "#ff7675",
                    fill: false
                }
            ]
        }
    });
}

/* ---------- INITIAL LOAD ---------- */
drawChart();
