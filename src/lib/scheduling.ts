/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  Scheduling Store — Locations, Teams, and Appointments                        ║
 * ║                                                                              ║
 * ║  Manages the Customer Care scheduling workflow for MWH and VL_SUPPLIER        ║
 * ║  items that require installation. Data is persisted to localStorage and       ║
 * ║  synchronised across tabs.                                                    ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface InstallLocation {
  id: string;
  name: string;
  city: string;
  createdAt: string;
}

export interface InstallTeam {
  id: string;
  name: string;
  locationId: string;
  /** Which type of items this team handles */
  type: "MWH" | "VL_SUPPLIER";
  memberNames: string[];
  createdAt: string;
}

export interface Appointment {
  id: string;
  teamId: string;
  locationId: string;
  orderId: string;
  /** The IDs of the specific order items this appointment covers */
  itemIds: string[];
  customerName: string;
  customerPhone: string;
  /** YYYY-MM-DD */
  scheduledDate: string;
  /** HH:MM (24h) */
  scheduledTime: string;
  status: "Scheduled" | "Confirmed" | "Completed" | "Cancelled";
  notes: string;
  /** Email of Customer Care agent who created this appointment */
  createdBy: string;
  createdAt: string;
}

// ─── Storage Keys ─────────────────────────────────────────────────────────────

const LOCATIONS_KEY = "hm_install_locations";
const TEAMS_KEY = "hm_install_teams";
const APPOINTMENTS_KEY = "hm_appointments_v3";
const SYNC_KEY = "hm_scheduling_sync";

// ─── Seed Data ────────────────────────────────────────────────────────────────

const DEFAULT_LOCATIONS: InstallLocation[] = [
  { id: "loc-1", name: "Doha Central", city: "Doha", createdAt: "2026-01-10" },
  { id: "loc-2", name: "Al Wakrah Hub", city: "Al Wakrah", createdAt: "2026-01-12" },
  { id: "loc-3", name: "Al Khor Zone", city: "Al Khor", createdAt: "2026-02-01" },
];

const DEFAULT_TEAMS: InstallTeam[] = [
  {
    id: "team-1",
    name: "Team Alpha",
    locationId: "loc-1",
    type: "MWH",
    memberNames: ["Farshad", "Naveed", "Shambu"],
    createdAt: "2026-01-10",
  },
  {
    id: "team-2",
    name: "Team Beta",
    locationId: "loc-1",
    type: "VL_SUPPLIER",
    memberNames: ["Irshad", "Waseem"],
    createdAt: "2026-01-10",
  },
  {
    id: "team-3",
    name: "Team Gamma",
    locationId: "loc-2",
    type: "MWH",
    memberNames: ["Minhal", "Rizwan"],
    createdAt: "2026-01-12",
  },
  {
    id: "team-4",
    name: "Team Delta",
    locationId: "loc-2",
    type: "VL_SUPPLIER",
    memberNames: ["Omar", "Saifu"],
    createdAt: "2026-01-12",
  },
  {
    id: "team-5",
    name: "Team Epsilon",
    locationId: "loc-3",
    type: "MWH",
    memberNames: ["Chand", "Nassim"],
    createdAt: "2026-02-01",
  },
];

// Build some realistic demo appointments relative to today
function buildDefaultAppointments(): Appointment[] {
  const today = new Date();
  const fmt = (offset: number): string => {
    const d = new Date(today);
    d.setDate(d.getDate() + offset);
    return d.toISOString().split("T")[0];
  };

  return [
    {
      id: "appt-2",
      teamId: "team-2",
      locationId: "loc-1",
      orderId: "HM68258",
      itemIds: [],
      customerName: "Mouza Al Derham",
      customerPhone: "55003344",
      scheduledDate: fmt(2),
      scheduledTime: "14:00",
      status: "Confirmed",
      notes: "Supplier will deliver directly to customer.",
      createdBy: "cc@halamama.com",
      createdAt: new Date().toISOString(),
    },
    {
      id: "appt-3",
      teamId: "team-3",
      locationId: "loc-2",
      orderId: "HM68268",
      itemIds: [],
      customerName: "Aisha Al Naemi",
      customerPhone: "55005566",
      scheduledDate: fmt(3),
      scheduledTime: "11:30",
      status: "Scheduled",
      notes: "",
      createdBy: "cc@halamama.com",
      createdAt: new Date().toISOString(),
    },
    {
      id: "appt-4",
      teamId: "team-1",
      locationId: "loc-1",
      orderId: "HM64839",
      itemIds: [],
      customerName: "test test",
      customerPhone: "55007788",
      scheduledDate: fmt(-1),
      scheduledTime: "10:00",
      status: "Completed",
      notes: "Installed successfully.",
      createdBy: "cc@halamama.com",
      createdAt: new Date().toISOString(),
    },
  ];
}

// ─── Seed Helpers ─────────────────────────────────────────────────────────────

