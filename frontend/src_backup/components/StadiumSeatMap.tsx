/**
 * StadiumSeatMap - 야구장 관람석 구역 배치도 컴포넌트
 * 디자인: 위에서 내려다본 야구장 관람석 구역을 부채꼴 형태로 표현
 * 구역: 1루 응원석, 3루 응원석, 중앙 내야석, 좌외야, 중외야, 우외야
 */
import { useEffect, useRef } from "react";

interface Zone {
  id: number;
  owner: "kia" | "lg" | "neutral";
  occupationRate: number;
  label?: string;
}

interface StadiumSeatMapProps {
  zones: Zone[];
}

// 구역 레이블 정보
const ZONE_LABELS = [
  { id: 0, label: "1루 응원석" },
  { id: 1, label: "중앙 내야" },
  { id: 2, label: "3루 응원석" },
  { id: 3, label: "좌외야석" },
  { id: 4, label: "중외야석" },
  { id: 5, label: "우외야석" },
];

export default function StadiumSeatMap({ zones }: StadiumSeatMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const W = 500;
  const H = 500;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 캔버스 초기화
    ctx.clearRect(0, 0, W, H);

    // 배경 - 투명
    ctx.fillStyle = "rgba(0,0,0,0)";
    ctx.fillRect(0, 0, W, H);

    const cx = W / 2; // 중심 x (홈플레이트 위치)
    const cy = H - 30; // 중심 y (하단 - 홈플레이트)

    // ── 색상 헬퍼 ──
    const getZoneColor = (zone: Zone | undefined, alpha: number) => {
      if (!zone) return `rgba(255,255,255,${alpha * 0.3})`;
      if (zone.owner === "kia") return `rgba(220,50,80,${alpha})`;
      if (zone.owner === "lg") return `rgba(50,120,200,${alpha})`;
      return `rgba(255,255,255,${alpha * 0.3})`;
    };

    const getTextColor = (zone: Zone | undefined) => {
      if (!zone) return "rgba(255,255,255,0.5)";
      if (zone.owner === "kia") return "rgba(255,180,190,1)";
      if (zone.owner === "lg") return "rgba(150,200,255,1)";
      return "rgba(255,255,255,0.7)";
    };

    // ── 관람석 구역 정의 (부채꼴 형태) ──
    // 각도: 0 = 오른쪽, PI = 왼쪽, -PI/2 = 위
    // 야구장은 홈플레이트 기준으로 위쪽(외야)이 펼쳐짐

    // 내야 반지름
    const innerR = 80;
    const midR = 180;
    const outerR = 280;

    // 구역 배치 (홈플레이트 = 하단 중앙, 외야 = 상단)
    // 각도 기준: 정면(위쪽) = -PI/2, 오른쪽 = 0, 왼쪽 = -PI

    // 내야석 구역들 (3개: 3루측, 중앙, 1루측)
    const infield = [
      {
        id: 2,
        startAngle: Math.PI,
        endAngle: Math.PI * 1.33,
        r1: innerR,
        r2: midR,
        labelAngle: Math.PI * 1.165,
        labelR: (innerR + midR) / 2,
      }, // 3루 응원석 (좌측)
      {
        id: 1,
        startAngle: Math.PI * 1.33,
        endAngle: Math.PI * 1.67,
        r1: innerR,
        r2: midR,
        labelAngle: Math.PI * 1.5,
        labelR: (innerR + midR) / 2,
      }, // 중앙 내야 (상단)
      {
        id: 0,
        startAngle: Math.PI * 1.67,
        endAngle: Math.PI * 2,
        r1: innerR,
        r2: midR,
        labelAngle: Math.PI * 1.835,
        labelR: (innerR + midR) / 2,
      }, // 1루 응원석 (우측)
    ];

    // 외야석 구역들 (3개: 좌외야, 중외야, 우외야)
    const outfield = [
      {
        id: 3,
        startAngle: Math.PI,
        endAngle: Math.PI * 1.27,
        r1: midR + 10,
        r2: outerR,
        labelAngle: Math.PI * 1.135,
        labelR: (midR + outerR) / 2,
      }, // 좌외야 (좌측)
      {
        id: 4,
        startAngle: Math.PI * 1.27,
        endAngle: Math.PI * 1.73,
        r1: midR + 10,
        r2: outerR,
        labelAngle: Math.PI * 1.5,
        labelR: (midR + outerR) / 2,
      }, // 중외야 (상단)
      {
        id: 5,
        startAngle: Math.PI * 1.73,
        endAngle: Math.PI * 2,
        r1: midR + 10,
        r2: outerR,
        labelAngle: Math.PI * 1.865,
        labelR: (midR + outerR) / 2,
      }, // 우외야 (우측)
    ];

    // 그라데이션 배경 (그라운드)
    const groundGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, innerR);
    groundGrad.addColorStop(0, "rgba(34, 80, 34, 0.6)");
    groundGrad.addColorStop(1, "rgba(34, 80, 34, 0.2)");
    ctx.beginPath();
    ctx.arc(cx, cy, innerR, Math.PI, Math.PI * 2);
    ctx.fillStyle = groundGrad;
    ctx.fill();

    // 홈플레이트 마크
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.beginPath();
    ctx.arc(cx, cy - 15, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.font = "bold 9px 'Pretendard', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("홈", cx, cy - 10);

    // 파울라인 (내야 경계선)
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    // 좌측 파울라인
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx - outerR * Math.cos(Math.PI * 0.27), cy - outerR * Math.sin(Math.PI * 0.27));
    ctx.stroke();
    // 우측 파울라인
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + outerR * Math.cos(Math.PI * 0.27), cy - outerR * Math.sin(Math.PI * 0.27));
    ctx.stroke();
    ctx.setLineDash([]);

    // ── 내야 구역 그리기 ──
    [...infield, ...outfield].forEach((seg) => {
      const zone = zones.find((z) => z.id === seg.id);

      // 구역 채우기
      ctx.beginPath();
      ctx.arc(cx, cy, seg.r2, seg.startAngle, seg.endAngle);
      ctx.arc(cx, cy, seg.r1, seg.endAngle, seg.startAngle, true);
      ctx.closePath();

      // 점령률에 따른 그라데이션
      const fillAlpha = 0.3 + (zone?.occupationRate ?? 50) / 100 * 0.45;
      ctx.fillStyle = getZoneColor(zone, fillAlpha);
      ctx.fill();

      // 구역 테두리
      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 점령률 바 (내부 호)
      if (zone) {
        const barR = seg.r1 + (seg.r2 - seg.r1) * 0.15;
        const totalAngle = seg.endAngle - seg.startAngle;
        const fillAngle = totalAngle * (zone.occupationRate / 100);
        const midStart = seg.startAngle + (totalAngle - fillAngle) / 2;

        ctx.beginPath();
        ctx.arc(cx, cy, barR, midStart, midStart + fillAngle);
        ctx.strokeStyle = getZoneColor(zone, 0.9);
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // 레이블 위치 계산
      const lx = cx + seg.labelR * Math.cos(seg.labelAngle);
      const ly = cy + seg.labelR * Math.sin(seg.labelAngle);

      // 구역명
      const zoneLabel = ZONE_LABELS.find((l) => l.id === seg.id);
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.font = "bold 9px 'Pretendard', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(zoneLabel?.label ?? "", lx, ly - 12);

      // 점령률 %
      ctx.fillStyle = getTextColor(zone);
      ctx.font = "bold 13px 'Courier New', monospace";
      ctx.fillText(`${zone?.occupationRate ?? 0}%`, lx, ly + 3);

      // 팀명
      ctx.fillStyle = getTextColor(zone);
      ctx.font = "bold 8px 'Pretendard', sans-serif";
      ctx.fillText(
        zone?.owner === "kia" ? "KIA" : zone?.owner === "lg" ? "LG" : "중립",
        lx,
        ly + 15
      );
    });

    // 내야/외야 경계 호
    ctx.beginPath();
    ctx.arc(cx, cy, midR, Math.PI, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // 외야 경계 호
    ctx.beginPath();
    ctx.arc(cx, cy, outerR, Math.PI, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // 내야 경계 호
    ctx.beginPath();
    ctx.arc(cx, cy, innerR, Math.PI, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 중앙 레이블 (그라운드)
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.font = "bold 10px 'Pretendard', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("그라운드", cx, cy - 45);
  }, [zones]);

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        style={{ display: "block", imageRendering: "crisp-edges" }}
      />
    </div>
  );
}
