    // js/ui/cityMap.js
    // SVG vizualizace města: grass + silniční síť (pattern), budovy, chodící lidé
    // - Dynamické rozšiřování mapy (spirálové umísťování budov od středu ven)
    // - Lidé chodí po silnicích (Manhattan path), počet = populace (capped pro výkon)
    // - Pan (drag) + Zoom (wheel) + auto-fit
    // - Nové budovy se animovaně "vznikají"

    (function () {
        const SVG_NS = 'http://www.w3.org/2000/svg';
        const CELL = 100;                 // velikost jedné parcely (včetně silnic)
        const ROAD_W = 14;                // šířka silnice uvnitř buňky
        const MAX_PEOPLE = 150;           // max. počet teček na mapě (výkon)

        // ===== Spirálový generátor volných parcel (od 0,0 ven) =====
        function* spiralGen() {
            yield [0, 0];
            let step = 1;
            while (true) {
                // pravo
                for (let i = 0; i < step; i++) { yield null; }
                // dolu
                for (let i = 0; i < step; i++) { yield null; }
                step++;
            }
        }

        // Jednodušší: precomputed spiral list on demand
        function spiralCoords(n) {
            const out = [[0, 0]];
            let x = 0, y = 0, dx = 1, dy = 0, steps = 1;
            while (out.length < n) {
                for (let s = 0; s < 2; s++) {
                    for (let i = 0; i < steps && out.length < n; i++) {
                        x += dx; y += dy;
                        out.push([x, y]);
                    }
                    // rotate 90° CCW: (dx,dy) -> (-dy,dx)
                    [dx, dy] = [-dy, dx];
                }
                steps++;
            }
            return out;
        }

        const CityMap = {
            container: null,
            svg: null,
            viewportG: null,        // transformovaný pro pan/zoom
            bgLayer: null,          // pozadí (grass + roads pattern)
            buildingLayer: null,
            peopleLayer: null,

            buildings: [],          // {id, type, gx, gy, el, cx, cy}
            people: [],             // {el, x, y, tx, ty, speed, color}
            occupied: new Map(),    // "gx,gy" -> buildingId
            spiralIndex: 0,

            // pan/zoom
            tx: 0, ty: 0, scale: 1,
            isDragging: false,
            dragStart: null,

            // viewBox (logical coords)
            viewBox: { x: -300, y: -300, w: 600, h: 600 },

            lastTick: 0,
            rafId: null,

            init(containerId) {
                this.container = document.getElementById(containerId);
                if (!this.container) {
                    console.warn('CityMap: kontejner #' + containerId + ' nenalezen');
                    return;
                }

                this.svg = document.createElementNS(SVG_NS, 'svg');
                this.svg.setAttribute('xmlns', SVG_NS);
                this.svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
                this._applyViewBox();

                // --- Defs: pattern grass+roads ---
                const defs = document.createElementNS(SVG_NS, 'defs');
                defs.innerHTML = `
                    <pattern id="grassRoad" width="${CELL}" height="${CELL}" patternUnits="userSpaceOnUse">
                        <!-- trávník -->
                        <rect width="${CELL}" height="${CELL}" fill="#3d7a4f"/>
                        <!-- drobný šum -->
                        <circle cx="20" cy="30" r="1.2" fill="#2f6640" opacity="0.55"/>
                        <circle cx="70" cy="55" r="1.0" fill="#4c8c5e" opacity="0.55"/>
                        <circle cx="45" cy="80" r="1.3" fill="#2f6640" opacity="0.55"/>
                        <!-- silnice: levý svislý pruh -->
                        <rect x="0" y="0" width="${ROAD_W}" height="${CELL}" fill="#3a3f45"/>
                        <!-- silnice: horní vodorovný pruh -->
                        <rect x="0" y="0" width="${CELL}" height="${ROAD_W}" fill="#3a3f45"/>
                        <!-- středová žlutá čára svislá -->
                        <line x1="${ROAD_W/2}" y1="0" x2="${ROAD_W/2}" y2="${CELL}"
                            stroke="#ffd84a" stroke-width="0.8" stroke-dasharray="5,5" opacity="0.75"/>
                        <!-- středová žlutá čára vodorovná -->
                        <line x1="0" y1="${ROAD_W/2}" x2="${CELL}" y2="${ROAD_W/2}"
                            stroke="#ffd84a" stroke-width="0.8" stroke-dasharray="5,5" opacity="0.75"/>
                    </pattern>
                    <!-- stín pro budovy -->
                    <filter id="bldgShadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="2" dy="3" stdDeviation="2" flood-opacity="0.45"/>
                    </filter>
                `;
                this.svg.appendChild(defs);

                // --- Vrstva pro pan/zoom ---
                this.viewportG = document.createElementNS(SVG_NS, 'g');
                this.viewportG.setAttribute('class', 'viewport');
                this.svg.appendChild(this.viewportG);

                // Pozadí (velký rect s patternem) – zvětšíme dle potřeby
                this.bgLayer = document.createElementNS(SVG_NS, 'rect');
                this.bgLayer.setAttribute('x', '-5000');
                this.bgLayer.setAttribute('y', '-5000');
                this.bgLayer.setAttribute('width', '10000');
                this.bgLayer.setAttribute('height', '10000');
                this.bgLayer.setAttribute('fill', 'url(#grassRoad)');
                this.viewportG.appendChild(this.bgLayer);

                // Vrstvy
                this.buildingLayer = document.createElementNS(SVG_NS, 'g');
                this.buildingLayer.setAttribute('class', 'buildings');
                this.viewportG.appendChild(this.buildingLayer);

                this.peopleLayer = document.createElementNS(SVG_NS, 'g');
                this.peopleLayer.setAttribute('class', 'people');
                this.viewportG.appendChild(this.peopleLayer);

                this.container.appendChild(this.svg);

                // Ovládání pan/zoom
                this._bindInteractions();

                // Inicializace počátečních lidí podle cityState
                const pop = (window.cityState && window.cityState.population) || 0;
                this.setPopulation(pop);

                // Start animace
                this.lastTick = performance.now();
                this._tick();

                // Tlačítka
                const btnIn  = document.getElementById('map-zoom-in');
                const btnOut = document.getElementById('map-zoom-out');
                const btnR   = document.getElementById('map-reset');
                if (btnIn)  btnIn.onclick  = () => this._zoomBy(1.2);
                if (btnOut) btnOut.onclick = () => this._zoomBy(1 / 1.2);
                if (btnR)   btnR.onclick   = () => this.centerView();

                console.log('CityMap inicializována.');
            },

            // ========== UMÍSŤOVÁNÍ BUDOV ==========
            // Spirála + náhodné vynechání buněk => organičtější roztroušení po mapě
            _nextFreeCell() {
                // Vygeneruj rezervu a jdi po spirále, občas (20 %) přeskoč buňku
                const coords = spiralCoords(this.spiralIndex + 400);
                let guard = 0;
                while (this.spiralIndex < coords.length && guard < 500) {
                    const [gx, gy] = coords[this.spiralIndex++];
                    const key = gx + ',' + gy;
                    if (this.occupied.has(key)) { guard++; continue; }
                    // občas nech buňku volnou pro "trávníkovou mezeru"
                    if (this.buildings.length > 3 && Math.random() < 0.25) {
                        this.occupied.set(key, '__gap__');
                        guard++;
                        continue;
                    }
                    return [gx, gy];
                }
                return [0, 0];
            },

            addBuilding(type, id) {
                const [gx, gy] = this._nextFreeCell();
                const key = gx + ',' + gy;
                this.occupied.set(key, id);

                // Přesný střed zeleného čtverce (bez náhodného offsetu)
                const cx = gx * CELL + ROAD_W + (CELL - ROAD_W) / 2;
                const cy = gy * CELL + ROAD_W + (CELL - ROAD_W) / 2;

                const g = this._createBuildingSVG(type, cx, cy);
                this.buildingLayer.appendChild(g);

                // Po chvíli odstraň glow class (na vnitřním elementu s animací)
                const animEl = g.querySelector('.building-anim');
                if (animEl) setTimeout(() => animEl.classList.remove('new-build'), 3200);

                this.buildings.push({ id, type, gx, gy, el: g, cx, cy });

                // Rozšíření viewBoxu, pokud budova vyjela mimo
                this._ensureVisible(cx, cy);
                this._updateFooter();

                return { gx, gy, cx, cy };
            },

            _createBuildingSVG(type, cx, cy) {
                // Vnější g = POZICOVÁNÍ (SVG transform attribute – nesmí se dotýkat animace)
                const g = document.createElementNS(SVG_NS, 'g');
                g.setAttribute('transform', `translate(${cx}, ${cy})`);
                g.setAttribute('filter', 'url(#bldgShadow)');

                // Vnitřní g = ANIMACE (CSS transform: scale/opacity pouze)
                const anim = document.createElementNS(SVG_NS, 'g');
                anim.setAttribute('class', 'building-anim new-build');

                const size = 72;
                const half = size / 2;

                // Centrovací g = posun tak, aby střed SVG byl v (0,0) anim prostoru
                const inner = document.createElementNS(SVG_NS, 'g');
                inner.setAttribute('transform', `translate(${-half}, ${-half})`);

                let svg = '';
                switch (type) {
                    case 'powerplant':
                        svg = `
                            <rect x="4" y="28" width="64" height="40" fill="#4b5563" stroke="#1f2937" stroke-width="1.5"/>
                            <rect x="14" y="8"  width="12" height="22" fill="#6b7280" stroke="#1f2937" stroke-width="1.2"/>
                            <rect x="46" y="4"  width="12" height="26" fill="#6b7280" stroke="#1f2937" stroke-width="1.2"/>
                            <circle cx="20" cy="6"  r="4" fill="#9ca3af" opacity="0.7"/>
                            <circle cx="26" cy="2"  r="3" fill="#9ca3af" opacity="0.5"/>
                            <circle cx="52" cy="0"  r="5" fill="#9ca3af" opacity="0.7"/>
                            <rect x="14" y="44" width="10" height="10" fill="#fbbf24"/>
                            <rect x="30" y="44" width="10" height="10" fill="#fbbf24"/>
                            <rect x="46" y="44" width="10" height="10" fill="#fbbf24"/>
                        `;
                        break;
                    case 'house':
                        svg = `
                            <polygon points="4,32 36,6 68,32" fill="#b45309" stroke="#7c2d12" stroke-width="1.5"/>
                            <rect x="10" y="32" width="52" height="36" fill="#f3d9b1" stroke="#7c2d12" stroke-width="1.5"/>
                            <rect x="28" y="46" width="16" height="22" fill="#7c2d12"/>
                            <rect x="16" y="40" width="10" height="10" fill="#60a5fa"/>
                            <rect x="46" y="40" width="10" height="10" fill="#60a5fa"/>
                        `;
                        break;
                    case 'shop':
                        svg = `
                            <rect x="4" y="20" width="64" height="48" fill="#e0f2fe" stroke="#0369a1" stroke-width="1.5"/>
                            <!-- pruhovaná markýza -->
                            <rect x="0" y="16" width="72" height="10" fill="#0891b2"/>
                            <rect x="0"  y="16" width="9" height="10" fill="#f0f9ff"/>
                            <rect x="18" y="16" width="9" height="10" fill="#f0f9ff"/>
                            <rect x="36" y="16" width="9" height="10" fill="#f0f9ff"/>
                            <rect x="54" y="16" width="9" height="10" fill="#f0f9ff"/>
                            <!-- výloha -->
                            <rect x="10" y="32" width="20" height="24" fill="#7dd3fc"/>
                            <rect x="36" y="32" width="26" height="36" fill="#0c4a6e"/>
                            <text x="36" y="14" font-size="8" fill="#fff" text-anchor="middle" font-family="Arial">SHOP</text>
                        `;
                        break;
                    case 'school':
                        svg = `
                            <rect x="4" y="22" width="64" height="46" fill="#fcd34d" stroke="#78350f" stroke-width="1.5"/>
                            <!-- střecha -->
                            <polygon points="4,22 36,4 68,22" fill="#b45309" stroke="#78350f" stroke-width="1.5"/>
                            <!-- zvonice -->
                            <rect x="31" y="10" width="10" height="14" fill="#fde68a" stroke="#78350f" stroke-width="1"/>
                            <circle cx="36" cy="16" r="2" fill="#78350f"/>
                            <!-- okna -->
                            <rect x="10" y="32" width="10" height="10" fill="#60a5fa"/>
                            <rect x="24" y="32" width="10" height="10" fill="#60a5fa"/>
                            <rect x="38" y="32" width="10" height="10" fill="#60a5fa"/>
                            <rect x="52" y="32" width="10" height="10" fill="#60a5fa"/>
                            <!-- vchod -->
                            <rect x="30" y="50" width="12" height="18" fill="#78350f"/>
                        `;
                        break;
                    case 'park':
                        svg = `
                            <rect x="2" y="2" width="68" height="68" fill="#86efac" stroke="#14532d" stroke-width="1.2" rx="4"/>
                            <!-- cestička -->
                            <path d="M 2 36 Q 30 20 68 36" stroke="#d6a35c" stroke-width="4" fill="none"/>
                            <!-- stromy -->
                            <circle cx="16" cy="18" r="8" fill="#16a34a" stroke="#14532d" stroke-width="1"/>
                            <circle cx="54" cy="16" r="9" fill="#15803d" stroke="#14532d" stroke-width="1"/>
                            <circle cx="20" cy="54" r="10" fill="#16a34a" stroke="#14532d" stroke-width="1"/>
                            <circle cx="52" cy="54" r="8" fill="#15803d" stroke="#14532d" stroke-width="1"/>
                            <!-- lavička -->
                            <rect x="30" y="40" width="14" height="2" fill="#78350f"/>
                            <rect x="31" y="42" width="2" height="4" fill="#78350f"/>
                            <rect x="41" y="42" width="2" height="4" fill="#78350f"/>
                        `;
                        break;
                    case 'bank':
                        svg = `
                            <rect x="4" y="20" width="64" height="48" fill="#1f2937" stroke="#0b1220" stroke-width="1.5"/>
                            <polygon points="2,22 36,4 70,22" fill="#cbd5e1" stroke="#0b1220" stroke-width="1.2"/>
                            <rect x="10" y="22" width="4" height="46" fill="#cbd5e1"/>
                            <rect x="22" y="22" width="4" height="46" fill="#cbd5e1"/>
                            <rect x="34" y="22" width="4" height="46" fill="#cbd5e1"/>
                            <rect x="46" y="22" width="4" height="46" fill="#cbd5e1"/>
                            <rect x="58" y="22" width="4" height="46" fill="#cbd5e1"/>
                            <rect x="2" y="64" width="68" height="6" fill="#cbd5e1" stroke="#0b1220" stroke-width="1"/>
                            <text x="36" y="16" font-size="11" fill="#fbbf24" text-anchor="middle" font-family="Arial" font-weight="bold">$</text>
                        `;
                        break;
                    default:
                        svg = `<rect x="0" y="0" width="${size}" height="${size}" fill="#999"/>`;
                }
                inner.innerHTML = svg;
                anim.appendChild(inner);
                g.appendChild(anim);
                return g;
            },

            // ========== LIDÉ (chodící tečky) ==========
            setPopulation(n) {
                // Počet teček = min(MAX_PEOPLE, n) ale vždy alespoň 3 pro vizuál
                const target = Math.min(MAX_PEOPLE, Math.max(3, n));

                while (this.people.length < target) {
                    this._spawnPerson();
                }
                while (this.people.length > target) {
                    const p = this.people.pop();
                    if (p && p.el && p.el.parentNode) p.el.parentNode.removeChild(p.el);
                }
                this._updateFooter();
            },

            _spawnPerson() {
                const colors = ['#fef3c7', '#fca5a5', '#a5f3fc', '#c4b5fd', '#fde047', '#fb923c', '#f9a8d4'];
                const color = colors[Math.floor(Math.random() * colors.length)];

                // Start na nějaké silnici v rozumném rozsahu
                const { x, y } = this._randomRoadPoint();

                const el = document.createElementNS(SVG_NS, 'circle');
                el.setAttribute('r', '3');
                el.setAttribute('fill', color);
                el.setAttribute('class', 'person-dot');
                el.setAttribute('cx', x);
                el.setAttribute('cy', y);
                el.setAttribute('stroke', '#1a1a1a');
                el.setAttribute('stroke-width', '0.5');
                this.peopleLayer.appendChild(el);

                const person = {
                    el, x, y,
                    tx: x, ty: y,
                    speed: 22 + Math.random() * 18,   // px/s
                    color,
                    phase: 'idle'
                };
                this._pickNewTarget(person);
                this.people.push(person);
            },

            _randomRoadPoint() {
                // Silnice jsou v gridu na x = gx*CELL + ROAD_W/2 a y = gy*CELL + ROAD_W/2
                // Vyber gridovou linku v rozsahu aktuálně osídlené plochy + malý okraj
                const range = Math.max(3, Math.ceil(Math.sqrt(this.buildings.length + 4)));
                const minG = -range, maxG = range;
                const pickLine = () => Math.floor(Math.random() * (maxG - minG + 1)) + minG;
                const alongRoad = () => (Math.random() * (maxG - minG + 1) + minG) * CELL + ROAD_W / 2;

                if (Math.random() < 0.5) {
                    // horizontální silnice: y fixní (road line), x libovolné podél
                    const gy = pickLine();
                    return { x: alongRoad(), y: gy * CELL + ROAD_W / 2 };
                } else {
                    // vertikální silnice
                    const gx = pickLine();
                    return { x: gx * CELL + ROAD_W / 2, y: alongRoad() };
                }
            },

            _pickNewTarget(p) {
                const target = this._randomRoadPoint();
                // Manhattan path: nejdřív horizontálně, pak vertikálně
                p.path = [];
                // Bod 1: jít na řadu targetu (stejnou silnici Y, pak jít X)
                // Start p je na nějaké silnici. Přejdi po x-ose k targetu X (pokud target je na horizontální silnici = target.y je road line)
                // Jednoduché řešení: intermediate bod (target.x, p.y), pak (target.x, target.y)
                p.path.push({ x: target.x, y: p.y });
                p.path.push({ x: target.x, y: target.y });
                p.pathIdx = 0;
                p.tx = p.path[0].x;
                p.ty = p.path[0].y;
            },

            _tick() {
                const now = performance.now();
                const dt = Math.min(0.1, (now - this.lastTick) / 1000);
                this.lastTick = now;

                // Update každé osoby
                for (const p of this.people) {
                    const dx = p.tx - p.x;
                    const dy = p.ty - p.y;
                    const dist = Math.hypot(dx, dy);
                    const step = p.speed * dt;

                    if (dist <= step) {
                        p.x = p.tx;
                        p.y = p.ty;
                        // další bod v path
                        p.pathIdx++;
                        if (p.path && p.pathIdx < p.path.length) {
                            p.tx = p.path[p.pathIdx].x;
                            p.ty = p.path[p.pathIdx].y;
                        } else {
                            this._pickNewTarget(p);
                        }
                    } else {
                        p.x += (dx / dist) * step;
                        p.y += (dy / dist) * step;
                    }
                    p.el.setAttribute('cx', p.x.toFixed(2));
                    p.el.setAttribute('cy', p.y.toFixed(2));
                }

                this.rafId = requestAnimationFrame(() => this._tick());
            },

            // ========== PAN / ZOOM ==========
            _applyViewBox() {
                const vb = this.viewBox;
                this.svg.setAttribute('viewBox', `${vb.x} ${vb.y} ${vb.w} ${vb.h}`);
            },

            _ensureVisible(cx, cy) {
                const vb = this.viewBox;
                const margin = CELL;
                let changed = false;
                if (cx < vb.x + margin) { vb.w += (vb.x + margin - cx); vb.x = cx - margin; changed = true; }
                if (cy < vb.y + margin) { vb.h += (vb.y + margin - cy); vb.y = cy - margin; changed = true; }
                if (cx > vb.x + vb.w - margin) { vb.w = cx - vb.x + margin; changed = true; }
                if (cy > vb.y + vb.h - margin) { vb.h = cy - vb.y + margin; changed = true; }
                if (changed) this._applyViewBox();
            },

            centerView() {
                // Fitnout viewBox na všechny budovy
                if (this.buildings.length === 0) {
                    this.viewBox = { x: -300, y: -300, w: 600, h: 600 };
                } else {
                    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
                    for (const b of this.buildings) {
                        if (b.cx < minX) minX = b.cx;
                        if (b.cy < minY) minY = b.cy;
                        if (b.cx > maxX) maxX = b.cx;
                        if (b.cy > maxY) maxY = b.cy;
                    }
                    const pad = CELL * 1.5;
                    this.viewBox = {
                        x: minX - pad,
                        y: minY - pad,
                        w: (maxX - minX) + pad * 2,
                        h: (maxY - minY) + pad * 2
                    };
                    // Minimální rozumná velikost
                    if (this.viewBox.w < 400) { this.viewBox.x -= (400 - this.viewBox.w)/2; this.viewBox.w = 400; }
                    if (this.viewBox.h < 400) { this.viewBox.y -= (400 - this.viewBox.h)/2; this.viewBox.h = 400; }
                }
                this._applyViewBox();
            },

            _zoomBy(factor) {
                const vb = this.viewBox;
                const cx = vb.x + vb.w / 2;
                const cy = vb.y + vb.h / 2;
                vb.w /= factor;
                vb.h /= factor;
                vb.x = cx - vb.w / 2;
                vb.y = cy - vb.h / 2;
                this._applyViewBox();
            },

            _bindInteractions() {
                const el = this.svg;

                // Zoom wheel
                el.addEventListener('wheel', (e) => {
                    e.preventDefault();
                    const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
                    this._zoomBy(factor);
                }, { passive: false });

                // Pan (drag)
                el.addEventListener('mousedown', (e) => {
                    this.isDragging = true;
                    this.dragStart = { x: e.clientX, y: e.clientY, vbX: this.viewBox.x, vbY: this.viewBox.y };
                });
                window.addEventListener('mousemove', (e) => {
                    if (!this.isDragging) return;
                    const rect = el.getBoundingClientRect();
                    const scaleX = this.viewBox.w / rect.width;
                    const scaleY = this.viewBox.h / rect.height;
                    const dx = (e.clientX - this.dragStart.x) * scaleX;
                    const dy = (e.clientY - this.dragStart.y) * scaleY;
                    this.viewBox.x = this.dragStart.vbX - dx;
                    this.viewBox.y = this.dragStart.vbY - dy;
                    this._applyViewBox();
                });
                window.addEventListener('mouseup', () => { this.isDragging = false; });
            },

            _updateFooter() {
                const pEl = document.getElementById('map-people-count');
                const bEl = document.getElementById('map-buildings-count');
                if (pEl) pEl.textContent = this.people.length;
                if (bEl) bEl.textContent = this.buildings.length;
            },

            reset() {
                this.buildings = [];
                this.people = [];
                this.occupied.clear();
                this.spiralIndex = 0;
                if (this.buildingLayer) this.buildingLayer.innerHTML = '';
                if (this.peopleLayer) this.peopleLayer.innerHTML = '';
            }
        };

        window.CityMap = CityMap;
    })();
