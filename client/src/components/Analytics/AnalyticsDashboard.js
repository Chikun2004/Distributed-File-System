import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Paper,
    Typography,
    Card,
    CardContent,
    Select,
    MenuItem,
    FormControl,
    InputLabel
} from '@mui/material';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { useDispatch, useSelector } from 'react-redux';
import {
    getStorageAnalytics,
    getAccessStats,
    getCollaborationStats
} from '../../slices/analyticsSlice';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const AnalyticsDashboard = () => {
    const dispatch = useDispatch();
    const [timeRange, setTimeRange] = useState('30');
    const {
        storageStats,
        accessStats,
        collaborationStats,
        loading
    } = useSelector(state => state.analytics);

    useEffect(() => {
        dispatch(getStorageAnalytics());
        dispatch(getAccessStats(timeRange));
        dispatch(getCollaborationStats());
    }, [dispatch, timeRange]);

    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const storageChartData = {
        labels: storageStats?.fileTypes?.map(type => type._id || 'Unknown') || [],
        datasets: [
            {
                data: storageStats?.fileTypes?.map(type => type.totalSize) || [],
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF'
                ]
            }
        ]
    };

    const accessChartData = {
        labels: accessStats?.map(stat => stat.date) || [],
        datasets: [
            {
                label: 'Views',
                data: accessStats?.map(stat => stat.views) || [],
                borderColor: '#36A2EB',
                fill: false
            },
            {
                label: 'Downloads',
                data: accessStats?.map(stat => stat.downloads) || [],
                borderColor: '#FF6384',
                fill: false
            },
            {
                label: 'Edits',
                data: accessStats?.map(stat => stat.edits) || [],
                borderColor: '#4BC0C0',
                fill: false
            }
        ]
    };

    const collaborationChartData = {
        labels: collaborationStats?.map(stat => stat.fileName) || [],
        datasets: [
            {
                label: 'Collaborators',
                data: collaborationStats?.map(stat => stat.collaboratorCount) || [],
                backgroundColor: '#36A2EB'
            }
        ]
    };

    return (
        <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
                {/* Storage Overview */}
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">Storage Overview</Typography>
                            <Typography variant="h4">
                                {formatBytes(storageStats?.storage?.totalSize || 0)}
                            </Typography>
                            <Typography color="textSecondary">
                                Total Files: {storageStats?.storage?.totalFiles || 0}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Time Range Selector */}
                <Grid item xs={12} md={8}>
                    <FormControl fullWidth>
                        <InputLabel>Time Range</InputLabel>
                        <Select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                        >
                            <MenuItem value="7">Last 7 days</MenuItem>
                            <MenuItem value="30">Last 30 days</MenuItem>
                            <MenuItem value="90">Last 90 days</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>

                {/* Storage Distribution */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6">Storage Distribution</Typography>
                        <Box sx={{ height: 300 }}>
                            <Pie
                                data={storageChartData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false
                                }}
                            />
                        </Box>
                    </Paper>
                </Grid>

                {/* File Access Trends */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6">File Access Trends</Typography>
                        <Box sx={{ height: 300 }}>
                            <Line
                                data={accessChartData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    scales: {
                                        y: {
                                            beginAtZero: true
                                        }
                                    }
                                }}
                            />
                        </Box>
                    </Paper>
                </Grid>

                {/* Collaboration Activity */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6">Collaboration Activity</Typography>
                        <Box sx={{ height: 300 }}>
                            <Bar
                                data={collaborationChartData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    scales: {
                                        y: {
                                            beginAtZero: true
                                        }
                                    }
                                }}
                            />
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default AnalyticsDashboard;
