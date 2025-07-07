'use client';

import React, {useState} from 'react';
import {Input, Button, Box, Typography, CircularProgress, IconButton} from '@mui/joy';
import Visibility from '@mui/icons-material/Visibility';
import styles from './Admin.module.scss';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import AdminContent from "@/components/admin-content/AdminContent";

const ADMIN_LOGIN = process.env.NEXT_PUBLIC_ADMIN_LOGIN;
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

const Admin = () => {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isAuth, setIsAuth] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            if (login === ADMIN_LOGIN && password === ADMIN_PASSWORD) {
                setIsAuth(true);
            } else {
                setError('Неправильный логин или пароль');
            }
        }, 1200);
    };

    if (isAuth) {
        return (
            <>
                <AdminContent/>
            </>
        );
    }

    return (
        <div className={styles.wrapper}>
            <Box
                sx={{
                    maxWidth: 340,
                    mx: 'auto',
                    mt: 12,
                    height: 'fit-content',
                    p: 3,
                    borderRadius: 8,
                    boxShadow: 'md',
                    bgcolor: 'background.body',
                }}>
                <Typography level="h4" sx={{mb: 2, textAlign: 'center'}}>
                    Вход в админ-панель
                </Typography>
                <form onSubmit={handleSubmit}>
                    <Input
                        placeholder="Login"
                        value={login}
                        onChange={e => setLogin(e.target.value)}
                        sx={{mb: 2}}
                        required/>
                    <Input
                        placeholder="Password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        sx={{mb: 2}}
                        required
                        endDecorator={
                            <IconButton
                                variant="plain"
                                onClick={() => setShowPassword((v) => !v)}>
                                {showPassword ? <VisibilityOff/> : <Visibility/>}
                            </IconButton>
                        }/>
                    {error && (
                        <Typography color="danger" level="body-sm" sx={{mb: 1}}>
                            {error}
                        </Typography>
                    )}
                    <Button
                        type="submit"
                        fullWidth
                        disabled={loading}
                        sx={{mb: 1}}>
                        {loading ? <CircularProgress size="sm"/> : 'Login'}
                    </Button>
                </form>
            </Box>
        </div>
    );
};

export default Admin;