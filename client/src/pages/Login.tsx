
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogIn, Mail, Lock } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-blue-50">
      {/* Decorative background elements */}
      <div className="fixed top-20 right-20 w-64 h-64 bg-blue-100 rounded-full opacity-30 blur-3xl"></div>
      <div className="fixed bottom-20 left-20 w-80 h-80 bg-purple-100 rounded-full opacity-20 blur-3xl"></div>
      
      <div className="w-full max-w-md p-8 space-y-8 bg-white/50 backdrop-blur-lg rounded-xl shadow-lg border border-white/20">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="mt-2 text-muted-foreground">Sign in to your account</p>
        </div>
        
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
            
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>
          
          <div>
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in"}
              {!isLoading && <LogIn className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </form>
        
        <div className="text-center mt-4">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </p>
          <p className="text-xs text-muted-foreground mt-4">
            Demo credentials: demo@example.com / password
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
