import * as React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress, { LinearProgressProps } from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

function CircularProgressWithLabel(props) {
    return (<Box sx={{ position: 'relative', display: 'inline-flex',color: "#fff" }}>
        <CircularProgress color='inherit' variant="determinate" {...props} />
        <Box sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            <Typography variant="caption" component="div" color="text.error">{`${Math.round(props.value)}%`}</Typography>
        </Box>
    </Box>);
}

function LinearProgressWithLabel(props: LinearProgressProps & { value: number }) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: '100%', mr: 1 }}>
                <LinearProgress variant="determinate" {...props} />
            </Box>
            <Box sx={{ minWidth: 35 }}>
                <Typography variant="body2" color="text.secondary">{`${Math.round(
                    props.value,
                )}%`}</Typography>
            </Box>
        </Box>
    );
}

export { CircularProgressWithLabel, LinearProgressWithLabel };