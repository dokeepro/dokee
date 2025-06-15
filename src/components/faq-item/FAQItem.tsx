import React, { FC } from 'react';
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Typography,
    Button
} from '@mui/material';
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
                border: 'none',
                background: "white",
                borderRadius: "25px",
                boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
            }}
        >
            <AccordionSummary
                aria-controls="panel-content"
                id="panel-header"
            >
                <Typography variant="h6" sx={{ fontFamily: 'Involve, sans-serif' }}>
                    {question}
                </Typography>
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
                <Typography
                    sx={{
                        fontFamily: 'Involve, sans-serif',
                        whiteSpace: 'pre-line', // ✅ дозволяє переносити текст
                    }}
                >
                    {answer}
                </Typography>
            </AccordionDetails>
        </Accordion>
    );
};

export default FaqItem;
