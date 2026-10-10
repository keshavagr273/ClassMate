import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import {
  clearError,
  handleSignIn,
  handleSignUp,
} from "../../slices/authSlice";
import {
  Button,
  Card,
  Eyebrow,
  IconButton,
  Input,
  PageShell,
  cn,
} from "../../components/ui";

const tabs = [
  { id: "login", label: "Sign in" },
  { id: "signup", label: "Create account" },
];

const copy = {
  login: {
    heading: "Welcome back.",
    sub: "Sign in with your institute email to pick up where you left off.",
    action: "Sign in",
  },
  signup: {
    heading: "Make an account.",
    sub: "One account covers every tool on ClassMate. No separate logins.",
    action: "Create account",
  },
};

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const authError = useSelector((state) => state.auth.error);
  const loading = useSelector((state) => state.auth.loading);

  const [tab, setTab] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const toastIdRef = useRef(null);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch, tab]);

  useEffect(() => {
    if (isAuthenticated && !loading) {
      if (toastIdRef.current) toast.dismiss(toastIdRef.current);
      toastIdRef.current = toast.success("Welcome back!", {
        position: "top-right",
        duration: 1500,
      });
      const timer = setTimeout(() => navigate("/"), 1800);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    if (authError && !loading) {
      if (toastIdRef.current) toast.dismiss(toastIdRef.current);
      toastIdRef.current = toast.error(authError, {
        position: "top-right",
        duration: 5000,
      });
      const timer = setTimeout(() => dispatch(clearError()), 100);
      return () => clearTimeout(timer);
    }
  }, [authError, loading, dispatch]);

  /**
   * This form is uncontrolled: it reads values straight off
   * `e.target.elements`. The `name="email"` and `name="password"` attributes
   * below are therefore load-bearing, as is this staying a real <form>, since
   * signup calls e.target.reset(). Do not refactor those away.
   */
  const handleFormSubmit = async (e, type) => {
    e.preventDefault();

    try {
      dispatch(clearError());
      if (toastIdRef.current) toast.dismiss(toastIdRef.current);

      const email = e.target.elements.email?.value;
      const password = e.target.elements.password?.value;

      if (!email) {
        toast.error("Please enter your email.");
        return;
      }
      if (!password) {
        toast.error("Please enter your password.");
        return;
      }

      if (type === "login") {
        await dispatch(handleSignIn({ email, password })).unwrap();
      } else if (type === "signup") {
        await dispatch(handleSignUp({ email, password })).unwrap();
        toast.success("Account created. You can sign in now.");
        e.target.reset();
      }
    } catch {
      // Already surfaced via the authError effect above; this only stops the
      // unhandled rejection from propagating.
    }
  };

  const active = copy[tab];

  return (
    <PageShell width="wide" className="py-16 md:py-24">
      <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
        {/* Left: type. Asymmetric on purpose — a centred card on an empty
            canvas is the single most generic login layout there is. */}
        <div className="lg:col-span-5">
          <Eyebrow>ClassMate</Eyebrow>
          <h1 className="mt-5 text-h1 text-ink">{active.heading}</h1>
          <p className="mt-4 max-w-sm text-body text-ink-3">{active.sub}</p>

          <dl className="mt-10 hidden border-t border-line lg:block">
            {[
              ["Attendance", "Track the 75% line per subject"],
              ["Marketplace", "Buy and sell inside campus"],
              ["Rides", "Split fares to the station"],
            ].map(([term, desc]) => (
              <div
                key={term}
                className="flex gap-6 border-b border-line py-3.5"
              >
                <dt className="w-28 shrink-0 text-meta font-medium text-ink-2">
                  {term}
                </dt>
                <dd className="text-meta text-ink-4">{desc}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Right: the form */}
        <div className="lg:col-span-6 lg:col-start-7">
          <Card padding="lg" className="w-full">
            <div role="tablist" aria-label="Authentication" className="flex gap-1">
              {tabs.map((item) => (
                <button
                  key={item.id}
                  role="tab"
                  type="button"
                  aria-selected={tab === item.id}
                  onClick={() => setTab(item.id)}
                  className={cn(
                    "flex-1 rounded-chip px-4 py-2 text-ui font-medium transition-colors duration-150",
                    tab === item.id
                      ? "bg-surface-3 text-ink"
                      : "text-ink-3 hover:text-ink"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => handleFormSubmit(e, tab)}
              className="mt-7 flex flex-col gap-5"
              noValidate
            >
              <Input
                name="email"
                type="email"
                label="Institute email"
                autoComplete="email"
                placeholder="name.rollno@iiitsonepat.ac.in"
                hint={
                  tab === "signup"
                    ? "Use the format NAME.ROLLNO@iiitsonepat.ac.in"
                    : undefined
                }
              />

              <Input
                name="password"
                type={showPassword ? "text" : "password"}
                label="Password"
                autoComplete={
                  tab === "signup" ? "new-password" : "current-password"
                }
                placeholder="••••••••"
                trailingSlot={
                  <IconButton
                    icon={showPassword ? EyeOff : Eye}
                    label={showPassword ? "Hide password" : "Show password"}
                    size="sm"
                    onClick={() => setShowPassword((prev) => !prev)}
                  />
                }
              />

              <Button type="submit" loading={loading} fullWidth size="lg">
                {active.action}
              </Button>
            </form>

            <p className="mt-5 text-micro text-ink-4">
              By continuing you agree to use ClassMate in line with institute
              policy.
            </p>
          </Card>
        </div>
      </div>
    </PageShell>
  );
};

export default LoginPage;
