
import React, { useState } from 'react';
import DragDropZone from "../DragDropZone";
import FileGrid from "../FileGrid";
import { Upload, Plus, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface FileObject {
  id: string;
  name: string;
  type: string;
  size: string;
  modified: string;
}

interface PermissionObject {
  canUpload: boolean;
  canDelete: boolean;
  canShare: boolean;
  canRename: boolean;
}

interface FileManagerProps {
  currentDirectory?: string;
  files?: Array<FileObject>;
  permissions?: PermissionObject;
}

const FileManager = ({
  currentDirectory = "/",
  files = [],
  permissions = {
    canUpload: true,
    canDelete: true,
    canShare: true,
    canRename: true
  }
}: FileManagerProps) => {
  const [isNewFolderDialogOpen, setIsNewFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [filesList, setFilesList] = useState<FileObject[]>(files);

  const handleFilesDrop = (files: File[]) => {
    toast.success(`${files.length} files selected for upload`);
    // Handle file upload logic here
  };

  const handleNewFolder = () => {
    setIsNewFolderDialogOpen(true);
  };

  const createNewFolder = () => {
    if (!newFolderName.trim()) {
      toast.error("Folder name cannot be empty");
      return;
    }

    const newFolder: FileObject = {
      id: `folder-${Date.now()}`,
      name: newFolderName,
      type: "folder",
      size: "--",
      modified: new Date().toLocaleDateString()
    };

    setFilesList([...filesList, newFolder]);
    setNewFolderName("");
    setIsNewFolderDialogOpen(false);
    toast.success(`Folder "${newFolderName}" created successfully`);
  };

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <DragDropZone onFilesDrop={handleFilesDrop} />
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <h2 className="text-2xl font-semibold">Files in {currentDirectory}</h2>
          <div className="ml-4 px-2 py-1 bg-primary/10 rounded-full text-primary text-xs font-medium">
            {filesList.length} items
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="default" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={handleNewFolder}
          >
            <Plus className="w-4 h-4" />
            New Folder
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
          {permissions.canUpload && (
            <Button variant="outline" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload Files
            </Button>
          )}
        </div>
      </div>

      <FileGrid files={filesList} />

      <Dialog open={isNewFolderDialogOpen} onOpenChange={setIsNewFolderDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>
              Enter a name for the new folder to be created in {currentDirectory}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              id="folderName"
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') createNewFolder();
              }}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewFolderDialogOpen(false)}>Cancel</Button>
            <Button onClick={createNewFolder}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FileManager;
