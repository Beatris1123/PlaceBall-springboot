/**
 * stadium-map.js — PLACEBALL 야구장 다이아몬드 캔버스 렌더러
 *
 * 연결된 백엔드:
 *   Zone.java 모델: { id, owner("kia"|"lg"|"neutral"), occupationRate(1~99) }
 *   GameService.java 초기 Zone 6개:
 *     id 0 — 1루 응원석  (kia,  76%)
 *     id 1 — 중앙 내야   (lg,   72%)
 *     id 2 — 3루 응원석  (lg,   68%)
 *     id 3 — 좌외야      (kia,  61%)
 *     id 4 — 중외야      (lg,   72%)
 *     id 5 — 우외야      (lg,   81%)
 *
 *   실시간: WebSocket /topic/gamestate → PlaceballWS → StadiumMap.update(zones)
 *
 * 원본 참조:
 *   StadiumDiamondMap.tsx (200×200 canvas, neon glow style)
 *   StadiumSeatMap.tsx    (500×500 canvas, sector geometry)
 *
 * 이 파일은 두 컴포넌트를 통합하여 220×220 canvas 에 렌더링합니다.
 */

const StadiumMap = (() => {
  const CANVAS_ID = 'stadium-canvas';
  const W = 220, H = 220;
  const CX = W / 2, CY = H / 2;

  // ── 색상 팔레트 (style.css :root 변수와 동기화) ──
  const COLOR = {
    kia:     '#DC3250',
    kiaGlow: 'rgba(220,50,80,0.75)',
    lg:      '#3278C8',
    lgGlow:  'rgba(50,120,200,0.75)',
    neutral: '#888888',
    ground:  'rgba(34,85,34,0.55)',
    grass:   'rgba(50,120,50,0.35)',
    line:    'rgba(255,255,255,0.55)',
    text:    '#FFFFFF',
  };

  // Zone 위치 정의 (다이아몬드 기준 각도·반경)
  // 원본 StadiumDiamondMap.tsx 의 circle 배치를 각도로 재현
  const ZONE_POSITIONS = [
    { id: 0, label: '1루\n응원석', angle: 45,   r: 72 },   // 1루 방향 (우하)
    { id: 1, label: '중앙\n내야',  angle: 270,  r: 42 },   // 내야 중앙 (상단)
    { id: 2, label: '3루\n응원석', angle: 135,  r: 72 },   // 3루 방향 (좌하)
    { id: 3, label: '좌외야',      angle: 160,  r: 92 },   // 좌외야
    { id: 4, label: '중외야',      angle: 270,  r: 95 },   // 중외야
    { id: 5, label: '우외야',      angle: 20,   r: 92 },   // 우외야
  ];

  let canvas = null;
  let ctx    = null;
  let currentZones = [];

  /** 캔버스 초기화 */
  function init(zones) {
    canvas = document.getElementById(CANVAS_ID);
    if (!canvas) { console.warn('[StadiumMap] canvas 없음'); return; }
    canvas.width  = W;
    canvas.height = H;
    ctx = canvas.getContext('2d');
    currentZones = zones || [];
    _draw();
  }

  /** 외부에서 zones 업데이트 후 재드로우 */
  function update(zones) {
    currentZones = zones || [];
    if (ctx) _draw();
  }

  // ── 내부 드로우 ──────────────────────────────────────────────

  function _draw() {
    ctx.clearRect(0, 0, W, H);
    _drawBackground();
    _drawFoulLines();
    _drawOutfieldArc();
    _drawInfieldArc();
    _drawDiamond();
    _drawZones();
    _drawGroundLabel();
  }

  /** 그라운드 배경 그라디언트 */
  function _drawBackground() {
    const grad = ctx.createRadialGradient(CX, CY, 10, CX, CY, 100);
    grad.addColorStop(0,   'rgba(34,85,34,0.70)');
    grad.addColorStop(0.6, 'rgba(20,60,20,0.55)');
    grad.addColorStop(1,   'rgba(10,30,10,0.30)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(CX, CY, 100, 0, Math.PI * 2);
    ctx.fill();
  }

  /** 파울라인 (홈→1루, 홈→3루) */
  function _drawFoulLines() {
    ctx.save();
    ctx.strokeStyle = COLOR.line;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.6;

    // 홈 → 1루 방향 (우하 45°)
    ctx.beginPath();
    ctx.moveTo(CX, CY);
    ctx.lineTo(CX + 100 * Math.cos(_deg(45)), CY + 100 * Math.sin(_deg(45)));
    ctx.stroke();

    // 홈 → 3루 방향 (좌하 135°)
    ctx.beginPath();
    ctx.moveTo(CX, CY);
    ctx.lineTo(CX + 100 * Math.cos(_deg(135)), CY + 100 * Math.sin(_deg(135)));
    ctx.stroke();

    ctx.restore();
  }

  /** 외야 원호 */
  function _drawOutfieldArc() {
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(CX, CY, 100, _deg(45), _deg(135));
    ctx.stroke();
    ctx.restore();
  }

  /** 내야 원호 */
  function _drawInfieldArc() {
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(CX, CY, 60, _deg(0), _deg(180));
    ctx.stroke();
    ctx.restore();
  }

  /** 다이아몬드 (홈+1·2·3루 베이스) */
  function _drawDiamond() {
    const baseSize = 5;
    const dist = 38; // 베이스 간격(픽셀)

    // 베이스 좌표: 홈(하), 1루(우), 2루(상), 3루(좌)
    const bases = [
      { x: CX,        y: CY + dist, label: 'H' },  // 홈
      { x: CX + dist, y: CY,        label: '1' },  // 1루
      { x: CX,        y: CY - dist, label: '2' },  // 2루
      { x: CX - dist, y: CY,        label: '3' },  // 3루
    ];

    // 다이아몬드 선
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.60)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(bases[0].x, bases[0].y);
    bases.forEach(b => ctx.lineTo(b.x, b.y));
    ctx.closePath();
    ctx.stroke();

    // 베이스 사각형
    ctx.fillStyle = '#FFFFFF';
    bases.forEach(b => {
      ctx.fillRect(b.x - baseSize / 2, b.y - baseSize / 2, baseSize, baseSize);
    });
    ctx.restore();
  }

  /** Zone 6개 렌더링 */
  function _drawZones() {
    ZONE_POSITIONS.forEach(pos => {
      const zone = currentZones.find(z => z.id === pos.id);
      if (!zone) return;

      const rad   = _deg(pos.angle);
      const zx    = CX + pos.r * Math.cos(rad);
      const zy    = CY + pos.r * Math.sin(rad);
      const color = _zoneColor(zone.owner);
      const alpha = 0.35 + (zone.occupationRate / 99) * 0.55; // 점령률 → 투명도

      // 글로우 원
      ctx.save();
      ctx.globalAlpha = alpha;
      const glow = ctx.createRadialGradient(zx, zy, 2, zx, zy, 18);
      glow.addColorStop(0,   color);
      glow.addColorStop(0.6, color.replace(')', ',0.6)').replace('rgb', 'rgba'));
      glow.addColorStop(1,   'transparent');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(zx, zy, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 테두리 원
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.arc(zx, zy, 15, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // 점령률 텍스트
      ctx.save();
      ctx.fillStyle = COLOR.text;
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${zone.occupationRate}%`, zx, zy - 1);

      // 팀 라벨
      ctx.font = '6px sans-serif';
      ctx.globalAlpha = 0.75;
      ctx.fillText(zone.owner.toUpperCase(), zx, zy + 8);
      ctx.restore();
    });
  }

  /** 중앙 GROUND 라벨 */
  function _drawGroundLabel() {
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,0.22)';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('GROUND', CX, CY - 12);
    ctx.restore();
  }

  // ── 유틸 ──
  function _deg(d) { return (d * Math.PI) / 180; }

  function _zoneColor(owner) {
    if (owner === 'kia') return COLOR.kia;
    if (owner === 'lg')  return COLOR.lg;
    return COLOR.neutral;
  }

  return { init, update };
})();
