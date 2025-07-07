import React from 'react';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import { AlertTitle } from "@mui/material";

interface CustomAlertProps {
    open: boolean;
    onClose: (event?: React.SyntheticEvent | Event, reason?: string) => void;
    severity: 'error' | 'warning' | 'info' | 'success' | null;
    message: string | null;
    title?: string | null;
    variant?: 'filled' | 'outlined' | 'standard';
    autoHideDuration?: number;
    placement?: 'rightTop' | 'rightBottom' | 'leftTop' | 'leftBottom' | 'centerTop' | 'centerBottom';
}

const getAlertType = (variant: string) =>{
    switch (variant) {
        case 'filled':
            return 'filled';
        case 'outlined':
            return 'outlined';
        case 'standard':
            return 'standard';
        default:
            return 'filled';
    }
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} {...props} />;
});

const CustomAlert: React.FC<CustomAlertProps> = ({ open, onClose, title, variant = 'filled', severity, message, autoHideDuration = 6000, placement = 'centerTop' }) => {
    const getAnchorOrigin = (): { vertical: 'top' | 'bottom'; horizontal: 'left' | 'right' | 'center' } => {
        switch (placement) {
            case 'rightTop':
                return { vertical: 'top', horizontal: 'right' };
            case 'rightBottom':
                return { vertical: 'bottom', horizontal: 'right' };
            case 'leftTop':
                return { vertical: 'top', horizontal: 'left' };
            case 'leftBottom':
                return { vertical: 'bottom', horizontal: 'left' };
            case 'centerTop':
                return { vertical: 'top', horizontal: 'center' };
            case 'centerBottom':
                return { vertical: 'bottom', horizontal: 'center' };
            default:
                return { vertical: 'top', horizontal: 'center' };
        }
    };

    return (
        <Snackbar
            open={open}
            autoHideDuration={autoHideDuration}
            onClose={onClose}
            anchorOrigin={getAnchorOrigin()}>
            <Alert onClose={onClose} variant={getAlertType(variant)} severity={severity || 'info'}>
                {title ? <AlertTitle>{title}</AlertTitle> : null}
                {message}
            </Alert>
        </Snackbar>
    );
};

export default CustomAlert;