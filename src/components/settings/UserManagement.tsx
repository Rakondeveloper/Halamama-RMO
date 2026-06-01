import { useState, useMemo } from "react";
import { Search, Plus, Pencil, Trash2, Users, Info } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface User {
  id: string;
  name: string;
  role: "Admin" | "Packer" | "Picker" | "Driver" | "Coordinator";
}

const MOCK_USERS: User[] = [
  { id: "1", name: "mhd_khan", role: "Packer" },
  { id: "2", name: "ansil", role: "Admin" },
  { id: "3", name: "jishu", role: "Admin" },
  { id: "4", name: "aravind", role: "Admin" },
  { id: "5", name: "faisal", role: "Driver" },
  { id: "6", name: "ravi_kumar", role: "Picker" },
  { id: "7", name: "omar", role: "Coordinator" },
];

const ROLE_COLORS: Record<string, string> = {
  Admin: "text-primary",
  Packer: "text-info",
  Picker: "text-warning",
  Driver: "text-success",
  Coordinator: "text-destructive",
};

export function UserManagement() {
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [search, setSearch] = useState("");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "Coordinator" as User["role"] });

  const filtered = useMemo(
    () =>
      users.filter(
        (u) =>
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.role.toLowerCase().includes(search.toLowerCase()),
      ),
    [search, users],
  );

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({ name: "", email: "", password: "", role: "Coordinator" });
    setIsAddUserOpen(true);
  };

  const handleOpenEdit = (u: User) => {
    setEditingUser(u);
    setFormData({ name: u.name, email: "", password: "", role: u.role });
    setIsAddUserOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  const handleSaveUser = () => {
    if (!formData.name.trim() || !formData.role) return;

    if (editingUser) {
      setUsers(users.map(u => u.id === editingUser.id ? { ...u, name: formData.name, role: formData.role } : u));
    } else {
      setUsers([...users, { id: Math.random().toString(), name: formData.name, role: formData.role }]);
    }
    setIsAddUserOpen(false);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">User Management</h2>
          <p className="text-sm text-muted-foreground">
            Manage admin, coordinator, outlet and driver users
          </p>
        </div>
        <button
          id="add-user-btn"
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-xl bg-gradient-primary text-white text-sm font-semibold shadow-glow hover:opacity-90 transition-opacity shrink-0"
        >
          <Plus className="h-4 w-4" />
          Add User
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          id="user-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users…"
          className="w-full h-10 pl-10 pr-4 rounded-xl bg-muted/60 border border-transparent text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 focus:bg-background transition-colors"
        />
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-5 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                  Name
                </th>
                <th className="text-left px-5 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                  Role
                </th>
                <th className="text-right px-5 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-5 py-12 text-center text-muted-foreground">
                    No users found.
                  </td>
                </tr>
              )}
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3.5 font-medium">{u.name}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 ${ROLE_COLORS[u.role] ?? "text-foreground"}`}>
                      <Users className="h-3.5 w-3.5" />
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button onClick={() => handleOpenEdit(u)} className="h-8 w-8 rounded-lg border border-border bg-card hover:bg-muted grid place-items-center transition-colors" title="Edit">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => handleDelete(u.id, u.name)} className="h-8 w-8 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 grid place-items-center transition-colors" title="Delete">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-background border-border shadow-lg">
          <div className="p-6 pb-4">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-foreground">
                {editingUser ? "Edit User" : "Add New User"}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-1.5">
                {editingUser ? "Update user account permissions and details." : "Create a new user account with appropriate permissions."}
              </DialogDescription>
            </DialogHeader>
          </div>
          
          <div className="px-6 py-4 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium text-foreground">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input 
                id="fullName" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="John Doe" 
                className="h-11 rounded-lg border-border bg-background shadow-sm focus-visible:ring-primary/20"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email Address <span className="text-destructive">*</span>
                </Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="john@example.com" 
                  className="h-11 rounded-lg border-border bg-background shadow-sm focus-visible:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-foreground">
                  Password <span className="text-destructive">*</span>
                </Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder={editingUser ? "(leave blank to keep)" : "••••••••••••"} 
                  className="h-11 rounded-lg border-border bg-background shadow-sm focus-visible:ring-primary/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="role" className="text-sm font-medium text-foreground">
                  Role <span className="text-destructive">*</span>
                </Label>
                <Info className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <Select value={formData.role} onValueChange={(val: User["role"]) => setFormData({...formData, role: val})}>
                <SelectTrigger id="role" className="h-11 rounded-lg border-border bg-background shadow-sm focus:ring-primary/20">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent className="rounded-lg border-border shadow-md">
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Coordinator">Coordinator</SelectItem>
                  <SelectItem value="Packer">Packer</SelectItem>
                  <SelectItem value="Picker">Picker</SelectItem>
                  <SelectItem value="Driver">Driver</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="p-6 pt-4 flex items-center justify-end gap-3 bg-muted/20 border-t border-border">
            <Button 
              variant="outline" 
              onClick={() => setIsAddUserOpen(false)}
              className="h-10 px-6 rounded-lg text-sm font-medium border-border hover:bg-muted"
            >
              Cancel
            </Button>
            <Button 
              className="h-10 px-6 rounded-lg bg-gradient-primary text-white text-sm font-semibold border-transparent shadow-glow hover:opacity-90 transition-opacity"
              onClick={handleSaveUser}
            >
              {editingUser ? "Save Changes" : "Add User"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
