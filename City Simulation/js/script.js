import { CITY_DATA } from "./constants.js";
import { Logger } from "./logger.js";
import { initDashboard } from "../ui/dashboard.js";
import { initChart } from "../ui/charts.js";
import { initNotifications } from "../ui/notifications.js";
import { initAnimations } from "../ui/animation.js";

document.addEventListener("DOMContentLoaded", () => {
    Logger.info("Aplikace spuštěna");

    initDashboard(CITY_DATA);
    initChart();
    initNotifications();
    initAnimations();
});
