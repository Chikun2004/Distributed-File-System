import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Grid,
    Paper,
    Typography,
    IconButton,
    LinearProgress,
    Menu,
    MenuItem,
} from '@mui/material';
import {
    CloudUpload,
    CreateNewFolder,
    MoreVert,
    Share,
    History,
    Delete
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import FileList from './FileList';
import FileUploader from './FileUploader';
import ShareDialog from './ShareDialog';
import VersionHistory from './VersionHistory';
import { socket } from '../../services/socket';
import {
    uploadFile,
    downloadFile,
    createFolder,
    deleteFile,
    getFileList
} from '../../slices/fileSlice';

const FileManager = () => {
    const dispatch = useDispatch();
    const { files, loading, error } = useSelector(state => state.files);
    const [selectedFile, setSelectedFile] = useState(null);
    const [menuAnchor, setMenuAnchor] = useState(null);
    const [shareDialogOpen, setShareDialogOpen] = useState(false);
    const [versionHistoryOpen, setVersionHistoryOpen] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({});

    useEffect(() => {
        dispatch(getFileList());

        // Setup real-time updates
        socket.on('file-updated', (data) => {
            dispatch(getFileList());
        });

        return () => {
            socket.off('file-updated');
        };
    }, [dispatch]);

    const onDrop = useCallback(async (acceptedFiles) => {
        for (const file of acceptedFiles) {
            const formData = new FormData();
            formData.append('file', file);

            setUploadProgress(prev => ({
                ...prev,
                [file.name]: 0
            }));

            try {
                await dispatch(uploadFile({
                    file: formData,
                    onProgress: (progress) => {
                        setUploadProgress(prev => ({
                            ...prev,
                            [file.name]: progress
                        }));
                    }
                }));
            } catch (error) {
                console.error('Upload failed:', error);
            }

            setUploadProgress(prev => {
                const newProgress = { ...prev };
                delete newProgress[file.name];
                return newProgress;
            });
        }
    }, [dispatch]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        noClick: true
    });

    const handleFileAction = (event, file) => {
        setSelectedFile(file);
        setMenuAnchor(event.currentTarget);
    };

    const handleMenuClose = () => {
        setMenuAnchor(null);
    };

    const handleDownload = async () => {
        if (selectedFile) {
            await dispatch(downloadFile(selectedFile._id));
            handleMenuClose();
        }
    };

    const handleShare = () => {
        setShareDialogOpen(true);
        handleMenuClose();
    };

    const handleVersionHistory = () => {
        setVersionHistoryOpen(true);
        handleMenuClose();
    };

    const handleDelete = async () => {
        if (selectedFile) {
            await dispatch(deleteFile(selectedFile._id));
            handleMenuClose();
        }
    };

    const handleCreateFolder = async () => {
        const folderName = prompt('Enter folder name:');
        if (folderName) {
            await dispatch(createFolder(folderName));
        }
    };

    return (
        <Box {...getRootProps()} sx={{ height: '100%', p: 3 }}>
            <input {...getInputProps()} />
            <Paper sx={{ p: 2, height: '100%' }}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="h5">File Manager</Typography>
                            <Box>
                                <IconButton onClick={handleCreateFolder}>
                                    <CreateNewFolder />
                                </IconButton>
                                <IconButton component="label">
                                    <CloudUpload />
                                    <input
                                        type="file"
                                        hidden
                                        multiple
                                        onChange={(e) => onDrop(Array.from(e.target.files))}
                                    />
                                </IconButton>
                            </Box>
                        </Box>
                    </Grid>

                    {Object.keys(uploadProgress).map(fileName => (
                        <Grid item xs={12} key={fileName}>
                            <Box sx={{ width: '100%' }}>
                                <Typography variant="body2">{fileName}</Typography>
                                <LinearProgress
                                    variant="determinate"
                                    value={uploadProgress[fileName]}
                                />
                            </Box>
                        </Grid>
                    ))}

                    <Grid item xs={12}>
                        {loading ? (
                            <LinearProgress />
                        ) : (
                            <FileList
                                files={files}
                                onFileAction={handleFileAction}
                                isDragActive={isDragActive}
                            />
                        )}
                    </Grid>
                </Grid>

                <Menu
                    anchorEl={menuAnchor}
                    open={Boolean(menuAnchor)}
                    onClose={handleMenuClose}
                >
                    <MenuItem onClick={handleDownload}>Download</MenuItem>
                    <MenuItem onClick={handleShare}>Share</MenuItem>
                    <MenuItem onClick={handleVersionHistory}>Version History</MenuItem>
                    <MenuItem onClick={handleDelete}>Delete</MenuItem>
                </Menu>

                {selectedFile && (
                    <>
                        <ShareDialog
                            open={shareDialogOpen}
                            onClose={() => setShareDialogOpen(false)}
                            file={selectedFile}
                        />
                        <VersionHistory
                            open={versionHistoryOpen}
                            onClose={() => setVersionHistoryOpen(false)}
                            file={selectedFile}
                        />
                    </>
                )}
            </Paper>
        </Box>
    );
};

export default FileManager;
