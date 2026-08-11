// PokerOS — datos ficticios pero realistas para el prototipo.

export const player = {
  name: 'Alex Rivera',
  handle: '@alexmtt',
  initials: 'AR',
  bankroll: 18420,
  plan: 'ELITE',
}

export type Room = 'GGPoker' | 'PokerStars' | 'WPT Global' | 'Live'
export const rooms: Room[] = ['GGPoker', 'PokerStars', 'WPT Global', 'Live']

export type Format = 'Mystery Bounty' | 'PKO' | 'Freezeout' | 'MTT Regular' | 'Satélite' | 'Turbo'

// ---------- KPIs Dashboard ----------
export const dashboardKpis = [
  { key: 'bankroll', label: 'Bankroll total', value: 18420, unit: 'usd', change: 6.2, tip: 'bankroll' },
  { key: 'profit', label: 'Ganancia total', value: 7840, unit: 'usd', sign: true, change: 14.8, tip: 'profit' },
  { key: 'roi', label: 'ROI', value: 18.4, unit: 'pct', sign: true, change: 2.1, tip: 'roi' },
  { key: 'abi', label: 'ABI', value: 32.6, unit: 'usd-dec', change: -3.4, tip: 'abi' },
  { key: 'tournaments', label: 'Torneos', value: 2847, unit: 'num', change: 8.9, tip: 'field' },
  { key: 'itm', label: 'ITM', value: 17.8, unit: 'pct', change: 0.6, tip: 'itm' },
] as const

// ---------- Evolución del bankroll (serie temporal) ----------
function buildBankrollSeries() {
  const points: {
    date: string
    label: string
    bankroll: number
    profit: number
    tournaments: number
  }[] = []
  let bankroll = 10580
  let profit = 0
  let tournaments = 0
  const start = new Date('2025-01-01')
  // ~52 puntos semanales
  for (let i = 0; i < 52; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i * 7)
    // varianza realista con tendencia positiva
    const swing = Math.sin(i / 3.1) * 900 + (Math.random() - 0.42) * 1100
    const drift = 150
    bankroll = Math.max(6000, bankroll + swing + drift)
    profit += swing + drift
    tournaments += 45 + Math.round(Math.random() * 25)
    points.push({
      date: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
      bankroll: Math.round(bankroll),
      profit: Math.round(profit),
      tournaments,
    })
  }
  // aterrizar en los valores del brief
  points[points.length - 1].bankroll = 18420
  return points
}
export const bankrollSeries = buildBankrollSeries()
export const bankrollStats = {
  current: 18420,
  allTimeHigh: 21380,
  drawdown: -13.8,
}

// ---------- Rendimiento por formato ----------
export const formatPerformance: {
  format: Format
  profit: number
  roi: number
  tournaments: number
  itm: number
}[] = [
  { format: 'Mystery Bounty', profit: 3820, roi: 31, tournaments: 612, itm: 19.2 },
  { format: 'PKO', profit: 2640, roi: 22, tournaments: 848, itm: 18.1 },
  { format: 'MTT Regular', profit: 2200, roi: 15, tournaments: 902, itm: 17.4 },
  { format: 'Freezeout', profit: -820, roi: -6, tournaments: 341, itm: 14.8 },
  { format: 'Turbo', profit: -420, roi: -4, tournaments: 144, itm: 13.9 },
]

// ---------- Rendimiento por buy-in ----------
export const buyinPerformance = [
  { range: 'USD 0–10', tournaments: 684, profit: 1240, roi: 24.1, itm: 19.8, abi: 7.2 },
  { range: 'USD 10–25', tournaments: 902, profit: 3180, roi: 26.4, itm: 18.9, abi: 17.4 },
  { range: 'USD 25–55', tournaments: 741, profit: 4120, roi: 21.2, itm: 17.6, abi: 38.1 },
  { range: 'USD 55–109', tournaments: 358, profit: 820, roi: 6.8, itm: 15.2, abi: 78.4 },
  { range: 'USD 109+', tournaments: 162, profit: -1520, roi: -12.4, itm: 12.1, abi: 148.6 },
]

