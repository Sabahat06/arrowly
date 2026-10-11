/* Arrowly – playable mini level for the website.
   Same rule as the game: an arrow escapes in the direction it points,
   but only if no other arrow sits anywhere on that path. */
(function () {
  const board = document.getElementById('board');
  if (!board) return;

  const NS = 'http://www.w3.org/2000/svg';
  const N = 6;            // 6 × 6 grid
  const CELL = 90;        // viewBox units
  const PAD = 30;
  const SIZE = PAD * 2 + CELL * N; // 600
  const AHEAD = 9;        // cells the track extends past the head

  // Cells are [col, row], head first. Direction = head − second cell.
  const LEVEL = [
    [[0, 0], [1, 0], [2, 0]],
    [[3, 0], [3, 1], [3, 2]],
    [[5, 2], [4, 2], [4, 3]],
    [[1, 1], [1, 2], [2, 2]],
    [[2, 4], [2, 3], [1, 3], [0, 3]],
    [[3, 5], [2, 5], [1, 5]],
    [[5, 4], [5, 5]],
    [[0, 5], [0, 4]],
    [[4, 4], [3, 4], [3, 3]],
  ];
  const DIR_NAME = { '1,0': 'right', '-1,0': 'left', '0,1': 'down', '0,-1': 'up' };

  const els = {
    hearts: document.getElementById('hearts'),
    left: document.getElementById('left'),
    status: document.getElementById('status'),
    win: document.getElementById('win'),
    winTitle: document.getElementById('win-title'),
    winText: document.getElementById('win-text'),
    winStars: document.getElementById('win-stars'),
    card: document.getElementById('board-card'),
  };
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const center = ([c, r]) => [PAD + (c + 0.5) * CELL, PAD + (r + 0.5) * CELL];
  const el = (tag, attrs) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  };

  // ---------- geometry ----------
  function subPolyline(pts, from, to) {
    const out = [];
    let acc = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1];
      const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
      const s0 = acc, s1 = acc + l;
      acc = s1;
      if (s1 <= from || s0 >= to || l === 0) continue;
      const ta = Math.max(0, Math.min(1, (from - s0) / l));
      const tb = Math.max(0, Math.min(1, (to - s0) / l));
      const pa = [a[0] + (b[0] - a[0]) * ta, a[1] + (b[1] - a[1]) * ta];
      const pb = [a[0] + (b[0] - a[0]) * tb, a[1] + (b[1] - a[1]) * tb];
      const last = out[out.length - 1];
      if (!last || Math.hypot(last[0] - pa[0], last[1] - pa[1]) > 0.01) out.push(pa);
      if (Math.hypot(pb[0] - pa[0], pb[1] - pa[1]) > 0.01) out.push(pb);
    }
    return out;
  }

  function caret(pts) {
    const dx0 = pts[0][0] - pts[1][0], dy0 = pts[0][1] - pts[1][1];
    const l = Math.hypot(dx0, dy0) || 1;
    const dx = dx0 / l, dy = dy0 / l;
    const tip = [pts[0][0] + dx * CELL * 0.46, pts[0][1] + dy * CELL * 0.46];
    const base = [tip[0] - dx * CELL * 0.44, tip[1] - dy * CELL * 0.44];
    const px = -dy * CELL * 0.34, py = dx * CELL * 0.34;
    return `${base[0] + px},${base[1] + py} ${tip[0]},${tip[1]} ${base[0] - px},${base[1] - py}`;
  }

  // ---------- state ----------
  let arrows = [];
  let hearts = 3;
  let busy = false; // short lock while a heart is being lost

  function build() {
    board.innerHTML = '';
    const svg = el('svg', { viewBox: `0 0 ${SIZE} ${SIZE}`, 'aria-hidden': 'false' });
    const dots = el('g', { fill: 'var(--dot)' });
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
      const [x, y] = center([c, r]);
      dots.appendChild(el('circle', { cx: x, cy: y, r: CELL * 0.07 }));
    }
    svg.appendChild(dots);

    arrows = LEVEL.map((cells, i) => {
      const dir = [cells[0][0] - cells[1][0], cells[0][1] - cells[1][1]];
      const head = center(cells[0]);
      const track = [[head[0] + dir[0] * CELL * AHEAD, head[1] + dir[1] * CELL * AHEAD], ...cells.map(center)];
      const g = el('g', {
        class: 'arrow', tabindex: '0', role: 'button',
        'aria-label': `Arrow ${i + 1}, pointing ${DIR_NAME[dir.join(',')]}`,
      });
      const hit = el('path', { class: 'hit' });
      const body = el('path', { class: 'body' });
      const headEl = el('polygon', { class: 'head' });
      g.append(hit, body, headEl);
      svg.appendChild(g);
      const a = { i, cells, dir, track, len: (cells.length - 1) * CELL, g, hit, body, headEl, gone: false, shift: 0 };
      draw(a);
      g.addEventListener('click', () => tap(a));
      g.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tap(a); }
      });
      return a;
    });
    board.appendChild(svg);
  }

  function draw(a) {
    const base = CELL * AHEAD;
    const pts = subPolyline(a.track, base - a.shift, base - a.shift + a.len);
    if (pts.length < 2) return;
    const d = 'M' + pts.map((p) => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L');
    a.body.setAttribute('d', d);
    a.hit.setAttribute('d', d);
    a.headEl.setAttribute('points', caret(pts));
  }

  function blockerOf(a) {
    let [c, r] = a.cells[0];
    for (;;) {
      c += a.dir[0]; r += a.dir[1];
      if (c < 0 || r < 0 || c >= N || r >= N) return null;
      for (const b of arrows) {
        if (b !== a && !b.gone && b.cells.some(([x, y]) => x === c && y === r)) return b;
      }
    }
  }

  function animate(dur, step, done) {
    if (reduceMotion) { step(1); done && done(); return; }
    const t0 = performance.now();
    const frame = (now) => {
      const t = Math.min(1, (now - t0) / dur);
      step(t);
      if (t < 1) requestAnimationFrame(frame); else if (done) done();
    };
    requestAnimationFrame(frame);
  }

  function setStatus(t) { els.status.textContent = t; }
  function renderHearts() {
    [...els.hearts.children].forEach((h, i) => h.classList.toggle('lost', i >= hearts));
    els.hearts.setAttribute('aria-label', `${hearts} heart${hearts === 1 ? '' : 's'} left`);
  }
  const remaining = () => arrows.filter((a) => !a.gone).length;

  function tap(a) {
    if (a.gone || busy || els.win.classList.contains('is-on')) return;
    clearHint();
    const blocker = blockerOf(a);
    if (blocker) return bump(a);

    // Escape
    a.gone = true;
    a.g.style.pointerEvents = 'none';
    a.g.setAttribute('tabindex', '-1');
    els.left.textContent = remaining();
    const left = remaining();
    setStatus(left ? (left === 1 ? 'One to go!' : 'Nice! Keep going.') : 'Board cleared!');
    const dist = CELL * (AHEAD - 0.5);
    animate(420, (t) => { a.shift = dist * t * t * t; draw(a); }, () => {
      a.g.style.display = 'none';
      if (!remaining()) finish(true);
    });
  }

  function bump(a) {
    a.g.classList.add('is-blocked');
    hearts = Math.max(0, hearts - 1);
    renderHearts();
    els.card.classList.remove('is-shake');
    void els.card.offsetWidth;
    els.card.classList.add('is-shake');
    animate(300, (t) => { a.shift = CELL * 0.3 * Math.sin(Math.PI * t); draw(a); }, () => {
      a.shift = 0; draw(a);
      setTimeout(() => a.g.classList.remove('is-blocked'), 200);
    });
    if (hearts === 0) {
      busy = true;
      setStatus('Out of hearts!');
      setTimeout(() => finish(false), 650);
    } else {
      setStatus('Blocked! Something is in the way.');
    }
  }

  let hintTimer = 0;
  function clearHint() {
    clearTimeout(hintTimer);
    arrows.forEach((a) => a.g.classList.remove('is-hint'));
  }
  function hint() {
    if (els.win.classList.contains('is-on')) return;
    clearHint();
    const free = arrows.find((a) => !a.gone && !blockerOf(a));
    if (!free) return;
    free.g.classList.add('is-hint');
    setStatus('Try the glowing arrow.');
    hintTimer = setTimeout(clearHint, 1800);
  }

  function finish(won) {
    const star = '<svg aria-hidden="true"><use href="#i-star"/></svg>';
    if (won) {
      els.winTitle.textContent = 'Board cleared!';
      els.winText.textContent = hearts === 3 ? 'Perfect – not a single mistake.' : 'Nice thinking. There are 500+ more in the app.';
      els.winStars.innerHTML = Array.from({ length: 3 }, (_, i) =>
        i < hearts ? star : star.replace('<svg', '<svg style="opacity:.2"')).join('');
    } else {
      els.winTitle.textContent = 'So close!';
      els.winText.textContent = 'Look for arrows with a clear path to the edge.';
      els.winStars.innerHTML = '';
    }
    els.win.classList.add('is-on');
    const again = document.getElementById('again-btn');
    if (again) again.focus({ preventScroll: true });
  }

  function reset() {
    clearHint();
    hearts = 3;
    busy = false;
    els.win.classList.remove('is-on');
    renderHearts();
    build();
    els.left.textContent = remaining();
    setStatus('Find an arrow with a clear path.');
  }

  document.getElementById('reset-btn').addEventListener('click', reset);
  document.getElementById('again-btn').addEventListener('click', reset);
  document.getElementById('hint-btn').addEventListener('click', hint);
  reset();
})();
