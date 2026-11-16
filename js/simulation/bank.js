// js/simulation/bank.js
window.bankState = { pendingOffer: null, activeLoan: null, lastPaymentDay: 0 };

window.hasBank = function() {
    return (window.cityState?.buildings || []).some(b => b.type === 'bank');
};

window.requestLoan = function(amount) {
    if (!window.hasBank()) return "Banka neexistuje. Nejdriv ji postav: build bank";
    if (!amount || amount <= 0) return "Pouziti: loan <castka>";
    if (amount > 50000) return "Banka pujcuje max 50 000 Kc.";
    const weeks = Math.max(4, Math.min(20, Math.ceil(amount / 500)));
    const totalRepay = Math.ceil(amount * 1.30);
    const weeklyPayment = Math.ceil(totalRepay / weeks);
    window.bankState.pendingOffer = { amount, weeks, weeklyPayment, totalRepay };
    return `Nabidka banky:
  Pujcka:          ${amount.toLocaleString('cs-CZ')} Kc
  Doba splaceni:   ${weeks} tydnu
  Tydenni splatka: ${weeklyPayment.toLocaleString('cs-CZ')} Kc
  Celkem zaplatis: ${totalRepay.toLocaleString('cs-CZ')} Kc (urok 30 %)

Souhlasis? Napis 'yes' nebo 'no'.`;
};

window.confirmLoan = function() {
    const o = window.bankState.pendingOffer;
    if (!o) return "Zadna aktivni nabidka.";
    if (window.bankState.activeLoan) return "Uz mas aktivni pujcku, nejdriv ji splat.";
    window.cityState.budget += o.amount;
    window.bankState.activeLoan = { remainingWeeks: o.weeks, weeklyPayment: o.weeklyPayment };
    window.bankState.pendingOffer = null;
    window.bankState.lastPaymentDay = window.cityState.day;
    if (window.updateDashboard) window.updateDashboard();
    return `Pujcka schvalena. +${o.amount.toLocaleString('cs-CZ')} Kc pripsano. Splatka ${o.weeklyPayment} Kc/tyden.`;
};

window.cancelLoan = function() {
    if (!window.bankState.pendingOffer) return "Zadna aktivni nabidka.";
    window.bankState.pendingOffer = null;
    return "Pujcka zamitnuta.";
};

window.processBankPayment = function() {
    const loan = window.bankState.activeLoan;
    if (!loan) return;
    const day = window.cityState.day;
    if (day - window.bankState.lastPaymentDay >= 7) {
        window.cityState.budget -= loan.weeklyPayment;
        loan.remainingWeeks--;
        window.bankState.lastPaymentDay = day;
        if (window.showNotification) {
            window.showNotification(`Banka: splatka -${loan.weeklyPayment} Kc (zbyva ${loan.remainingWeeks} tydnu)`);
        }
        if (loan.remainingWeeks <= 0) {
            window.bankState.activeLoan = null;
            if (window.showNotification) window.showNotification("Pujcka splacena!");
        }
    }
};
