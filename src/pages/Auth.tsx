
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";

const Auth = () => {
  const nav = useNavigate();
  const { user, loading } = useSupabaseAuth();
  const [type, setType] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!loading && user) {
    nav("/");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (type === "register") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });
        if (error) throw error;
        toast.success("Registration successful! Please check your email to confirm.");
        setType("login");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Login successful!");
        nav("/");
      }
    } catch (err: any) {
      toast.error(err.message ?? "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-card p-8 rounded-md shadow-md max-w-md w-full space-y-6">
        <h2 className="text-2xl font-bold mb-2 text-center">{type === "login" ? "Login" : "Register"}</h2>
        {type === "register" && (
          <Input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        )}
        <Input
          type="email"
          placeholder="Email"
          value={email}
          autoComplete="email"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          autoComplete={type === "login" ? "current-password" : "new-password"}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button className="w-full" disabled={isLoading} type="submit">
          {isLoading ? "Please wait..." : (type === "login" ? "Login" : "Register")}
        </Button>
        <div className="flex justify-between text-xs text-muted-foreground">
          <button
            type="button"
            className="underline"
            onClick={() => setType(type === "login" ? "register" : "login")}
          >
            {type === "login" ? "Don't have an account? Register" : "Already registered? Login"}
          </button>
          <button
            type="button"
            className="underline"
            onClick={() => nav("/")}
          >
            Go Home
          </button>
        </div>
      </form>
    </div>
  );
};

export default Auth;
