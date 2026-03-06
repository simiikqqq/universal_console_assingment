export function formatNumber(num) {
    return new Intl.NumberFormat('cs-CZ').format(num);
}

export function percentage(value) {
    return value + " %";
}
