import { CHART_HISTORY } from "../utils/constants.js";

export function initChart() {
    const canvas = document.getElementById("cityChart");
    const ctx = canvas.getContext("2d");

    canvas.width = 600;
    canvas.height = 300;

    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 3;
    ctx.beginPath();

    const max = Math.max(...CHART_HISTORY);
    const stepX = canvas.width / (CHART_HISTORY.length - 1);

    CHART_HISTORY.forEach((value, index) => {
        const x = index * stepX;
        const y = canvas.height - (value / max) * canvas.height;

        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });

    ctx.stroke();
}