// ---------- Bankroll manager ----------
export const bankrollManager = {
  total: 18420,
  available: 16900,
  pending: 1520,
  recommendedAbi: 'USD 25–40',
  risk: 'BAJO' as 'BAJO' | 'MEDIO' | 'ALTO',
  distribution: [
    { room: 'GGPoker', amount: 8420 },
    { room: 'PokerStars', amount: 4800 },
    { room: 'WPT Global', amount: 2100 },
    { room: 'Bankroll Live', amount: 3100 },
  ],
}

export const bankrollRules = [
  { format: 'MTT Regular', buyins: 150 },
  { format: 'PKO', buyins: 200 },
  { format: 'Mystery Bounty', buyins: 250 },
  { format: 'Alta varianza', buyins: 300 },
]

export type MovementType = 'Depósito' | 'Retiro' | 'Buy-in' | 'Premio' | 'Transferencia' | 'Ajuste'
export const movements: {
  id: string
  date: string
  room: string
  type: MovementType
  amount: number
  balance: number
  notes: string
}[] = [
  { id: 'm1', date: '2026-08-10', room: 'GGPoker', type: 'Premio', amount: 884, balance: 18420, notes: 'GGMasters Mystery Bounty' },
  { id: 'm2', date: '2026-08-10', room: 'GGPoker', type: 'Buy-in', amount: -612, balance: 17536, notes: 'Sesión 23 torneos' },
  { id: 'm3', date: '2026-08-08', room: 'PokerStars', type: 'Retiro', amount: -1520, balance: 18148, notes: 'Retiro pendiente' },
  { id: 'm4', date: '2026-08-05', room: 'WPT Global', type: 'Depósito', amount: 1000, balance: 19668, notes: 'Recarga mensual' },
  { id: 'm5', date: '2026-08-03', room: 'GGPoker', type: 'Transferencia', amount: -800, balance: 18668, notes: 'A bankroll Live' },
  { id: 'm6', date: '2026-08-01', room: 'Live', type: 'Ajuste', amount: 120, balance: 19468, notes: 'Ajuste caja live' },
  { id: 'm7', date: '2026-07-29', room: 'PokerStars', type: 'Premio', amount: 1440, balance: 19348, notes: 'Sunday Special FT' },
  { id: 'm8', date: '2026-07-28', room: 'PokerStars', type: 'Buy-in', amount: -540, balance: 17908, notes: 'Sesión domingo' },
]

// ---------- Historial de torneos ----------
export const tournamentHistory: {
  id: string
  date: string
  name: string
  room: Room
  format: Format
  buyin: number
  entrants: number
  position: number
  prize: number
  profit: number
  roi: number
}[] = [
  { id: 't1', date: '2026-08-10', name: 'GGMasters Mystery Bounty', room: 'GGPoker', format: 'Mystery Bounty', buyin: 54, entrants: 3842, position: 41, prize: 428, profit: 374, roi: 692 },
  { id: 't2', date: '2026-08-10', name: 'Bounty Hunters HR', room: 'GGPoker', format: 'PKO', buyin: 33, entrants: 2104, position: 6, prize: 612, profit: 579, roi: 1754 },
  { id: 't3', date: '2026-08-09', name: 'Sunday Deepstack', room: 'PokerStars', format: 'MTT Regular', buyin: 55, entrants: 1288, position: 240, prize: 0, profit: -55, roi: -100 },
  { id: 't4', date: '2026-08-09', name: 'Big Turbo', room: 'WPT Global', format: 'Turbo', buyin: 22, entrants: 940, position: 12, prize: 188, profit: 166, roi: 754 },
  { id: 't5', date: '2026-08-08', name: 'Mystery Bounty Prime', room: 'WPT Global', format: 'Mystery Bounty', buyin: 44, entrants: 1560, position: 88, prize: 0, profit: -44, roi: -100 },
  { id: 't6', date: '2026-08-08', name: 'Freezeout Championship', room: 'PokerStars', format: 'Freezeout', buyin: 109, entrants: 720, position: 310, prize: 0, profit: -109, roi: -100 },
  { id: 't7', date: '2026-08-07', name: 'GGMasters', room: 'GGPoker', format: 'MTT Regular', buyin: 25, entrants: 5210, position: 3, prize: 1840, profit: 1815, roi: 7260 },
  { id: 't8', date: '2026-08-07', name: 'PKO Bounty Builder', room: 'PokerStars', format: 'PKO', buyin: 33, entrants: 1820, position: 145, prize: 42, profit: 9, roi: 27 },
  { id: 't9', date: '2026-08-06', name: 'Mini Main Event', room: 'WPT Global', format: 'MTT Regular', buyin: 55, entrants: 2440, position: 58, prize: 320, profit: 265, roi: 481 },
  { id: 't10', date: '2026-08-05', name: 'Mystery Bounty Weekend', room: 'GGPoker', format: 'Mystery Bounty', buyin: 54, entrants: 4120, position: 22, prize: 1120, profit: 1066, roi: 1974 },
]

