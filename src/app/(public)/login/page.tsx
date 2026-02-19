"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const LoginScene = dynamic(() => import("@/components/3d/LoginScene").then((m) => ({ default: m.LoginScene })), { ssr: false });

export default function LoginPage() {
  const { login, loginPending } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ username: email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      {/* 3D Particle background */}
      <div className="hidden md:block"><LoginScene /></div>
      <div className="md:hidden absolute inset-0 bg-gradient-to-br from-indigo-950/50 via-background to-violet-950/30" />
      <div className="md:hidden absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      <div className="md:hidden absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />

      <Card className="relative z-10 w-full max-w-md mx-4 glass border-white/10">
        <CardHeader className="text-center space-y-2 pb-2">
          <h1 className="text-3xl font-bold gradient-text">A2T Expertise</h1>
          <p className="text-muted-foreground text-sm">
            Connectez-vous a votre espace
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="vous@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="bg-white/5 border-white/10 focus:border-indigo-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="bg-white/5 border-white/10 focus:border-indigo-500"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white"
              disabled={loginPending}
            >
              {loginPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Se connecter
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Pas encore de compte ?{" "}
            <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-medium">
              Creer un compte
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
