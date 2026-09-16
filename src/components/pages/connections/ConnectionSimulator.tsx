import { useEffect, useRef, useState } from "react";
import { LegendItem } from "./LegendItem";
import { Stat } from "./Stat";
import { formatClock } from "./formatClock";

const DEFAULTS = {
  nodes: 5,
  connectionsPerNode: 5,
  requestsPerSecond: 25,
  poolUseProbability: 0.5, // 50% of requests use (and renew) a connection
  idleTimeoutMs: 10000, // server closes connections idle longer than this
  initialSpeed: 1,
};

const FLASH_MS = 450;

function makeState(cfg) {
  return {
    simTime: 0,
    reqAccumulator: 0,
    rr: 0,
    lastDispatch: null, // { node, at }
    stats: { total: 0, poolUses: 0, bypassed: 0, failures: 0 },
    nodes: Array.from({ length: cfg.nodes }, (_, i) => ({
      id: i,
      requests: 0,
      failures: 0,
      lastEvent: null, // { type: "bypass" | "hit" | "fail", at }
      conns: Array.from({ length: cfg.connectionsPerNode }, (_, j) => ({
        id: j,
        // Stagger initial freshness so the pools don't all expire in unison.
        lastUsed: -Math.random() * cfg.idleTimeoutMs * 0.5,
        uses: 0,
        deaths: 0,
        lastEvent: null, // { type: "hit" | "fail", at }
      })),
    })),
  };
}

function fireRequest(state, cfg) {
  const node = state.nodes[state.rr];
  state.rr = (state.rr + 1) % state.nodes.length;
  state.stats.total += 1;
  node.requests += 1;
  state.lastDispatch = { node: node.id, at: state.simTime };

  // Half the requests never touch the connection pool (cache hit, no-op, etc.)
  if (Math.random() >= cfg.poolUseProbability) {
    state.stats.bypassed += 1;
    node.lastEvent = { type: "bypass", at: state.simTime };
    return;
  }

  state.stats.poolUses += 1;
  const conn = node.conns[Math.floor(Math.random() * node.conns.length)];
  const dead = state.simTime - conn.lastUsed > cfg.idleTimeoutMs;

  if (dead) {
    // The server closed this connection long ago; the client just found out.
    state.stats.failures += 1;
    node.failures += 1;
    conn.deaths += 1;
    conn.lastEvent = { type: "fail", at: state.simTime };
    node.lastEvent = { type: "fail", at: state.simTime };
  } else {
    conn.lastEvent = { type: "hit", at: state.simTime };
    node.lastEvent = { type: "hit", at: state.simTime };
  }
  conn.uses += 1;
  conn.lastUsed = state.simTime; // renewed — or re-established after failing
}


const palette = {
  bg: "#0f172a",
  card: "#1e293b",
  cardEdge: "#334155",
  text: "#e2e8f0",
  muted: "#94a3b8",
  faint: "#64748b",
  green: "#34d399",
  amber: "#fbbf24",
  red: "#f87171",
  blue: "#60a5fa",
  track: "#0b1120",
};

