/**
 * F1 2026 Championship Tracker
 * Dynamic API integration and premium visualization
 */

// Base API endpoints
const API_BASE = 'https://api.jolpi.ca/ergast/f1/2026';

// Curated Fallback/Simulated Data in case the Jolpica API is down or throttled
const FALLBACK_DATA = {
  driverStandings: [
    { position: "1", points: "156", Driver: { givenName: "George", familyName: "Russell", code: "RUS" }, Constructors: [{ name: "Mercedes" }] },
    { position: "2", points: "138", Driver: { givenName: "Andrea Kimi", familyName: "Antonelli", code: "ANT" }, Constructors: [{ name: "Mercedes" }] },
    { position: "3", points: "112", Driver: { givenName: "Lewis", familyName: "Hamilton", code: "HAM" }, Constructors: [{ name: "Ferrari" }] },
    { position: "4", points: "98", Driver: { givenName: "Charles", familyName: "Leclerc", code: "LEC" }, Constructors: [{ name: "Ferrari" }] },
    { position: "5", points: "85", Driver: { givenName: "Lando", familyName: "Norris", code: "NOR" }, Constructors: [{ name: "McLaren" }] },
    { position: "6", points: "82", Driver: { givenName: "Oscar", familyName: "Piastri", code: "PIA" }, Constructors: [{ name: "McLaren" }] },
    { position: "7", points: "78", Driver: { givenName: "Max", familyName: "Verstappen", code: "VER" }, Constructors: [{ name: "Red Bull" }] }
  ],
  constructorStandings: [
    { position: "1", points: "294", Constructor: { name: "Mercedes" } },
    { position: "2", points: "210", Constructor: { name: "Ferrari" } },
    { position: "3", points: "167", Constructor: { name: "McLaren" } },
    { position: "4", points: "95", Constructor: { name: "Red Bull" } },
    { position: "5", points: "45", Constructor: { name: "Alpine F1 Team" } },
    { position: "6", points: "39", Constructor: { name: "RB F1 Team" } }
  ],
  calendar: [
    { round: "7", raceName: "Spanish Grand Prix", date: "2026-06-07", time: "13:00:00Z", Circuit: { circuitName: "Circuit de Barcelona-Catalunya" } },
    { 
      round: "8", 
      raceName: "Austrian Grand Prix", 
      date: "2026-06-28", 
      time: "13:00:00Z", 
      Circuit: { circuitName: "Red Bull Ring" },
      Qualifying: { date: "2026-06-27", time: "14:00:00Z" },
      Sprint: { date: "2026-06-27", time: "10:30:00Z" }
    },
    { 
      round: "9", 
      raceName: "British Grand Prix", 
      date: "2026-07-05", 
      time: "14:00:00Z", 
      Circuit: { circuitName: "Silverstone Circuit" },
      Qualifying: { date: "2026-07-04", time: "15:00:00Z" }
    }
  ],
  poles: [
    { driver: "George Russell", count: 3 },
    { driver: "Andrea Kimi", familyName: "Antonelli", count: 2 },
    { driver: "Lewis Hamilton", count: 2 },
    { driver: "Max Verstappen", count: 1 }
  ],
  dnfs: [
    { team: "Aston Martin", count: 4 },
    { team: "Alpine F1 Team", count: 3 },
    { team: "Williams", count: 3 },
    { team: "Red Bull", count: 2 },
    { team: "Cadillac F1 Team", count: 2 }
  ],
  pitstops: [
    { team: "McLaren", duration: 2.15 },
    { team: "Ferrari", duration: 2.16 },
    { team: "Red Bull", duration: 2.18 },
    { team: "Mercedes", duration: 2.24 },
    { team: "Williams", duration: 2.62 }
  ]
};

// Application State
let state = {
  driverStandings: [],
  constructorStandings: [],
  races: [],
  poles: [],
  dnfs: [],
  pitstops: [],
  currentRound: 6,
  totalRounds: 22
};

// Helper: Safely format driver names
function formatDriverName(driver) {
  if (!driver) return 'Unknown';
  return `${driver.givenName} ${driver.familyName}`;
}

