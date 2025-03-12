
import DragDropZone from "@/components/DragDropZone";
import StorageStats from "@/components/StorageStats";
import FileGrid from "@/components/FileGrid";
import FileManager from "@/components/FileManager";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import { Button } from "@/components/ui/button";
import { Upload, Search, Bell, Cloud, Layers, Filter, Box, LogOut, User } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

const Index = () => {
  const [activeTab, setActiveTab] = useState<'files' | 'analytics'>('files');
  const { user, logout } = useAuth();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-blue-50">
      {/* Decorative background elements */}
      <div className="fixed top-20 right-20 w-64 h-64 bg-blue-100 rounded-full opacity-30 blur-3xl"></div>
      <div className="fixed bottom-20 left-20 w-80 h-80 bg-purple-100 rounded-full opacity-20 blur-3xl"></div>
      
      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3">
              <Cloud className="w-8 h-8 text-primary float-effect" />
              <h1 className="text-4xl font-bold">Storage Dashboard</h1>
            </div>
            <p className="text-muted-foreground mt-2 ml-11">
              Manage and organize your files efficiently
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search files..." 
                className="pl-9 pr-4 py-2 rounded-full bg-white/70 backdrop-blur-md border border-border focus:outline-none focus:ring-1 focus:ring-primary" 
              />
            </div>
            
            {/* User info and logout */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-white/70 backdrop-blur-md p-2 rounded-full">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium pr-2">{user?.name}</span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={logout}
                className="rounded-full hover:bg-red-100 hover:text-red-600"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-4 mb-8 border-b">
          <button
            className={`pb-2 px-1 font-medium text-lg relative ${
              activeTab === 'files' 
                ? 'text-primary' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('files')}
          >
            Files
            {activeTab === 'files' && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full"></div>
            )}
          </button>
          <button
            className={`pb-2 px-1 font-medium text-lg relative ${
              activeTab === 'analytics' 
                ? 'text-primary' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
            {activeTab === 'analytics' && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full"></div>
            )}
          </button>
        </div>

        {activeTab === 'files' ? (
          <FileManager files={[
            { id: "1", name: "Project Proposal", type: "pdf", size: "2.4 MB", modified: "2024-03-10" },
            { id: "2", name: "Images", type: "folder", size: "--", modified: "2024-03-08" },
            { id: "3", name: "Meeting Notes", type: "docx", size: "156 KB", modified: "2024-03-07" },
            { id: "4", name: "Budget 2024", type: "xlsx", size: "1.2 MB", modified: "2024-02-28" },
            { id: "5", name: "Presentations", type: "folder", size: "--", modified: "2024-02-25" },
            { id: "6", name: "logo", type: "png", size: "340 KB", modified: "2024-02-20" }
          ]} />
        ) : (
          <AnalyticsDashboard />
        )}
      </div>
    </div>
  );
};

export default Index;
