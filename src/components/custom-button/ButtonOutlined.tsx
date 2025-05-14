"use client"

import React, {FC} from 'react';
import { Button } from '@mui/material';
import { styled } from '@mui/system';

interface CustomButtonProps {
    children: React.ReactNode;
}

const CustomButton = styled(Button)({
    border: '3px solid #b1b4f1',
    color: '#fff',
    backgroundColor: '#565add',
    padding: '10px 30px',
    borderRadius: '50px',
    gap: '10px',
    fontSize: '16px',
    alignContent: 'center',
    textTransform: 'none',
    justifyContent: 'center',
    '&:hover': {
        backgroundColor: '#474bbd',
        borderColor: '#9194cd',
    },
});

const ButtonOutlined:FC<CustomButtonProps> = ({children}) => {
    return (
        <CustomButton variant="outlined">
            {children}
        </CustomButton>
    );
};

export default ButtonOutlined;