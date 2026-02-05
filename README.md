# Univerzální konzole pro řízení virtuálních světů

Tento projekt je zaměřen na návrh a implementaci obecné konzolové aplikace, která umožňuje řídit a monitorovat objekty v libovolném virtuálním nebo simulovaném prostředí. Projekt klade důraz na abstrakci, architektonické myšlení a návrh rozhraní.

## Motivace
V reálných systémech často neovládáme přímo konkrétní zařízení nebo aplikace, ale pracujeme s obecným rozhraním, které nám umožňuje komunikovat s různými typy systémů (např. servery, roboti, simulace, informační systémy).

Cílem projektu je pochopit, jak navrhnout takové rozhraní tak, aby bylo:
- univerzální,
- rozšiřitelné,
- nezávislé na konkrétní implementaci světa.

## Cíl projektu
Navrhnout a implementovat konzolovou aplikaci, která:
- umožní uživateli komunikovat s virtuálním světem,
- umožní získávat informace o stavu objektů,
- umožní měnit stav objektů pomocí příkazů,
- bude snadno rozšiřitelná o nové světy, objekty a příkazy.

## Předpoklady (prerekvizity)
Student by měl ovládat:
- základy programování (proměnné, podmínky, cykly),
- práci s funkcemi nebo metodami,
- základní principy objektově orientovaného programování,
- práci s konzolovým vstupem a výstupem.

## Funkční požadavky
- textová konzole (CLI),
- příkazy zadávané uživatelem,
- textová odezva systému,
- minimálně jeden řízený objekt,
- možnost dotazovat se na stav objektu,
- možnost měnit stav objektu.

## Nefunkční požadavky
- přehledná struktura kódu,
- oddělení konzole a logiky světa,
- čitelnost a komentování kódu,
- základní dokumentace řešení.

## Architektonické požadavky
- konzole funguje jako obecné rozhraní,
- svět je samostatná vrstva (modul, třída, balík),
- svět lze vyměnit bez úprav konzole,
- návrh umožňuje snadné přidání nových příkazů.

## Povolené technologie

Povoleno:
- HTML5, CSS3,
- JavaScript (ES6+),
- Fetch API / AJAX,
- Tailwind CSS nebo Bootstrap,
- Web Audio API.
- PHP / Python / Node.js (není nezbytné, možno řešit bez serverových jazyků)

Zakázáno:
- herní enginy,
- Three.js, Unity,
- hotové simulátory.

Cílem je pochopit principy, ne použít hotové řešení.

## Časová osa projektu (2 hodiny týdně)

| Týden | Obsah |
|------|--------|
| 1 | Zadání, návrh, GitHub |
| 2 | Skeleton aplikace |
| 3 | Běžící svět |
| 4 | Základní příkazy |
| 5 | Stav systému |
| 6 | UI / efekty |
| 7 | Dokumentace |
| 8 | Testování |
| 9–10 | Prezentace |

Celkem cca 20 hodin ve škole + domácí práce.

## Doporučené rozdělení rolí v týmu

### a) Terminál / parser
- zpracování vstupu,
- historie příkazů,
- validace.

### b) Simulace světa
- objekty,
- fyzika / pohyb,
- animační smyčka.

### c) UI / design
- vzhled aplikace,
- styl,
- barvy, fonty, zvuky.

Role se mohou v průběhu projektu střídat.

## Motivační příklady světů

### Technické systémy
- správa serveru
- síťová zařízení
- kybernetický dohled

### Herní a simulační světy
- postava ve hře
- strategie
- simulace města

### Robotické systémy
- robot v mapě
- autonomní vozidlo

### Vzdělávací simulace
- fyzikální experiment
- chemická laboratoř

### Abstraktní světy
- finanční trh
- logistická síť
- informační tok v organizaci

## Výstupy projektu
Student odevzdá:
- zdrojový kód aplikace,
- popis architektury,
- seznam podporovaných příkazů,
- ukázkový scénář použití.

## Kritéria hodnocení
Hodnotí se zejména:
- kvalita návrhu,
- míra zobecnění řešení,
- přehlednost a struktura kódu,
- funkčnost konzole,
- připravenost na rozšíření.

## Bonus: Převod na PWA (volitelné)

Pokročilé týmy mohou aplikaci rozšířit o **Progressive Web App**:

- instalace do zařízení,
- offline režim,
- vlastní ikona.

Minimální kroky:
1. manifest.json,
2. service-worker.js,
3. registrace v JS.

Tato část není povinná, ale zvyšuje výsledné hodnocení.