// ---------- Perfil profit por dimensión (analytics) ----------
export const profitByDay = [
  { day: 'Lun', profit: 420 },
  { day: 'Mar', profit: 680 },
  { day: 'Mié', profit: -210 },
  { day: 'Jue', profit: 1120 },
  { day: 'Vie', profit: 340 },
  { day: 'Sáb', profit: 2240 },
  { day: 'Dom', profit: 3250 },
]

export const profitByHour = [
  { hour: '14h', profit: 120 },
  { hour: '16h', profit: 340 },
  { hour: '18h', profit: 980 },
  { hour: '20h', profit: 1840 },
  { hour: '22h', profit: 2210 },
  { hour: '00h', profit: 640 },
  { hour: '02h', profit: -280 },
]

export const profitByRoom = [
  { room: 'GGPoker', profit: 4320 },
  { room: 'PokerStars', profit: 1980 },
  { room: 'WPT Global', profit: 1240 },
  { room: 'Live', profit: 300 },
]

export const monthlyVolume = [
  { month: 'Ene', tournaments: 198, profit: 420 },
  { month: 'Feb', tournaments: 224, profit: 880 },
  { month: 'Mar', tournaments: 256, profit: -320 },
  { month: 'Abr', tournaments: 241, profit: 1240 },
  { month: 'May', tournaments: 278, profit: 1680 },
  { month: 'Jun', tournaments: 302, profit: 2110 },
  { month: 'Jul', tournaments: 331, profit: 1290 },
  { month: 'Ago', tournaments: 187, profit: 540 },
]

export const abiEvolution = [
  { month: 'Ene', abi: 21 },
  { month: 'Feb', abi: 24 },
  { month: 'Mar', abi: 28 },
  { month: 'Abr', abi: 30 },
  { month: 'May', abi: 33 },
  { month: 'Jun', abi: 38 },
  { month: 'Jul', abi: 41 },
  { month: 'Ago', abi: 32 },
]

// ---------- Planificador ----------
export const plannerResult = {
  tournaments: 18,
  totalBuyins: 438,
  abi: 24.33,
  exposure: 2.4,
  duration: '7h 20m',
  risk: 'BAJO' as const,
}

export const plannerTimeline: {
  time: string
  name: string
  room: Room
  buyin: number
  guaranteed: string
  format: Format
  field: string
  duration: string
  score: number
}[] = [
  { time: '17:00', name: 'GGMasters', room: 'GGPoker', buyin: 25, guaranteed: 'USD 150K', format: 'MTT Regular', field: '~5.000', duration: '5h 30m', score: 84 },
  { time: '17:30', name: 'Bounty Hunters', room: 'GGPoker', buyin: 22, guaranteed: 'USD 40K', format: 'PKO', field: '~2.100', duration: '4h 45m', score: 88 },
  { time: '18:00', name: 'Mystery Bounty Prime', room: 'WPT Global', buyin: 54, guaranteed: 'USD 100K', format: 'Mystery Bounty', field: '~3.800', duration: '6h 10m', score: 92 },
  { time: '18:30', name: 'Turbo Series', room: 'PokerStars', buyin: 11, guaranteed: 'USD 15K', format: 'Turbo', field: '~940', duration: '3h 10m', score: 71 },
  { time: '19:00', name: 'Deepstack Edition', room: 'PokerStars', buyin: 33, guaranteed: 'USD 50K', format: 'MTT Regular', field: '~1.800', duration: '6h 40m', score: 79 },
]