function seedLocations(): InstallLocation[] {
  try {
    const raw = localStorage.getItem(LOCATIONS_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  localStorage.setItem(LOCATIONS_KEY, JSON.stringify(DEFAULT_LOCATIONS));
  return DEFAULT_LOCATIONS;
}

function seedTeams(): InstallTeam[] {
  try {
    const raw = localStorage.getItem(TEAMS_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  localStorage.setItem(TEAMS_KEY, JSON.stringify(DEFAULT_TEAMS));
  return DEFAULT_TEAMS;
}

function seedAppointments(): Appointment[] {
  try {
    const raw = localStorage.getItem(APPOINTMENTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  const defaults = buildDefaultAppointments();
  localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(defaults));
  return defaults;
}

// ─── Broadcast ────────────────────────────────────────────────────────────────

function broadcast(): void {
  localStorage.setItem(SYNC_KEY, Date.now().toString());
}

// ─── Locations CRUD ──────────────────────────────────────────────────────────

export function getLocations(): InstallLocation[] {
  return seedLocations();
}

export function addLocation(loc: Omit<InstallLocation, "id" | "createdAt">): InstallLocation {
  const locations = getLocations();
  const newLoc: InstallLocation = {
    ...loc,
    id: `loc-${Date.now()}`,
    createdAt: new Date().toISOString().split("T")[0],
  };
  locations.push(newLoc);
  localStorage.setItem(LOCATIONS_KEY, JSON.stringify(locations));
  broadcast();
  return newLoc;
}

export function updateLocation(id: string, updates: Partial<Omit<InstallLocation, "id">>): void {
  const locations = getLocations().map((l) => (l.id === id ? { ...l, ...updates } : l));
  localStorage.setItem(LOCATIONS_KEY, JSON.stringify(locations));
  broadcast();
}

export function deleteLocation(id: string): void {
  // Also delete all teams under this location
  const teams = getTeams().filter((t) => t.locationId !== id);
  localStorage.setItem(TEAMS_KEY, JSON.stringify(teams));
  // Delete appointments for teams in this location
  const teamIds = new Set(DEFAULT_TEAMS.filter((t) => t.locationId === id).map((t) => t.id));
  const appts = getAppointments().filter((a) => !teamIds.has(a.teamId));
  localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appts));

  const locations = getLocations().filter((l) => l.id !== id);
  localStorage.setItem(LOCATIONS_KEY, JSON.stringify(locations));
  broadcast();
}

// ─── Teams CRUD ───────────────────────────────────────────────────────────────

export function getTeams(): InstallTeam[] {
  return seedTeams();
}

export function getTeamsByLocation(locationId: string): InstallTeam[] {
  return getTeams().filter((t) => t.locationId === locationId);
}

export function addTeam(team: Omit<InstallTeam, "id" | "createdAt">): InstallTeam {
  const teams = getTeams();
  const newTeam: InstallTeam = {
    ...team,
    id: `team-${Date.now()}`,
    createdAt: new Date().toISOString().split("T")[0],
  };
  teams.push(newTeam);
  localStorage.setItem(TEAMS_KEY, JSON.stringify(teams));
  broadcast();
  return newTeam;
}

export function updateTeam(id: string, updates: Partial<Omit<InstallTeam, "id">>): void {
  const teams = getTeams().map((t) => (t.id === id ? { ...t, ...updates } : t));
  localStorage.setItem(TEAMS_KEY, JSON.stringify(teams));
  broadcast();
}

export function deleteTeam(id: string): void {
  const teams = getTeams().filter((t) => t.id !== id);
  localStorage.setItem(TEAMS_KEY, JSON.stringify(teams));
  broadcast();
}

// ─── Appointments CRUD ────────────────────────────────────────────────────────

export function getAppointments(): Appointment[] {
  return seedAppointments();
}

export function getAppointmentsByTeam(teamId: string): Appointment[] {
  return getAppointments().filter((a) => a.teamId === teamId);
}

export function getAppointmentsByOrder(orderId: string): Appointment {
  return getAppointments().find((a) => a.orderId === orderId) as Appointment;
}

export function addAppointment(appt: Omit<Appointment, "id" | "createdAt">): Appointment {
  const appts = getAppointments();
  const newAppt: Appointment = {
    ...appt,
    id: `appt-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  appts.push(newAppt);
  localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appts));
  broadcast();
  return newAppt;
}

export function updateAppointment(id: string, updates: Partial<Omit<Appointment, "id">>): void {
  const appts = getAppointments().map((a) => (a.id === id ? { ...a, ...updates } : a));
  localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appts));
  broadcast();
}

export function deleteAppointment(id: string): void {
  const appts = getAppointments().filter((a) => a.id !== id);
  localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appts));
  broadcast();
}

/** Get all appointments for a given week (Mon–Sun) */
export function getAppointmentsForWeek(teamId: string, weekStartDate: string): Appointment[] {
  const start = new Date(weekStartDate);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const endStr = end.toISOString().split("T")[0];
  return getAppointments().filter(
    (a) => a.teamId === teamId && a.scheduledDate >= weekStartDate && a.scheduledDate <= endStr,
  );
}

/** Check if an order already has a scheduled appointment */
export function hasAppointment(orderId: string): boolean {
  return getAppointments().some(
    (a) => a.orderId === orderId && a.status !== "Cancelled",
  );
}
