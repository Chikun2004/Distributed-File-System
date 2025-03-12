
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, Mail, Lock, User } from "lucide-react";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signup, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signup(name, email, password);
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-blue-50">
      {/* Decorative background elements */}
      <div className="fixed top-20 right-20 w-64 h-64 bg-blue-100 rounded-full opacity-30 blur-3xl"></div>
      <div className="fixed bottom-20 left-20 w-80 h-80 bg-purple-100 rounded-full opacity-20 blur-3xl"></div>
      
      <div className="w-full max-w-md p-8 space-y-8 bg-white/50 backdrop-blur-lg rounded-xl shadow-lg border border-white/20">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Create Account</h1>
          <p className="mt-2 text-muted-foreground">Sign up for a new account</p>
        </div>
        
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10"
                required
              />
            </div>
            
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
                minLength={6}
              />
            </div>
          </div>
          
          <div>
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Create account"}
              {!isLoading && <UserPlus className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </form>
        
        <div className="text-center mt-4">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
