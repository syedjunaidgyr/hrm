"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, Lock, Mail, ArrowRight, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Toast } from "@/components/ui/Toast";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [nextPath, setNextPath] = useState<string | null>(null);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setNextPath(params.get("next"));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, next: nextPath }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.error?.message || "Invalid credentials provided.");
        setIsLoading(false);
        return;
      }

      router.push(data.data.redirectTo);
      router.refresh();
    } catch (err: any) {
      setErrorMsg("Network error occurred during login.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F3ED] text-[#1A1A1A] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background ambient light */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FDD868]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        {/* Outlined Pill Logo */}
        <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-slate-300/80 bg-white shadow-2xs mb-6">
          <div className="w-8 h-8 rounded-full bg-[#1E1E1E] text-white flex items-center justify-center text-xs font-black shadow-2xs">
            <Briefcase className="w-4 h-4" />
          </div>
          <span className="text-base font-black tracking-tight text-slate-900">Rightfit</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Welcome Back
        </h2>
        <p className="mt-1.5 text-xs text-slate-500 font-semibold">
          Client & Candidate Recruitment Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-[#FAF9F5] py-8 px-6 sm:px-10 shadow-xl rounded-[36px] border border-slate-300/60 space-y-6">
          {errorMsg && (
            <div>
              <Toast type="error" title="Authentication Error" message={errorMsg} onClose={() => setErrorMsg("")} />
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Email Address"
              type="email"
              required
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
            />

            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />

            <Button
              type="submit"
              className="w-full font-black py-3 rounded-full bg-[#1E1E1E] hover:bg-slate-800 text-white shadow-md transition-all mt-2"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In to Portal
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
