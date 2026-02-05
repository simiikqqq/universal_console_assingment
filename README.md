# City Simulation Control Console  jssem gay
**Projektové zadání (SŠ IT)**

---

## 1. Téma
**City Manager**  
Ovládáte centrální městský terminál, pomocí kterého spravujete město – stavíte budovy, řídíte ekonomiku, sledujete populaci, energii a reagujete na krizové situace.

---

## 2. Cíl projektu
Vytvořit webovou aplikaci, která obsahuje:

- textový terminál s vlastní sadou příkazů,
- běžící simulaci města (svět se vyvíjí i bez zásahu uživatele),
- správu zdrojů (peníze, energie, obyvatelstvo),
- dokumentaci a týmovou spolupráci na GitHubu.

Projekt je realizován týmově ve třech.

---

## 3. Rozdělení rolí v týmu

### a) Terminál / parser (Šimon Novák)
- zpracování vstupu z terminálu  
- historie příkazů  
- validace a chybové hlášky  

### b) Simulace města (David Krol)
- logika města (ekonomika, populace, energie)  
- stav budov a infrastruktury  
- časový běh simulace (tick / denní cyklus)  

### c) UI / vizualizace (Musat Isik)
- vzhled aplikace  
- barvy, fonty, ikony  
- grafy, animace, přehled stavu města  

Role se mohou v průběhu projektu střídat.

---

## 4. Ukázka terminálových příkazů

### Základní
- `help` – seznam dostupných příkazů  
- `clear` – vymazání terminálu  

### Stav města
- `city_status` – celkový stav města  
- `population` – počet obyvatel  
- `economy` – stav rozpočtu  

### Budovy
- `build (type)` – postavení budovy  
- `buildings` – seznam budov  

### Energie
- `energy_status` – výroba a spotřeba energie  
- `power (on/off)` – zapnutí / vypnutí výroby  

### Řízení simulace
- `next_day` – posun času  
- `freeze` – pozastavení simulace  
- `resume` – pokračování simulace  
- `speed (value)` – změna rychlosti simulace  

Každý příkaz:
- mění stav simulace,
- vrací textovou odpověď do terminálu.

---

## 5. Technologie
- HTML, CSS  
- JavaScript  
- SVG / Canvas  
- JSON (konfigurace města)  
- případně Web Audio (notifikace)

---

## 6. Časová osa projektu (2 hodiny týdně)

| Týden | Obsah |
|-----|------|
| 1 | Zadání, návrh města, GitHub |
| 2 | Skeleton aplikace |
| 3 | Běžící simulace |
| 4 | Základní příkazy |
| 5 | Ekonomika a populace |
| 6 | UI / vizuální efekty |
| 7 | Dokumentace |
| 8 | Testování |
| 9–10 | Prezentace |

Celkem cca **20 hodin ve škole + domácí práce**.

---

## 7. Povinné technické požadavky
Projekt musí obsahovat:

- vlastní textový terminál,  
- parser příkazů,  
- běžící simulační smyčku,  
- minimálně **8 funkčních příkazů**,  
- oddělení logiky a vizualizace,  
- veřejný GitHub repozitář.

---
