import React, { FC } from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

interface FaqItemProps {
    question: string;
    answer: string;
    isOpen: boolean;
    onToggle: () => void;
}

const FaqItem: FC<FaqItemProps> = ({ question, answer, isOpen, onToggle }) => {
    return (
        <Accordion
            expanded={isOpen}
            onChange={onToggle}
            sx={{
                boxShadow: 'none',
                border: 'none',
                background: "white",
            }}
        >
            <AccordionSummary
                aria-controls="panel-content"
                id="panel-header"
            >
                <Typography variant="h6">{question}</Typography>
                <Button
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggle();
                    }}
                    sx={{
                        marginLeft: 'auto',
                        maxWidth: "44px",
                        display: "flex",
                        backgroundColor: isOpen ? '#4a3aff' : '#f7f7ff',
                        color: isOpen ? '#ffffff' : '#6f6c8f',
                        '&:hover': {
                            backgroundColor: isOpen ? '#3a2ecc' : '#e0e0f5',
                        },
                    }}
                >
                    {isOpen ? <RemoveIcon /> : <AddIcon />}
                </Button>
            </AccordionSummary>
            <AccordionDetails>
                <Typography>{answer}</Typography>
            </AccordionDetails>
        </Accordion>
    );
};

export default FaqItem;