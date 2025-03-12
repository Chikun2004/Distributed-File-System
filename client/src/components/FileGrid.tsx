
import { Card } from "@/components/ui/card";
import { FileIcon, ImageIcon, VideoIcon, File, Film, Music, Code, Archive, Folder } from "lucide-react";

interface FileItem {
  id: string;
  name: string;
  type: string;
  size: string;
  modified: string;
}

interface FileGridProps {
  files: FileItem[];
}

const getFileIcon = (type: string) => {
  switch (type) {
    case 'folder':
      return <Folder className="w-12 h-12 text-amber-500" />;
    case 'image':
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
      return <ImageIcon className="w-12 h-12 text-blue-500" />;
    case 'video':
    case 'mp4':
    case 'mov':
    case 'avi':
      return <Film className="w-12 h-12 text-purple-500" />;
    case 'pdf':
      return <FileIcon className="w-12 h-12 text-red-500" />;
    case 'ppt':
    case 'pptx':
      return <FileIcon className="w-12 h-12 text-orange-500" />;
    case 'audio':
    case 'mp3':
    case 'wav':
      return <Music className="w-12 h-12 text-green-500" />;
    case 'archive':
    case 'zip':
    case 'rar':
      return <Archive className="w-12 h-12 text-yellow-500" />;
    case 'code':
    case 'js':
    case 'ts':
    case 'jsx':
    case 'tsx':
    case 'html':
    case 'css':
      return <Code className="w-12 h-12 text-cyan-500" />;
    default:
      return <File className="w-12 h-12 text-gray-500" />;
  }
};

const FileGrid = ({ files }: FileGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {files.map((file) => (
        <Card 
          key={file.id} 
          className="p-6 glass hover:shadow-lg transition-all duration-300 card-3d"
        >
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-white/30 rounded-lg shadow-sm">
              {getFileIcon(file.type)}
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-lg truncate">{file.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                  {file.type.toUpperCase()}
                </span>
                <p className="text-sm text-muted-foreground">{file.size}</p>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Modified {file.modified}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default FileGrid;