// ---------- Session review ----------
export const sessionReview = {
  date: '10 de agosto, 2026',
  tournaments: 23,
  buyins: 612,
  prizes: 884,
  profit: 272,
  roi: 44.4,
  duration: '8h 12m',
  bestResult: 'GGMasters — Pos. 3 (USD 1.840)',
  biggestBuyin: 'USD 109 Freezeout',
  biggestField: '5.210 jugadores',
  bestRoiTournament: 'Bounty Hunters HR (+1.754%)',
  mental: {
    energy: 8,
    focus: 7,
    tilt: 3,
    decisions: 8,
  },
}

export const sessionProfitTimeline = [
  { t: '17:00', profit: 0 },
  { t: '18:00', profit: -180 },
  { t: '19:00', profit: -320 },
  { t: '20:00', profit: 120 },
  { t: '21:00', profit: 480 },
  { t: '22:00', profit: 210 },
  { t: '23:00', profit: 640 },
  { t: '00:00', profit: 272 },
]

// ---------- Estudio ----------
export const study = {
  weeklyGoalHours: 5,
  completed: '3h 42m',
  completedPct: 74,
  categories: [
    { name: 'Revisión de manos', hours: 1.2 },
    { name: 'Solver', hours: 0.8 },
    { name: 'Coaching', hours: 0.5 },
    { name: 'Videos', hours: 0.7 },
    { name: 'Teoría', hours: 0.3 },
    { name: 'ICM', hours: 0.2 },
    { name: 'Mental Game', hours: 0.0 },
  ],
  recommended: {
    title: 'ICM — Últimas 3 mesas',
    priority: 'ALTA' as const,
    reason:
      'Tu rendimiento disminuye significativamente cuando alcanzas las últimas tres mesas con stacks entre 15 y 30 BB.',
  },
}

// ---------- Objetivos ----------
export const goals = [
  { label: 'Jugar 8.000 torneos', current: 4842, target: 8000, unit: 'num' },
  { label: 'Bankroll objetivo', current: 18420, target: 30000, unit: 'usd' },
  { label: 'ROI objetivo', current: 18.4, target: 15, unit: 'pct', achieved: true },
  { label: 'Horas de estudio', current: 132, target: 250, unit: 'num' },
]

export const projection = [
  { month: 'Ago', conservador: 18420, base: 18420, optimista: 18420 },
  { month: 'Sep', conservador: 19100, base: 20400, optimista: 21800 },
  { month: 'Oct', conservador: 19900, base: 22100, optimista: 24200 },
  { month: 'Nov', conservador: 20600, base: 24300, optimista: 27600 },
  { month: 'Dic', conservador: 21400, base: 26800, optimista: 31500 },
]

// ---------- Integraciones ----------
export const integrations = {
  rooms: [
    { name: 'GGPoker', status: 'Conectado' },
    { name: 'PokerStars', status: 'Importación disponible' },
    { name: 'WPT Global', status: 'Carga manual' },
  ],
  software: [
    { name: 'PokerTracker', status: 'Importación disponible' },
    { name: 'Hand2Note', status: 'Carga manual' },
  ],
  study: [{ name: 'GTO Wizard', status: 'Próximamente' }],
}

// ---------- Reportes ----------
export const reports = [
  { name: 'Reporte mensual', desc: 'Resumen de resultados, volumen y ROI del mes.' },
  { name: 'Reporte anual', desc: 'Visión completa de la temporada y evolución de bankroll.' },
  { name: 'Reporte de bankroll', desc: 'Movimientos, distribución y nivel de riesgo.' },
  { name: 'Reporte de rendimiento', desc: 'Analytics por formato, buy-in, sala y horario.' },
  { name: 'Reporte para coach', desc: 'Métricas clave preparadas para revisión con tu coach.' },
  { name: 'Reporte de torneos', desc: 'Historial detallado con posiciones y premios.' },
]

// ---------- Teams ----------
export const teamStats = {
  players: 48,
  volume: 12840,
  profit: 48320,
  avgRoi: 16.2,
}

