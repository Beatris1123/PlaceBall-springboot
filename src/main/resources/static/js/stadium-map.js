/**
 * stadium-map.js
 * 원본: client/src/components/StadiumDiamondMap.tsx (React + Canvas)
 * 변환: Vanilla JS + Canvas API (동일 로직 100% 유지)
 */

/**
 * drawStadiumDiamondMap(zones)
 * 원본 useEffect(() => { ... }, [zones]) 의 Canvas 드로잉 로직을 그대로 이식
 *
 * @param {Array} zones - Zone 배열 [{id, owner, occupationRate}, ...]
 */
function drawStadiumDiamondMap(zones) {
  const canvas = document.getElementById('stadium-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const W = 200;
  const H = 200;

  // 캔버스 초기화 (완전 투명) — 원본: ctx.clearRect(0, 0, W, H)
  ctx.clearRect(0, 0, W, H);

  const cx = W / 2;
  const cy = H / 2;

  // ── 색상 헬퍼 (원본 getGlowColor) ──
  function getGlowColor(zone) {
    if (!zone) return 'rgba(255,255,255,0.3)';
    if (zone.owner === 'kia') return 'rgba(220,50,80,0.8)';
    if (zone.owner === 'lg')  return 'rgba(50,120,200,0.8)';
    return 'rgba(255,255,255,0.5)';
  }

  // ── 야구장 다이아몬드 기본 구조 ──
  const homeR    = 30;
  const baseR    = 120;
  const outfieldR = 200;

  // 네온 선 스타일
  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.lineWidth   = 1;
  ctx.lineCap     = 'round';
  ctx.lineJoin    = 'round';

  // 홈플레이트
  ctx.beginPath();
  ctx.arc(cx, cy + baseR * 0.8, homeR, 0, Math.PI * 2);
  ctx.stroke();

  // 1루, 2루, 3루
  [[cx + baseR, cy], [cx, cy - baseR], [cx - baseR, cy]].forEach(([bx, by]) => {
    ctx.beginPath();
    ctx.arc(bx, by, 8, 0, Math.PI * 2);
    ctx.stroke();
  });

  // 파울라인 (1루선)
  ctx.beginPath();
  ctx.moveTo(cx, cy + baseR * 0.8);
  ctx.lineTo(cx + outfieldR * 0.85, cy - outfieldR * 0.5);
  ctx.stroke();

  // 파울라인 (3루선)
  ctx.beginPath();
  ctx.moveTo(cx, cy + baseR * 0.8);
  ctx.lineTo(cx - outfieldR * 0.85, cy - outfieldR * 0.5);
  ctx.stroke();

  // 외야 호
  ctx.beginPath();
  ctx.arc(cx, cy, outfieldR, Math.PI * 0.25, Math.PI * 1.75);
  ctx.stroke();

  // 내야 호
  ctx.beginPath();
  ctx.arc(cx, cy, baseR * 1.2, Math.PI * 0.25, Math.PI * 1.75);
  ctx.stroke();

  // ── 구역 데이터 포인트 (원본 zonePositions) ──
  const zonePositions = [
    { id: 0, x: cx + baseR * 0.85,      y: cy - baseR * 0.3,      label: '1루' },
    { id: 1, x: cx,                      y: cy - baseR * 1.1,      label: '중앙' },
    { id: 2, x: cx - baseR * 0.85,      y: cy - baseR * 0.3,      label: '3루' },
    { id: 3, x: cx - outfieldR * 0.75,  y: cy - outfieldR * 0.5,  label: '좌외' },
    { id: 4, x: cx,                      y: cy - outfieldR * 0.95, label: '중외' },
    { id: 5, x: cx + outfieldR * 0.75,  y: cy - outfieldR * 0.5,  label: '우외' },
  ];

  // 각 구역의 점령률 표시 (원본 zonePositions.forEach)
  zonePositions.forEach(pos => {
    const zone = zones.find(z => z.id === pos.id);
    if (!zone) return;

    const glowColor = getGlowColor(zone);

    // Glow 효과 (큰 반투명 원)
    ctx.fillStyle = glowColor;
    ctx.globalAlpha = 0.08;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 42, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // 구역 테두리 (얇은 네온 선)
    ctx.strokeStyle = glowColor;
    ctx.lineWidth   = 0.8;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 24, 0, Math.PI * 2);
    ctx.stroke();

    // 점령률 % 배경 (짧고 불투명한 원)
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.arc(pos.x, pos.y - 2, 14, 0, Math.PI * 2);
    ctx.fill();

    // 점령률 % (큰 숫자)
    ctx.fillStyle      = '#FFFFFF';
    ctx.font           = "bold 16px 'Courier New', monospace";
    ctx.textAlign      = 'center';
    ctx.textBaseline   = 'middle';
    ctx.fillText(`${zone.occupationRate}%`, pos.x, pos.y - 2);

    // 팀명 (작은 텍스트)
    ctx.fillStyle = glowColor;
    ctx.font      = "bold 8px 'Pretendard', sans-serif";
    ctx.fillText(
      zone.owner === 'kia' ? 'KIA' : zone.owner === 'lg' ? 'LG' : '중립',
      pos.x,
      pos.y + 11
    );
  });

  // 중앙 그라운드 텍스트
  ctx.fillStyle    = 'rgba(255,255,255,0.15)';
  ctx.font         = "bold 10px 'Pretendard', sans-serif";
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('GROUND', cx, cy + 8);
}
