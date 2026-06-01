import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { Eye, EyeOff, Lock, Mail, ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";

const HALAMAMA_LOGO_URL = "https://halamama.com/cdn/shop/files/halamama_green.svg";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: "/" });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
    emailRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const ok = await login(email, password);
    if (ok) {
      navigate({ to: "/" });
    } else {
      setError("Invalid email or password. Please try again.");
      setLoading(false);
    }
  };

  if (isAuthenticated) return null;

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-background">
      {/* Animated background elements */}
      <div className="pointer-events-none absolute inset-0">
        {/* Gradient orbs */}
        <div
          className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full opacity-[0.07] blur-3xl"
          style={{ background: "var(--gradient-primary)" }}
        />
        <div
          className="absolute -bottom-60 -right-40 h-[500px] w-[500px] rounded-full opacity-[0.05] blur-3xl"
          style={{ background: "var(--gradient-info)" }}
        />
        <div
          className="absolute top-1/4 right-1/4 h-[300px] w-[300px] rounded-full opacity-[0.04] blur-3xl"
          style={{ background: "var(--gradient-success)" }}
        />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Login card */}
      <div
        className={`relative z-10 w-full max-w-[440px] px-4 transition-all duration-700 ease-out ${
          mounted ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
        }`}
      >
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-elevated">
          {/* Gradient strip at top */}
          <div className="h-1 w-full bg-gradient-primary" />

          <div className="p-8 sm:p-10">
            {/* Logo & Header */}
            <div className="mb-8 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-soft ring-1 ring-border">
                <img src={HALAMAMA_LOGO_URL} alt="Halamama" className="h-11 w-11 object-contain" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Welcome back
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Sign in to the Halamama Operations Dashboard
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error message */}
              {error && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm font-medium text-destructive animate-in fade-in slide-in-from-top-1 duration-300">
                  {error}
                </div>
              )}

              {/* Email field */}
              <div className="space-y-2">
                <label
                  htmlFor="login-email"
                  className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Email
                </label>
                <div className="group relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                  <input
                    ref={emailRef}
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@halamama.com"
                    className="h-12 w-full rounded-xl border border-border bg-muted/40 pl-11 pr-4 text-sm font-medium text-foreground placeholder:text-muted-foreground/60 transition-all focus:border-primary/50 focus:bg-card focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="login-password"
                    className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    tabIndex={-1}
                    className="text-xs font-medium text-primary/80 hover:text-primary transition-colors"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="group relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-12 w-full rounded-xl border border-border bg-muted/40 pl-11 pr-12 text-sm font-medium text-foreground placeholder:text-muted-foreground/60 transition-all focus:border-primary/50 focus:bg-card focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="group relative flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary font-semibold text-white shadow-glow transition-all hover:shadow-[0_0_32px_rgb(133_175_174_/_0.38)] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </form>

            {/* Hint for demo */}
            <div className="mt-6 rounded-xl border border-border/50 bg-muted/30 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Demo credentials
              </p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Email</span>
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] font-medium text-foreground">
                  admin@halamama.com
                </code>
              </div>
              <div className="mt-1 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Password</span>
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] font-medium text-foreground">
                  admin123
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* Footer text */}
        <p className="mt-6 text-center text-xs text-muted-foreground/70">
          © 2026 Halamama LMD · RouteMyOrder
        </p>
      </div>
    </div>
  );
}
