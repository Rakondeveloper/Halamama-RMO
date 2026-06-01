import { Activity } from "lucide-react";

const staff = [
  {
    role: "Pickers",
    online: 8,
    total: 10,
    avatarClass: "bg-info/15 text-info",
    members: [
      { name: "Omar K.", score: 96, tasks: 24, status: "active" },
      { name: "Sara A.", score: 92, tasks: 21, status: "active" },
      { name: "Layla M.", score: 88, tasks: 19, status: "active" },
    ],
  },
  {
    role: "Packers",
    online: 6,
    total: 8,
    avatarClass: "bg-warning/15 text-warning",
    members: [
      { name: "Yusuf R.", score: 94, tasks: 18, status: "active" },
      { name: "Noura T.", score: 91, tasks: 17, status: "active" },
      { name: "Hassan M.", score: 86, tasks: 14, status: "break" },
    ],
  },
  {
    role: "Drivers",
    online: 12,
    total: 15,
    avatarClass: "bg-success/15 text-success",
    members: [
      { name: "Karim S.", score: 98, tasks: 11, status: "active" },
      { name: "Bilal H.", score: 95, tasks: 10, status: "active" },
      { name: "Tareq F.", score: 82, tasks: 8, status: "active" },
    ],
  },
];

export function StaffMonitoring() {
  return (
    <section className="rounded-2xl bg-card border border-border shadow-soft overflow-hidden">
      <div className="px-5 py-4 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-primary/10 grid place-items-center">
            <Activity className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-tight">Live Staff Monitoring</h2>
            <p className="text-[11px] text-muted-foreground">
              Performance across all warehouse roles
            </p>
          </div>
        </div>
        <span className="flex items-center gap-1.5 text-[10px] font-semibold text-success">
          <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" /> 26 ONLINE
        </span>
      </div>

      <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
        {staff.map((group) => (
          <div key={group.role} className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-xs font-semibold">{group.role}</div>
                <div className="text-[11px] text-muted-foreground">
                  <span className="text-foreground font-bold">{group.online}</span> / {group.total}{" "}
                  online
                </div>
              </div>
              <div className="flex -space-x-1.5">
                {group.members.map((m) => (
                  <div
                    key={m.name}
                    className={`h-7 w-7 rounded-full ring-2 ring-card grid place-items-center text-[9px] font-bold ${group.avatarClass}`}
                  >
                    {m.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2.5">
              {group.members.map((m) => (
                <div key={m.name} className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium truncate">{m.name}</span>
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${m.status === "active" ? "bg-success" : "bg-warning"}`}
                      />
                    </div>
                    <div className="mt-1 h-1 rounded-full bg-border overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-primary"
                        style={{ width: `${m.score}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold tabular-nums">{m.score}</div>
                    <div className="text-[10px] text-muted-foreground tabular-nums">
                      {m.tasks} tasks
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