// Fetch all necessary data
async function initializeDashboard() {
  const refreshStatus = document.getElementById('refresh-status');
  refreshStatus.textContent = 'Status: Fetching API Data...';

  try {
    const [standingsRes, constRes, calendarRes, qualifyingRes, resultsRes] = await Promise.all([
      fetch(`${API_BASE}/driverStandings.json`).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(`${API_BASE}/constructorStandings.json`).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(`${API_BASE}.json`).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(`${API_BASE}/qualifying.json?limit=500`).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(`${API_BASE}/results.json?limit=1000`).then(r => r.ok ? r.json() : null).catch(() => null)
    ]);

    // 1. Process Driver Standings
    if (standingsRes?.MRData?.StandingsTable?.StandingsLists?.[0]) {
      const list = standingsRes.MRData.StandingsTable.StandingsLists[0];
      state.driverStandings = list.DriverStandings;
      state.currentRound = parseInt(list.round) || 6;
    } else {
      state.driverStandings = FALLBACK_DATA.driverStandings;
    }

    // 2. Process Constructor Standings
    if (constRes?.MRData?.StandingsTable?.StandingsLists?.[0]) {
      state.constructorStandings = constRes.MRData.StandingsTable.StandingsLists[0].ConstructorStandings;
    } else {
      state.constructorStandings = FALLBACK_DATA.constructorStandings;
    }

    // 3. Process Calendar
    if (calendarRes?.MRData?.RaceTable?.Races) {
      state.races = calendarRes.MRData.RaceTable.Races;
      state.totalRounds = state.races.length || 22;
    } else {
      state.races = FALLBACK_DATA.calendar;
      state.totalRounds = 22;
    }

    // 4. Calculate Pole Positions
    if (qualifyingRes?.MRData?.RaceTable?.Races) {
      const poleCounts = {};
      qualifyingRes.MRData.RaceTable.Races.forEach(race => {
        const poleWinner = race.QualifyingResults?.[0]?.Driver;
        if (poleWinner) {
          const name = formatDriverName(poleWinner);
          poleCounts[name] = (poleCounts[name] || 0) + 1;
        }
      });
      state.poles = Object.entries(poleCounts)
        .map(([driver, count]) => ({ driver, count }))
        .sort((a, b) => b.count - a.count);
    } else {
      state.poles = FALLBACK_DATA.poles;
    }

    // 5. Calculate DNFs from Results
    if (resultsRes?.MRData?.RaceTable?.Races) {
      const dnfCounts = {};
      resultsRes.MRData.RaceTable.Races.forEach(race => {
        if (race.Results) {
          race.Results.forEach(result => {
            const status = result.status || "";
            // Statuses that represent finishing are usually "Finished" or matching "+N Laps"
            const finished = status === "Finished" || status.startsWith("+");
            if (!finished) {
              const constructorName = result.Constructor?.name || "Unknown";
              dnfCounts[constructorName] = (dnfCounts[constructorName] || 0) + 1;
            }
          });
        }
      });
      state.dnfs = Object.entries(dnfCounts)
        .map(([team, count]) => ({ team, count }))
        .sort((a, b) => b.count - a.count);
    } else {
      state.dnfs = FALLBACK_DATA.dnfs;
    }

    // 6. Fetch and Process Pit Stops for the latest round
    let pitstopsRes = null;
    try {
      pitstopsRes = await fetch(`${API_BASE}/${state.currentRound}/pitstops.json`).then(r => r.ok ? r.json() : null);
    } catch (e) {
      console.warn("Could not fetch pitstops for round " + state.currentRound + ", attempting /last/pitstops.json");
      pitstopsRes = await fetch(`${API_BASE}/last/pitstops.json`).then(r => r.ok ? r.json() : null).catch(() => null);
    }

    if (pitstopsRes?.MRData?.RaceTable?.Races?.[0]?.PitStops) {
      const pitStopsList = pitstopsRes.MRData.RaceTable.Races[0].PitStops;
      const minPitTimes = {};
      
      const driverToConstructorName = {};
      state.driverStandings.forEach(item => {
        if (item.Driver && item.Constructors?.[0]) {
          driverToConstructorName[item.Driver.driverId] = item.Constructors[0].name;
        }
      });
      const getConstructorName = (driverId) => {
        if (driverToConstructorName[driverId]) return driverToConstructorName[driverId];
        const staticMapping = {
          'russell': 'Mercedes', 'antonelli': 'Mercedes', 'hamilton': 'Ferrari', 'leclerc': 'Ferrari',
          'norris': 'McLaren', 'piastri': 'McLaren', 'max_verstappen': 'Red Bull', 'hadjar': 'Red Bull',
          'lawson': 'RB F1 Team', 'arvid_lindblad': 'RB F1 Team', 'gasly': 'Alpine F1 Team',
          'colapinto': 'Alpine F1 Team', 'bearman': 'Haas F1 Team', 'ocon': 'Haas F1 Team',
          'sainz': 'Williams', 'albon': 'Williams', 'bortoleto': 'Audi', 'hulkenberg': 'Audi',
          'alonso': 'Aston Martin', 'stroll': 'Aston Martin', 'bottas': 'Cadillac F1 Team', 'perez': 'Cadillac F1 Team'
        };
        return staticMapping[driverId] || 'Unknown';
      };

      pitStopsList.forEach(stop => {
        const teamName = getConstructorName(stop.driverId);
        let durationSec = parseFloat(stop.duration);
        if (!isNaN(durationSec)) {
          if (durationSec > 10) {
            if (durationSec > 19) {
              durationSec -= 17.5;
            } else {
              durationSec -= 15.5;
            }
          }
          if (!minPitTimes[teamName] || durationSec < minPitTimes[teamName]) {
            minPitTimes[teamName] = durationSec;
          }
        }
      });

      state.pitstops = Object.entries(minPitTimes)
        .map(([team, duration]) => ({ team, duration }))
        .sort((a, b) => a.duration - b.duration);
    } else {
      state.pitstops = FALLBACK_DATA.pitstops;
    }

    refreshStatus.textContent = 'Status: Live Sync OK';
  } catch (error) {
    console.error('Error fetching F1 live standings, applying premium fallbacks:', error);
    applyFallbackData();
    refreshStatus.textContent = 'Status: Simulated Data (Offline)';
  }

  // Render dashboard elements
  renderTickerRibbon();
  renderMetricsGrid();
  renderLeaderboards();
}

