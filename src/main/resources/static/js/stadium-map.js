/**
 * stadium-map.js — PLACEBALL 야구장 Canvas 렌더링
 *
 * 연결된 백엔드 모델:
 *   Zone.java: { int id, String owner("kia"|"lg"|"neutral"), int occupationRate(1~99) }
 *
 *   Zone 배치 (GameService.java 초기값):
 *     id 0 — 1루 응원석  (owner:"kia", 초기:76%)
 *     id 1 — 중앙 내야   (owner:"lg",  초기:72%)
 *     id 2 — 3루 응원석  (owner:"lg",  초기:68%)
 *     id 3 — 좌외야      (owner:"kia", 초기:61%)
 *     id 4 — 중외야      (owner:"lg",  초기:72%)
 *     id 5 — 우외야      (owner:"lg",  초기:81%)
 *
 * 원본 TypeScript:
 *   StadiumDiamondMap.tsx — useRef canvas, 네온 다이아몬드, Zone 글로우 원
 *   StadiumSeatMap.tsx    — 섹터별 부채꼴, 그라데이션 배경
 *
 * 사용법:
 *   StadiumMap.draw(zones)   — 최초 또는 전체 재드로우
 *   StadiumMap.update(zones) — 실시간 WebSocket 갱신 시 호출
 */