export const teamPlayers: {
  id: string
  name: string
  bankroll: number
  abi: number
  tournaments: number
  roi: number
  profit: number
  risk: 'BAJO' | 'MEDIO' | 'ALTO'
  lastSession: string
}[] = [
  { id: 'p1', name: 'Jugador #7', bankroll: 8200, abi: 31, tournaments: 3120, roi: -4.2, profit: -1840, risk: 'ALTO', lastSession: 'Hace 2h' },
  { id: 'p2', name: 'Jugador #12', bankroll: 14200, abi: 58, tournaments: 2410, roi: 8.4, profit: 2210, risk: 'ALTO', lastSession: 'Hace 5h' },
  { id: 'p3', name: 'Jugador #23', bankroll: 26400, abi: 42, tournaments: 4180, roi: 19.8, profit: 8640, risk: 'BAJO', lastSession: 'Ayer' },
  { id: 'p4', name: 'Jugador #4', bankroll: 11800, abi: 28, tournaments: 2980, roi: 14.1, profit: 3120, risk: 'MEDIO', lastSession: 'Hace 1d' },
  { id: 'p5', name: 'Jugador #31', bankroll: 19600, abi: 36, tournaments: 3560, roi: 22.4, profit: 6480, risk: 'BAJO', lastSession: 'Hace 3h' },
  { id: 'p6', name: 'Jugador #19', bankroll: 6400, abi: 18, tournaments: 1840, roi: 11.2, profit: 980, risk: 'MEDIO', lastSession: 'Hace 6h' },
]

export const teamAlerts = [
  { type: 'warning', text: 'Jugador #12 aumentó demasiado su ABI.' },
  { type: 'loss', text: 'Jugador #7 lleva un drawdown de 124 buy-ins.' },
  { type: 'profit', text: 'Jugador #23 alcanzó un nuevo máximo de bankroll.' },
]

// ---------- Notificaciones ----------
export const notifications = [
  { text: 'Nuevo máximo histórico de bankroll.', type: 'profit', time: 'Hace 2h' },
  { text: 'Tu nivel de riesgo aumentó.', type: 'warning', time: 'Hace 5h' },
  { text: 'PokerOS encontró 12 torneos compatibles con tu perfil.', type: 'info', time: 'Hoy' },
  { text: 'Tu reporte mensual está disponible.', type: 'info', time: 'Ayer' },
  { text: 'Completaste tu objetivo semanal de volumen.', type: 'profit', time: 'Ayer' },
  { text: 'Tu ROI en Mystery Bounty alcanzó 26%.', type: 'profit', time: 'Hace 2d' },
]

// ---------- Tooltips de métricas ----------
export const metricTooltips: Record<string, string> = {
  roi: 'Return On Investment: ganancia neta dividida por el total invertido en buy-ins.',
  abi: 'Average Buy-In: el buy-in promedio de los torneos que juegas.',
  itm: 'In The Money: porcentaje de torneos en los que terminas cobrando premio.',
  drawdown: 'Caída desde tu máximo histórico de bankroll hasta el punto más bajo posterior.',
  bankroll: 'El capital total destinado exclusivamente a jugar al póker.',
  profit: 'Ganancia neta: premios cobrados menos buy-ins pagados.',
  exposure: 'Bankroll Exposure: porcentaje de tu bankroll comprometido en una sesión o torneo.',
  field: 'Field: la cantidad de jugadores inscritos en un torneo.',
  score: 'PokerOS Score: puntuación de 0 a 100 que mide qué tan compatible es un torneo con tu perfil y bankroll.',
}

// ---------- PokerOS AI ----------
export const aiSuggestions = [
  '¿Por qué estoy perdiendo este mes?',
  '¿En qué torneos tengo mayor ROI?',
  '¿Qué torneos debería dejar de jugar?',
  '¿Debería subir de nivel?',
  'Analiza mis últimos 1.000 torneos.',
  '¿Dónde estoy perdiendo más dinero?',
  '¿Qué debería estudiar esta semana?',
  'Arma mi sesión para hoy.',
]

export const aiInsight = {
  headline:
    'Tu ROI en torneos Mystery Bounty es un 27% superior a tu ROI general durante los últimos 90 días.',
  recommendation:
    'Considera aumentar tu volumen en Mystery Bounty de USD 20–55 manteniendo tu exposición actual de bankroll.',
}