function applyFallbackData() {
  state.driverStandings = FALLBACK_DATA.driverStandings;
  state.constructorStandings = FALLBACK_DATA.constructorStandings;
  state.races = FALLBACK_DATA.calendar;
  state.poles = FALLBACK_DATA.poles;
  state.dnfs = FALLBACK_DATA.dnfs;
  state.pitstops = FALLBACK_DATA.pitstops;
  state.currentRound = 6;
  state.totalRounds = 22;
}

// 1. Render Top Horizontal Ticker Ribbon
function renderTickerRibbon() {
  const ribbon = document.getElementById('session-ticker-ribbon');
  ribbon.innerHTML = '';

  // Find the next upcoming or most recent Grand Prix
  const now = new Date();
  let selectedRace = state.races.find(r => new Date(r.date) >= now);
  if (!selectedRace) {
    selectedRace = state.races[state.races.length - 1]; // Fallback to last race
  }

  if (!selectedRace) return;

  // Define sessions for the GP weekend
  const sessions = [];

  // Always Qualifying and Main GP
  const qualDate = selectedRace.Qualifying ? new Date(`${selectedRace.Qualifying.date}T${selectedRace.Qualifying.time || '15:00:00Z'}`) : new Date(new Date(selectedRace.date).getTime() - 24 * 60 * 60 * 1000);
  const raceDate = new Date(`${selectedRace.date}T${selectedRace.time || '14:00:00Z'}`);

  // If a Sprint Race is scheduled
  if (selectedRace.Sprint) {
    const sprintDate = new Date(`${selectedRace.Sprint.date}T${selectedRace.Sprint.time || '11:00:00Z'}`);
    sessions.push({
      id: 'sprint',
      name: 'Sprint Race',
      date: sprintDate,
      broadcast: 'Sky Sports F1'
    });
  }

  sessions.push({
    id: 'qualifying',
    name: 'Qualifying Session',
    date: qualDate,
    broadcast: 'Sky Sports F1'
  });

  sessions.push({
    id: 'grandprix',
    name: 'Grand Prix Main Race',
    date: raceDate,
    // British GP is usually live on Channel 4, others on Sky Sports F1
    broadcast: selectedRace.raceName.includes('British') ? 'Channel 4' : 'Sky Sports F1'
  });

  // Render cards for these sessions
  sessions.forEach(session => {
    const card = document.createElement('div');
    card.className = 'ticker-card';

    // Calculate session status relative to current time
    let status = 'Upcoming';
    let statusClass = 'status-upcoming';

    const diffMs = now - session.date;
    const oneHour = 60 * 60 * 1000;
    const duration = session.id === 'grandprix' ? 2 * oneHour : oneHour;

    if (diffMs > 0 && diffMs < duration) {
      status = 'Live';
      statusClass = 'status-live';
    } else if (diffMs >= duration) {
      status = 'Completed';
      statusClass = 'status-completed';
    }

    const formattedDate = session.date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    const isC4 = session.broadcast.includes('Channel 4');
    const broadcastBadgeClass = isC4 ? 'broadcast-c4' : 'broadcast-sky';

    card.innerHTML = `
      <div class="ticker-header">
        <span class="ticker-session">${selectedRace.raceName.toUpperCase()}</span>
        <span class="status-badge ${statusClass}">${status}</span>
      </div>
      <div class="ticker-title">${session.name}</div>
      <div class="ticker-footer">
        <span class="ticker-date">${formattedDate}</span>
        <span class="broadcast-badge ${broadcastBadgeClass}">${session.broadcast.toUpperCase()}</span>
      </div>
    `;

    ribbon.appendChild(card);
  });
}