export default function ConnectionSimulator(props) {
  const cfg = { ...DEFAULTS, ...props };
  const stateRef = useRef(null);
  if (stateRef.current === null) {
	stateRef.current = makeState(cfg);
  }

  const [running, setRunning] = useState(true);
  const [speed, setSpeed] = useState(cfg.initialSpeed);
  const [, setTick] = useState(0);

  const runningRef = useRef(running);
  runningRef.current = running;
  const speedRef = useRef(speed);
  speedRef.current = speed;

  useEffect(() => {
    let raf;
    let last = performance.now();
    const interval = 1000 / cfg.requestsPerSecond;

    const loop = (t) => {
      const dt = Math.min(t - last, 100); // clamp away background-tab jumps
      last = t;
      if (runningRef.current) {
        const s = stateRef.current;
        const simDt = dt * speedRef.current;
        s.simTime += simDt;
        s.reqAccumulator += simDt;
        while (s.reqAccumulator >= interval) {
          s.reqAccumulator -= interval;
          fireRequest(s, cfg);
        }
        setTick((x) => x + 1);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reset = () => {
    stateRef.current = makeState(cfg);
    setTick((x) => x + 1);
  };

  const s = stateRef.current;
  const now = s.simTime;
  const deadNow = s.nodes.reduce(
    (acc, n) =>
      acc + n.conns.filter((c) => now - c.lastUsed > cfg.idleTimeoutMs).length,
    0
  );
  const totalConns = cfg.nodes * cfg.connectionsPerNode;
  const poolFailPct =
    s.stats.poolUses > 0
      ? ((s.stats.failures / s.stats.poolUses) * 100).toFixed(1)
      : "0.0";

  const flash = (evt) =>
    evt && now - evt.at < FLASH_MS ? evt.type : null;

  return (
    <div style={sx.root}>
      <style>{keyframes}</style>

      {/* ─── Header ─────────────────────────────────────────────── */}
      <div style={sx.header}>
        <div>
          <div style={sx.title}>Random connection selection</div>
          <div style={sx.subtitle}>
            Round-robin across nodes · random connection per node · server
            closes connections idle &gt; {cfg.idleTimeoutMs / 1000}s
          </div>
        </div>
        <div style={sx.controls}>
          <button
            style={{ ...sx.btn, ...(running ? {} : sx.btnAccent) }}
            onClick={() => setRunning((r) => !r)}
          >
            {running ? "Pause" : "Play"}
          </button>
          <button style={sx.btn} onClick={reset}>
            Reset
          </button>
          <span style={sx.speedGroup}>
            {[1, 2, 4, 8].map((x) => (
              <button
                key={x}
                style={{ ...sx.speedBtn, ...(speed === x ? sx.speedOn : {}) }}
                onClick={() => setSpeed(x)}
              >
                {x}×
              </button>
            ))}
          </span>
        </div>
      </div>

      {/* ─── Stats ──────────────────────────────────────────────── */}
      <div style={sx.stats}>
        <Stat label="sim time" value={formatClock(now)} />
        <Stat label="requests" value={s.stats.total} />
        <Stat label="used pool" value={s.stats.poolUses} />
        <Stat label="failed" value={s.stats.failures} color={palette.red} />
        <Stat
          label="fail rate (pool)"
          value={`${poolFailPct}%`}
          color={s.stats.failures > 0 ? palette.red : palette.muted}
        />
        <Stat
          label="dead now"
          value={`${deadNow}/${totalConns}`}
          color={deadNow > 0 ? palette.amber : palette.green}
        />
      </div>

      {/* ─── Load balancer ──────────────────────────────────────── */}
      <div style={sx.lbRow}>
        <div style={sx.lb}>
          <span style={sx.lbDot} />
          load balancer
          <span style={sx.lbInfo}>
            round-robin · {cfg.requestsPerSecond} req/s
            {s.lastDispatch && now - s.lastDispatch.at < FLASH_MS && (
              <span style={sx.lbDispatch}>
                {" "}
                → node-{s.lastDispatch.node}
              </span>
            )}
          </span>
        </div>
      </div>

      {/* ─── Nodes ──────────────────────────────────────────────── */}
      <div style={sx.nodeRow}>
        {s.nodes.map((node) => {
          const nodeFlash = flash(node.lastEvent);
          return (
            <div
              key={node.id}
              style={{
                ...sx.node,
                ...(nodeFlash === "fail"
                  ? sx.nodeFail
                  : nodeFlash === "hit"
                  ? sx.nodeHit
                  : nodeFlash === "bypass"
                  ? sx.nodeBypass
                  : {}),
              }}
            >
              <div style={sx.nodeHeader}>
                <span style={sx.nodeName}>node-{node.id}</span>
                <span style={sx.nodeMeta}>
                  {node.failures > 0 && (
                    <span style={{ color: palette.red }}>
                      {node.failures}✕{" "}
                    </span>
                  )}
                  {node.requests}
                </span>
              </div>
              <div style={sx.connList}>
                {node.conns.map((conn) => {
                  const idleFor = now - conn.lastUsed;
                  const dead = idleFor > cfg.idleTimeoutMs;
                  const freshness = Math.max(
                    0,
                    Math.min(1, 1 - idleFor / cfg.idleTimeoutMs)
                  );
                  const connFlash = flash(conn.lastEvent);
                  const barColor = dead
                    ? palette.faint
                    : freshness > 0.5
                    ? palette.green
                    : freshness > 0.2
                    ? palette.amber
                    : palette.red;
                  return (
                    <div
                      key={conn.id}
                      style={{
                        ...sx.conn,
                        ...(connFlash === "fail"
                          ? sx.connFail
                          : connFlash === "hit"
                          ? sx.connHit
                          : {}),
                      }}
                      title={
                        dead
                          ? `closed by server (idle ${(idleFor / 1000).toFixed(
                              1
                            )}s) — client doesn't know yet`
                          : `idle ${(idleFor / 1000).toFixed(1)}s / ${
                              cfg.idleTimeoutMs / 1000
                            }s`
                      }
                    >
                      <span
                        style={{
                          ...sx.connDot,
                          background: dead ? palette.red : palette.green,
                          ...(dead ? sx.connDotDead : {}),
                        }}
                      />
                      <span style={sx.connTrack}>
                        <span
                          style={{
                            ...sx.connBar,
                            width: `${freshness * 100}%`,
                            background: barColor,
                          }}
                        />
                      </span>
                      {conn.deaths > 0 && (
                        <span style={sx.connDeaths}>{conn.deaths}✕</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── Legend & takeaway ──────────────────────────────────── */}
      <div style={sx.legend}>
        <LegendItem color={palette.green} label="fresh" />
        <LegendItem color={palette.amber} label="aging" />
        <LegendItem color={palette.red} label="near timeout / failed" />
        <LegendItem color={palette.faint} label="dead (server closed it)" />
        <LegendItem color={palette.blue} label="request bypassed pool" />
      </div>
      <div style={sx.footnote}>
        Every choice here is individually reasonable — the load balancer is
        perfectly fair, and random selection is uniform. But renewal is
        probabilistic: with 5 connections and only ~0.5 pool-hits per node per
        second, each connection has a ({cfg.connectionsPerNode - 1}/
        {cfg.connectionsPerNode})<sup>10</sup> ≈ 35% chance of sitting untouched
        past the {cfg.idleTimeoutMs / 1000}s idle timeout. The client only
        discovers the corpse when it picks it: the request fails, the
        connection is rebuilt, and the cycle repeats — a permanent background
        error rate produced by nothing but fair randomness.
      </div>
    </div>
  );
}




const keyframes = `
@keyframes csim-pulse-fail {
  0% { box-shadow: 0 0 0 0 rgba(248,113,113,0.55); }
  100% { box-shadow: 0 0 0 8px rgba(248,113,113,0); }
}
@keyframes csim-pulse-hit {
  0% { box-shadow: 0 0 0 0 rgba(52,211,153,0.45); }
  100% { box-shadow: 0 0 0 8px rgba(52,211,153,0); }
}
`;

const mono =
  "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace";
const sans =
  "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

const sx = {
  root: {
    background: palette.bg,
    color: palette.text,
    borderRadius: 12,
    padding: "16px 16px 14px",
    fontFamily: sans,
    fontSize: 13,
    lineHeight: 1.4,
    maxWidth: "100%",
    boxSizing: "border-box",
    border: `1px solid ${palette.cardEdge}`,
  },
  header: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  title: { fontWeight: 700, fontSize: 15 },
  subtitle: { color: palette.muted, fontSize: 12, marginTop: 2 },
  controls: { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" },
  btn: {
    background: palette.card,
    color: palette.text,
    border: `1px solid ${palette.cardEdge}`,
    borderRadius: 6,
    padding: "4px 12px",
    fontSize: 12,
    fontFamily: sans,
    cursor: "pointer",
  },
  btnAccent: { borderColor: palette.green, color: palette.green },
  speedGroup: { display: "inline-flex", gap: 2, marginLeft: 4 },
  speedBtn: {
    background: "transparent",
    color: palette.faint,
    border: `1px solid ${palette.cardEdge}`,
    borderRadius: 6,
    padding: "4px 7px",
    fontSize: 11,
    fontFamily: mono,
    cursor: "pointer",
  },
  speedOn: { color: palette.text, background: palette.card },
  stats: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 12,
  },
  stat: {
    background: palette.card,
    border: `1px solid ${palette.cardEdge}`,
    borderRadius: 8,
    padding: "6px 12px",
    minWidth: 74,
    flex: "1 1 auto",
    textAlign: "center",
  },
  statValue: { fontFamily: mono, fontSize: 15, fontWeight: 600 },
  statLabel: {
    color: palette.faint,
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    marginTop: 1,
  },
  lbRow: { display: "flex", justifyContent: "center", marginBottom: 10 },
  lb: {
    background: palette.card,
    border: `1px solid ${palette.cardEdge}`,
    borderRadius: 8,
    padding: "7px 16px",
    fontFamily: mono,
    fontSize: 12,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  lbDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: palette.blue,
    display: "inline-block",
  },
  lbInfo: { color: palette.faint, fontSize: 11 },
  lbDispatch: { color: palette.blue },
  nodeRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  node: {
    background: palette.card,
    border: `1px solid ${palette.cardEdge}`,
    borderRadius: 10,
    padding: "8px 10px",
    flex: "1 1 150px",
    minWidth: 140,
    boxSizing: "border-box",
    transition: "border-color 120ms",
  },
  nodeHit: {
    borderColor: palette.green,
    animation: `csim-pulse-hit ${FLASH_MS}ms ease-out`,
  },
  nodeFail: {
    borderColor: palette.red,
    animation: `csim-pulse-fail ${FLASH_MS}ms ease-out`,
  },
  nodeBypass: { borderColor: palette.blue },
  nodeHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 7,
  },
  nodeName: { fontFamily: mono, fontSize: 12, fontWeight: 600 },
  nodeMeta: { fontFamily: mono, fontSize: 10, color: palette.faint },
  connList: { display: "flex", flexDirection: "column", gap: 5 },
  conn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    borderRadius: 4,
    padding: "2px 3px",
    transition: "background 120ms",
  },
  connHit: { background: "rgba(52,211,153,0.12)" },
  connFail: { background: "rgba(248,113,113,0.18)" },
  connDot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    flex: "0 0 auto",
  },
  connDotDead: { boxShadow: `0 0 5px ${palette.red}` },
  connTrack: {
    flex: "1 1 auto",
    height: 6,
    background: palette.track,
    borderRadius: 3,
    overflow: "hidden",
    display: "block",
  },
  connBar: {
    display: "block",
    height: "100%",
    borderRadius: 3,
    transition: "width 200ms linear",
  },
  connDeaths: {
    fontFamily: mono,
    fontSize: 9,
    color: palette.red,
    flex: "0 0 auto",
  },
  legend: {
    display: "flex",
    flexWrap: "wrap",
    gap: 12,
    color: palette.muted,
    fontSize: 11,
    marginBottom: 8,
  },
  legendItem: { display: "inline-flex", alignItems: "center", gap: 5 },
  legendSwatch: {
    width: 8,
    height: 8,
    borderRadius: 2,
    display: "inline-block",
  },
  footnote: {
    color: palette.muted,
    fontSize: 11.5,
    borderTop: `1px solid ${palette.cardEdge}`,
    paddingTop: 9,
  },
};
