"use client"

import React, { FC } from 'react';
import { Button, ButtonProps } from '@mui/material';
import { styled } from '@mui/system';

interface CustomButtonProps extends ButtonProps {
    children: React.ReactNode;
    white?: boolean;
    outlined?: boolean;
}

const CustomButton = styled(Button)<{ white?: boolean; outlined?: boolean }>(({ white, outlined }) => ({
    border: outlined ? '1px solid #d6e0ec' : white ? '3px solid #ffffff' : '3px solid #b1b4f1',
    color: outlined ? '#000000' : white ? '#000000' : '#ffffff',
    backgroundColor: outlined ? '#ffffff' : white ? '#ffffff' : '#565add',
    padding: '10px 30px',
    borderRadius: '50px',
    gap: '10px',
    fontSize: '16px',
    alignContent: 'center',
    textTransform: 'none',
    justifyContent: 'center',
    '&:hover': {
        backgroundColor: outlined ? '#f9f9f9' : white ? '#f0f0f0' : '#474bbd',
        borderColor: outlined ? '#c0c0c0' : white ? '#e0e0e0' : '#9194cd',
    },
}));

const ButtonOutlined: FC<CustomButtonProps> = ({ children, white, outlined, ...rest }) => {
    return (
        <CustomButton variant="outlined" white={white} outlined={outlined} {...rest}>
            {children}
        </CustomButton>
    );
};

export default ButtonOutlined;