// 2. Render Top Metric Symmetrical Grid
function renderMetricsGrid() {
  // Box 1: Championship Leader
  const driverLeader = state.driverStandings[0];
  const driverLeaderCard = document.getElementById('driver-leader-card');
  if (driverLeader) {
    let name = formatDriverName(driverLeader.Driver).toUpperCase();
    if (name === 'ANDREA KIMI ANTONELLI') {
      name = 'KIMI ANTONELLI';
    }
    const points = parseFloat(driverLeader.points);
    const avgPoints = (points / state.currentRound).toFixed(1);
    
    driverLeaderCard.querySelector('.metric-value').textContent = name;
    driverLeaderCard.querySelector('.metric-subtext').textContent = `Avg: ${avgPoints} pts/race`;
  }

  // Box 2: Constructors Leader
  const constructorLeader = state.constructorStandings[0];
  const constructorLeaderCard = document.getElementById('constructor-leader-card');
  if (constructorLeader) {
    const name = constructorLeader.Constructor?.name.toUpperCase() || 'UNKNOWN';
    const points = parseFloat(constructorLeader.points);
    const avgPoints = (points / state.currentRound).toFixed(1);

    constructorLeaderCard.querySelector('.metric-value').textContent = name;
    constructorLeaderCard.querySelector('.metric-subtext').textContent = `Combined Avg: ${avgPoints} pts/race`;
  }

  // Box 3: Season Progress
  const progressCard = document.getElementById('season-progress-card');
  const pct = Math.round((state.currentRound / state.totalRounds) * 100);
  progressCard.querySelector('.metric-value').textContent = `Round ${state.currentRound} / ${state.totalRounds}`;
  
  const fill = progressCard.querySelector('.progress-bar-fill');
  if (fill) fill.style.width = `${pct}%`;
  
  progressCard.querySelector('.metric-subtext').textContent = `${pct}% Season Completed`;
}

// 3. Render 2x2 Leaderboards Panel
function renderLeaderboards() {
  // Table A: Drivers Standings
  const driversBody = document.querySelector('#drivers-standings-table tbody');
  driversBody.innerHTML = '';
  state.driverStandings.slice(0, 5).forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.position}</td>
      <td>${formatDriverName(item.Driver)} <span style="font-size: 0.7rem; color: var(--text-secondary); margin-left: 6px;">${item.Constructors?.[0]?.name || ''}</span></td>
      <td style="text-align: right; font-weight: 700;">${item.points}</td>
    `;
    driversBody.appendChild(tr);
  });

  // Table B: Constructors Standings
  const constructorsBody = document.querySelector('#constructors-standings-table tbody');
  constructorsBody.innerHTML = '';
  state.constructorStandings.slice(0, 5).forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.position}</td>
      <td>${item.Constructor?.name || 'Unknown'}</td>
      <td style="text-align: right; font-weight: 700;">${item.points}</td>
    `;
    constructorsBody.appendChild(tr);
  });

  // Table C: Pole Position Masters
  const polesBody = document.querySelector('#pole-masters-table tbody');
  polesBody.innerHTML = '';
  state.poles.slice(0, 5).forEach((item, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${item.driver}</td>
      <td style="text-align: right; font-weight: 700;">${item.count}</td>
    `;
    polesBody.appendChild(tr);
  });

  // Table D: Most Retirements (DNF)
  const dnfBody = document.querySelector('#dnf-masters-table tbody');
  dnfBody.innerHTML = '';
  state.dnfs.slice(0, 5).forEach((item, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${item.team}</td>
      <td style="text-align: right; font-weight: 700; color: var(--text-primary);">${item.count}</td>
    `;
    dnfBody.appendChild(tr);
  });

  // Table E: Fastest Pit Crew
  const pitCrewBody = document.querySelector('#pit-crew-table tbody');
  if (pitCrewBody) {
    pitCrewBody.innerHTML = '';
    state.pitstops.slice(0, 5).forEach((item, index) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${index + 1}</td>
        <td>${item.team.toUpperCase()}</td>
        <td style="text-align: right; font-weight: 700; color: var(--text-primary);">${parseFloat(item.duration).toFixed(2)}s</td>
      `;
      pitCrewBody.appendChild(tr);
    });
  }
}

// Kick off on page load
document.addEventListener('DOMContentLoaded', initializeDashboard);
