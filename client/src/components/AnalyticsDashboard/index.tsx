
import React from 'react';
import StorageStats from "../StorageStats";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Clock, Activity, Users } from "lucide-react";

interface MetricObject {
  name: string;
  value: number;
  unit: string;
}

interface AnalyticsDashboardProps {
  timeRange?: string;
  metrics?: Array<MetricObject>;
}

// Sample activity data
const activityData = [
  { name: 'Mon', uploads: 4, downloads: 2 },
  { name: 'Tue', uploads: 3, downloads: 4 },
  { name: 'Wed', uploads: 2, downloads: 6 },
  { name: 'Thu', uploads: 6, downloads: 3 },
  { name: 'Fri', uploads: 8, downloads: 5 },
  { name: 'Sat', uploads: 2, downloads: 1 },
  { name: 'Sun', uploads: 1, downloads: 2 },
];

const AnalyticsDashboard = ({
  timeRange = "This Week",
  metrics = [
    { name: "Storage Used", value: 45.5, unit: "GB" },
    { name: "Total Files", value: 2431, unit: "" },
    { name: "Active Users", value: 16, unit: "" }
  ]
}: AnalyticsDashboardProps) => {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Analytics Dashboard</h2>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full">
          <Clock className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">{timeRange}</span>
        </div>
      </div>

      {/* Storage Statistics */}
      <StorageStats />

      {/* Activity Timeline */}
      <Card className="p-6 glass card-3d">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Activity Timeline</h3>
            <p className="text-sm text-muted-foreground">File operations over time</p>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
          </div>
        </div>
        
        <div className="h-64 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activityData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                  borderRadius: '8px', 
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  border: 'none'
                }} 
              />
              <Bar dataKey="uploads" fill="hsl(var(--primary))" name="Uploads" radius={[4, 4, 0, 0]} />
              <Bar dataKey="downloads" fill="hsl(var(--accent))" name="Downloads" radius={[4, 4, 0, 0]} opacity={0.6} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* User Statistics */}
      <Card className="p-6 glass card-3d">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">User Activity</h3>
            <p className="text-sm text-muted-foreground">Most active users and their storage usage</p>
          </div>
          <Users className="w-5 h-5 text-primary" />
        </div>
        
        <div className="space-y-4 mt-4">
          {[
            { user: "Alex Johnson", files: 342, usage: 12.3, progress: 65 },
            { user: "Samantha Lee", files: 251, usage: 8.7, progress: 48 },
            { user: "Michael Chen", files: 189, usage: 5.2, progress: 32 }
          ].map((user, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">{user.user}</span>
                <span className="text-sm text-muted-foreground">{user.usage} GB</span>
              </div>
              <Progress value={user.progress} className="h-1.5" />
              <div className="text-xs text-muted-foreground text-right">
                {user.files} files
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;
