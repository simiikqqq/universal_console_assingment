// js/ui/charts.js
// KOMPAKTNÍ verze pro 3 grafy vedle sebe – sparkline + velké číslo

if (!window.CHART_DATA) {
    window.CHART_DATA = {
        population: [],
        budget: [],
        energy: []
    };
}

function addToChart(metric, value) {
    if (!window.CHART_DATA[metric]) return;
    const currentDay = window.cityState?.day || 0;

    window.CHART_DATA[metric].push({
        day: currentDay,
        value: Math.floor(value)
    });

    if (window.CHART_DATA[metric].length > 60) {
        window.CHART_DATA[metric].shift();
    }
}

function drawChart(canvasId, data, title, color) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const parent = canvas.parentElement;

    // Velikost z CSS (responsivní) – nastavíme buffer 1:1
    const cssW = canvas.clientWidth || parent.clientWidth - 20;
    const cssH = canvas.clientHeight || 110;
    const dpr = window.devicePixelRatio || 1;

    if (canvas.width !== cssW * dpr || canvas.height !== cssH * dpr) {
        canvas.width  = cssW * dpr;
        canvas.height = cssH * dpr;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const w = cssW, h = cssH;

    // pozadí
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, w, h);

    if (!data || data.length < 2) {
        ctx.fillStyle = '#6e7681';
        ctx.font = '11px Consolas, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Čekám na data...', w / 2, h / 2);
        return;
    }

    const values = data.map(p => p.value);
    const maxV = Math.max(...values);
    const minV = Math.min(...values);
    const range = (maxV - minV) || 1;

    const padTop = 4, padBottom = 6, padL = 4, padR = 4;
    const gW = w - padL - padR;
    const gH = h - padTop - padBottom;
    const step = gW / (data.length - 1);

    // Horizontální grid (3 čáry)
    ctx.strokeStyle = '#21262d';
    ctx.lineWidth = 1;
    for (let i = 1; i < 3; i++) {
        const y = padTop + (gH * i / 3);
        ctx.beginPath();
        ctx.moveTo(padL, y);
        ctx.lineTo(padL + gW, y);
        ctx.stroke();
    }

    // Křivka
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    data.forEach((p, i) => {
        const x = padL + i * step;
        const y = padTop + gH * (1 - (p.value - minV) / range);
        if (i === 0) ctx.moveTo(x, y);
        else         ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Fill pod křivkou
    const grad = ctx.createLinearGradient(0, padTop, 0, padTop + gH);
    grad.addColorStop(0, color + '55');
    grad.addColorStop(1, color + '00');
    ctx.fillStyle = grad;
    ctx.lineTo(padL + gW, padTop + gH);
    ctx.lineTo(padL, padTop + gH);
    ctx.closePath();
    ctx.fill();

    // Velké aktuální číslo (vlevo nahoře)
    const current = values[values.length - 1];
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Consolas, monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(current.toLocaleString('cs-CZ'), 6, 4);

    // Trend (šipka) vpravo nahoře
    const prev = values[values.length - 2];
    const diff = current - prev;
    if (diff !== 0) {
        ctx.fillStyle = diff > 0 ? '#3fb950' : '#f85149';
        ctx.font = 'bold 11px Consolas, monospace';
        ctx.textAlign = 'right';
        ctx.fillText((diff > 0 ? '▲ +' : '▼ ') + diff.toLocaleString('cs-CZ'), w - 6, 6);
    }

    // Rozsah min-max dolní řádek
    ctx.fillStyle = '#6e7681';
    ctx.font = '9px Consolas, monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText('min ' + minV.toLocaleString('cs-CZ'), 4, h - 2);
    ctx.textAlign = 'right';
    ctx.fillText('max ' + maxV.toLocaleString('cs-CZ'), w - 4, h - 2);
}

function updateAllCharts() {
    const d = window.CHART_DATA;
    drawChart('population-chart', d.population, 'Populace', '#58a6ff');
    drawChart('budget-chart',     d.budget,     'Rozpočet', '#f4a261');
    drawChart('energy-chart',     d.energy,     'Energie',  '#2ecc71');
}

// Překreslení při změně velikosti okna
window.addEventListener('resize', () => {
    if (typeof updateAllCharts === 'function') updateAllCharts();
});

window.addToChart = addToChart;
window.updateAllCharts = updateAllCharts;
window.updateChart = updateAllCharts; // zpětná kompatibilita
