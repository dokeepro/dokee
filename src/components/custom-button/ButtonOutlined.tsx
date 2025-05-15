"use client"

import React, { FC } from 'react';
import { Button, ButtonProps } from '@mui/material';
import { styled } from '@mui/system';

interface CustomButtonProps extends ButtonProps {
    children: React.ReactNode;
    white?: boolean;
}

const CustomButton = styled(Button)<{ white?: boolean }>(({ white }) => ({
    border: white ? '3px solid #ffffff' : '3px solid #b1b4f1',
    color: white ? '#000000' : '#ffffff',
    backgroundColor: white ? '#ffffff' : '#565add',
    padding: '10px 30px',
    borderRadius: '50px',
    gap: '10px',
    fontSize: '16px',
    alignContent: 'center',
    textTransform: 'none',
    justifyContent: 'center',
    '&:hover': {
        backgroundColor: white ? '#f0f0f0' : '#474bbd',
        borderColor: white ? '#e0e0e0' : '#9194cd',
    },
}));

const ButtonOutlined: FC<CustomButtonProps> = ({ children, white, ...rest }) => {
    return (
        <CustomButton variant="outlined" white={white} {...rest}>
            {children}
        </CustomButton>
    );
};

export default ButtonOutlined;