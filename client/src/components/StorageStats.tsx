
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Database, File, Users, Cylinder, Layers3, Layers } from "lucide-react";

const StorageStats = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card className="p-6 glass card-3d">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Storage Used</p>
            <h3 className="text-2xl font-bold mt-2 flex items-center gap-2">
              45.5 GB
              <span className="text-xs font-normal text-muted-foreground">/100 GB</span>
            </h3>
          </div>
          <div className="relative">
            <Cylinder className="text-primary/20 w-8 h-8 absolute -top-1 -left-1" />
            <Cylinder className="text-primary w-8 h-8 float-effect" />
          </div>
        </div>
        <Progress value={45} className="mt-4 h-2" />
        
        <div className="mt-4 pt-4 border-t border-border/30 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Available</p>
            <p className="font-medium">54.5 GB</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Used Today</p>
            <p className="font-medium">+2.8 GB</p>
          </div>
        </div>
      </Card>

      <Card className="p-6 glass card-3d">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Files</p>
            <h3 className="text-2xl font-bold mt-2">2,431</h3>
          </div>
          <div className="relative">
            <Layers3 className="text-primary/20 w-8 h-8 absolute -top-1 -left-1" />
            <Layers3 className="text-primary w-8 h-8 float-effect" />
          </div>
        </div>
        <Progress value={65} className="mt-4 h-2" />
        
        <div className="mt-4 pt-4 border-t border-border/30 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Documents</p>
            <p className="font-medium">865</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Images</p>
            <p className="font-medium">1,242</p>
          </div>
        </div>
      </Card>

      <Card className="p-6 glass card-3d">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Active Users</p>
            <h3 className="text-2xl font-bold mt-2">16</h3>
          </div>
          <div className="relative">
            <Users className="text-primary/20 w-8 h-8 absolute -top-1 -left-1" />
            <Users className="text-primary w-8 h-8 float-effect" />
          </div>
        </div>
        <Progress value={80} className="mt-4 h-2" />
        
        <div className="mt-4 pt-4 border-t border-border/30 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Online Now</p>
            <p className="font-medium">8</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">New Today</p>
            <p className="font-medium">+3</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default StorageStats;
