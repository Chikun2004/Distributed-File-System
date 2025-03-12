
/**
 * File object representing a file in the storage system
 */
export interface FileObject {
  id: string;
  name: string;
  type: string;
  size: string;
  modified: string;
}

/**
 * Permission object for controlling user actions
 */
export interface PermissionObject {
  canUpload: boolean;
  canDelete: boolean;
  canShare: boolean;
  canRename: boolean;
}

/**
 * Metric object for analytics data
 */
export interface MetricObject {
  name: string;
  value: number;
  unit: string;
}

/**
 * Storage statistics for the dashboard
 */
export interface StorageStats {
  total: number;
  used: number;
  available: number;
  documents: number;
  images: number;
  videos: number;
  others: number;
}

/**
 * User activity data
 */
export interface UserActivity {
  user: string;
  files: number;
  usage: number;
  lastActive: string;
}

/**
 * Activity timeline data point
 */
export interface ActivityDataPoint {
  name: string;
  uploads: number;
  downloads: number;
  shares?: number;
}