const StadiumMap = (() => {
  const CANVAS_ID = 'stadium-canvas';
  const W = 220, H = 220;
  const CX = W / 2, CY = H / 2;

  // ── 팀 색상 ──
  const COLOR = {
    kia:     '#DC3250',
    kiaGlow: 'rgba(220,50,80,0.75)',
    lg:      '#3278C8',
    lgGlow:  'rgba(50,120,200,0.75)',
    neutral: '#888888',
    white:   '#FFFFFF',
    field:   'rgba(30,60,30,0.85)',
    dirt:    'rgba(120,80,40,0.6)',
    line:    'rgba(255,255,255,0.55)',
    neon:    'rgba(255,255,255,0.12)',
  };

  // ── Zone 라벨 (한국어) ──
  const ZONE_LABELS = {
    0: '1루석',
    1: '중앙내야',
    2: '3루석',
    3: '좌외야',
    4: '중외야',
    5: '우외야',
  };

  /** Zone owner → 주색 */
  function ownerColor(owner) {
    if (owner === 'kia') return COLOR.kia;
    if (owner === 'lg')  return COLOR.lg;
    return COLOR.neutral;
  }

  /** Zone owner → 글로우 색 */
  function ownerGlow(owner) {
    if (owner === 'kia') return COLOR.kiaGlow;
    if (owner === 'lg')  return COLOR.lgGlow;
    return 'rgba(136,136,136,0.5)';
  }

  /** 점령률(1~99) → 0.2~0.95 알파값 */
  function rateToAlpha(rate) {
    return 0.20 + (rate / 99) * 0.75;
  }

  /**
   * 메인 드로우 함수
   * @param {Array<{id:number, owner:string, occupationRate:number}>} zones
   */
  function draw(zones) {
    const canvas = document.getElementById(CANVAS_ID);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    canvas.width  = W;
    canvas.height = H;

    ctx.clearRect(0, 0, W, H);

    _drawBackground(ctx);
    _drawOutfield(ctx, zones);
    _drawInfield(ctx, zones);
    _drawDiamond(ctx);
    _drawZoneLabels(ctx, zones);
    _drawCenterLabel(ctx);
  }

  /** update = draw alias (실시간 갱신용 명시적 이름) */
  function update(zones) {
    draw(zones);
  }

  // ─────────────────────────────────────────────────
  // Private drawing helpers
  // ─────────────────────────────────────────────────

  /** 배경 그라데이션 — 어두운 원형 필드 */
  function _drawBackground(ctx) {
    const grad = ctx.createRadialGradient(CX, CY, 20, CX, CY, CX);
    grad.addColorStop(0,   'rgba(20,40,20,0.95)');
    grad.addColorStop(0.5, 'rgba(15,35,15,0.9)');
    grad.addColorStop(1,   'rgba(10,20,10,0.8)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(CX, CY, CX - 4, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * 외야 섹터 3개 (Zone id 3,4,5 → 좌/중/우 외야)
   * 원본 StadiumSeatMap.tsx outfield sectors
   */
  function _drawOutfield(ctx, zones) {
    // 외야: 반경 50~95, 각 섹터 120° 폭
    const outerR = 95;
    const innerR = 50;

    // [zoneId, 시작각(rad), 끝각(rad), 라벨 각도]
    const sectors = [
      { zoneId: 3, startAngle: Math.PI + 0.25,      endAngle: Math.PI * 1.5,         labelAngle: Math.PI * 1.25  }, // 좌외야
      { zoneId: 4, startAngle: Math.PI * 1.5,        endAngle: Math.PI * 2 - 0.25,    labelAngle: Math.PI * 1.75  }, // 중외야
      { zoneId: 5, startAngle: Math.PI * 2 - 0.25,   endAngle: Math.PI * 2 + 0.52,   labelAngle: Math.PI * 2.09  }, // 우외야
    ];

    sectors.forEach(({ zoneId, startAngle, endAngle }) => {
      const zone = zones.find(z => z.id === zoneId);
      if (!zone) return;

      const alpha = rateToAlpha(zone.occupationRate);
      const color = ownerColor(zone.owner);

      // 섹터 채우기
      ctx.beginPath();
      ctx.moveTo(CX + innerR * Math.cos(startAngle), CY + innerR * Math.sin(startAngle));
      ctx.arc(CX, CY, outerR, startAngle, endAngle);
      ctx.arc(CX, CY, innerR, endAngle, startAngle, true);
      ctx.closePath();

      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.fill();
      ctx.globalAlpha = 1;

      // 섹터 외곽선
      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.lineWidth = 1;
      ctx.stroke();
    });
  }

  /**
   * 내야 섹터 3개 (Zone id 0,1,2 → 1루석/중앙내야/3루석)
   * 원본 StadiumSeatMap.tsx infield sectors
   */
  function _drawInfield(ctx, zones) {
    const outerR = 48;
    const innerR = 18;

    const sectors = [
      { zoneId: 0, startAngle: -0.2,          endAngle: Math.PI * 0.5 + 0.2 }, // 1루석 (오른쪽)
      { zoneId: 1, startAngle: Math.PI * 0.5 + 0.2, endAngle: Math.PI + 0.2  }, // 중앙내야 (하단)
      { zoneId: 2, startAngle: Math.PI + 0.2,  endAngle: Math.PI * 2 - 0.2   }, // 3루석 (왼쪽)
    ];

    sectors.forEach(({ zoneId, startAngle, endAngle }) => {
      const zone = zones.find(z => z.id === zoneId);
      if (!zone) return;

      const alpha = rateToAlpha(zone.occupationRate);
      const color = ownerColor(zone.owner);

      ctx.beginPath();
      ctx.moveTo(CX + innerR * Math.cos(startAngle), CY + innerR * Math.sin(startAngle));
      ctx.arc(CX, CY, outerR, startAngle, endAngle);
      ctx.arc(CX, CY, innerR, endAngle, startAngle, true);
      ctx.closePath();

      ctx.globalAlpha = alpha * 0.85;
      ctx.fillStyle = color;
      ctx.fill();
      ctx.globalAlpha = 1;

      ctx.strokeStyle = 'rgba(255,255,255,0.18)';
      ctx.lineWidth = 0.8;
      ctx.stroke();
    });
  }

  /**
   * 야구장 다이아몬드 (베이스 라인 + 홈플레이트 + 베이스)
   * 원본 StadiumDiamondMap.tsx — 네온 글로우 스타일
   */
  function _drawDiamond(ctx) {
    const size = 14; // 다이아몬드 반변 길이

    // 베이스 좌표 (다이아몬드: 홈 아래, 1루 오른쪽, 2루 위, 3루 왼쪽)
    const home  = { x: CX,          y: CY + size * 1.4  };
    const first = { x: CX + size,   y: CY               };
    const sec   = { x: CX,          y: CY - size * 1.4  };
    const third = { x: CX - size,   y: CY               };

    // 파울 라인
    ctx.save();
    ctx.setLineDash([3, 4]);
    ctx.strokeStyle = 'rgba(255,255,255,0.22)';
    ctx.lineWidth = 1;
    // 1루 파울라인
    ctx.beginPath();
    ctx.moveTo(home.x, home.y);
    ctx.lineTo(CX + 90, CY - 40);
    ctx.stroke();
    // 3루 파울라인
    ctx.beginPath();
    ctx.moveTo(home.x, home.y);
    ctx.lineTo(CX - 90, CY - 40);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // 다이아몬드 라인 (네온 화이트)
    ctx.save();
    ctx.shadowColor = 'rgba(255,255,255,0.6)';
    ctx.shadowBlur  = 5;
    ctx.strokeStyle = 'rgba(255,255,255,0.75)';
    ctx.lineWidth   = 1.5;
    ctx.beginPath();
    ctx.moveTo(home.x, home.y);
    ctx.lineTo(first.x, first.y);
    ctx.lineTo(sec.x, sec.y);
    ctx.lineTo(third.x, third.y);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();

    // 내야 아크
    ctx.beginPath();
    ctx.arc(CX, CY, size * 1.6, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 베이스 사각형
    [first, sec, third].forEach(b => {
      ctx.save();
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.shadowColor = 'rgba(255,255,255,0.9)';
      ctx.shadowBlur  = 4;
      ctx.fillRect(b.x - 3, b.y - 3, 6, 6);
      ctx.restore();
    });

    // 홈플레이트 (오각형)
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.shadowColor = 'rgba(255,255,255,0.9)';
    ctx.shadowBlur  = 6;
    ctx.beginPath();
    ctx.moveTo(home.x,     home.y - 4);
    ctx.lineTo(home.x + 4, home.y    );
    ctx.lineTo(home.x + 3, home.y + 4);
    ctx.lineTo(home.x - 3, home.y + 4);
    ctx.lineTo(home.x - 4, home.y    );
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  /**
   * Zone 점령률(%) 텍스트 + 팀 라벨 오버레이
   * 원본 StadiumDiamondMap.tsx — zone 원 위 텍스트
   */
  function _drawZoneLabels(ctx, zones) {
    // 각 Zone의 라벨 표시 위치 (캔버스 좌표)
    const positions = {
      0: { x: CX + 66, y: CY + 8   }, // 1루석 오른쪽
      1: { x: CX,      y: CY + 68  }, // 중앙내야 아래
      2: { x: CX - 66, y: CY + 8   }, // 3루석 왼쪽
      3: { x: CX - 74, y: CY - 48  }, // 좌외야
      4: { x: CX,      y: CY - 78  }, // 중외야 위
      5: { x: CX + 74, y: CY - 48  }, // 우외야
    };

    zones.forEach(zone => {
      const pos = positions[zone.id];
      if (!pos) return;

      const color = ownerColor(zone.owner);

      // 글로우 원
      ctx.save();
      ctx.shadowColor = ownerGlow(zone.owner);
      ctx.shadowBlur  = 10;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 14, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,0,0,0.55)`;
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      // 점령률 %
      ctx.save();
      ctx.font = 'bold 9px Courier New, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = color;
      ctx.fillText(`${zone.occupationRate}%`, pos.x, pos.y);
      ctx.restore();
    });
  }

  /** 중앙 "GROUND" 텍스트 */
  function _drawCenterLabel(ctx) {
    ctx.save();
    ctx.font = 'bold 7px Courier New, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(255,255,255,0.30)';
    ctx.fillText('GROUND', CX, CY - 2);
    ctx.restore();
  }

  return { draw, update };
})();
