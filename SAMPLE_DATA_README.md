# Distributed File System - Sample Data Structure

This directory contains sample data demonstrating how files are stored and distributed across primary and secondary MongoDB instances in our distributed file system.

## Directory Structure

```
mongodb_data_primary/
├── sample_files/
│   ├── document1.txt           # Example text document (1KB)
│   └── image1.jpg.metadata    # Metadata for an image file (2MB)
├── db_status.json            # Primary instance status and configuration

mongodb_data_secondary/
├── sample_files/
│   ├── document2.txt           # Example text document (2KB)
│   └── video1.mp4.metadata    # Metadata for a video file (15MB)
└── db_status.json            # Secondary instance status and configuration
```

## Sample Files Description

### Primary Instance (Port 27017)

1. **document1.txt**
   - Type: Text Document
   - Size: 1KB
   - Status: Active
   - Location: Primary
   - File ID: 65d9f123a8b2e4c7f9012345
   - Not replicated to secondary

2. **image1.jpg**
   - Type: Image File
   - Size: 2MB
   - Status: Active
   - Location: Primary
   - File ID: 65d9f124b8c3e5d7f9012346
   - Replicated to secondary
   - Stored using GridFS

### Secondary Instance (Port 27018)

1. **document2.txt**
   - Type: Text Document
   - Size: 2KB
   - Status: Active
   - Location: Secondary
   - File ID: 65d9f125c8d4e6f7g9012347
   - Replicated to primary

2. **video1.mp4**
   - Type: Video File
   - Size: 15MB
   - Status: Active
   - Location: Secondary
   - File ID: 65d9f126d8e5f7g8h9012348
   - Replicated to primary
   - Stored using GridFS

## File Storage Implementation

### GridFS Storage
- Large files are automatically split into chunks
- Default chunk size: 261,120 bytes
- Each chunk is stored separately for efficient access

### Metadata Storage
Each file includes detailed metadata:
- Unique File ID
- Original filename
- Upload timestamp
- File size
- MD5 hash for integrity
- Content type
- Storage location
- Replication status

### Replication Strategy
Files can be replicated between instances based on:
- File size and type
- Access patterns
- Data importance
- Available storage capacity

## Instance Configuration

### Primary Instance
- Port: 27017
- Database: dfs
- Collections: fs.files, fs.chunks
- Storage Engine: WiredTiger
- Total Files: 2
- Total Storage Used: ~3MB

### Secondary Instance
- Port: 27018
- Database: dfs
- Collections: fs.files, fs.chunks
- Storage Engine: WiredTiger
- Total Files: 2
- Total Storage Used: ~17MB

This sample data demonstrates various file types, sizes, and replication scenarios that might occur in a production distributed file system environment.
