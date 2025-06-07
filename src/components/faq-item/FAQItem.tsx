import React, { FC } from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography, Button, List, ListItem } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

interface FaqItemProps {
    question: string;
    answer: string;
    isOpen: boolean;
    onToggle: () => void;
}

const FaqItem: FC<FaqItemProps> = ({ question, answer, isOpen, onToggle }) => {
    const hasIfList = answer.includes('если:') && answer.match(/—/);
    const hasTariffList = /(Fast|Express|Normal)\s*–/.test(answer);

    let beforeList = '';
    let listItems: string[] = [];
    let afterList = '';

    if (hasIfList) {
        const [before, after] = answer.split('если:');
        beforeList = before + 'если:';
        const lines = after.split('\n');
        listItems = lines.filter(line => line.trim().startsWith('—'));
        afterList = lines.filter(line => !line.trim().startsWith('—') && line.trim() !== '').join(' ');
    } else if (hasTariffList) {
        const match = answer.match(/^(.*?)(Fast\s*–.*)$/);
        if (match) {
            beforeList = match[1];
            listItems = match[2]
                .split(/,\s*/)
                .map(item => item.trim())
                .filter(Boolean);
        }
    }

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
                id="panel-header">
                <Typography variant="h6" sx={{ fontFamily: 'Involve, sans-serif' }}>{question}</Typography>
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
                {(hasIfList || hasTariffList) ? (
                    <Typography sx={{ fontFamily: 'Involve, sans-serif' }}>
                        {beforeList}
                        <List sx={{ pl: 2 }}>
                            {listItems.map((item, idx) => (
                                <ListItem key={idx} sx={{ display: 'list-item', pl: 0 }}>
                                    {item}
                                </ListItem>
                            ))}
                        </List>
                        {afterList && <span>{afterList}</span>}
                    </Typography>
                ) : (
                    <Typography sx={{ fontFamily: 'Involve, sans-serif', whiteSpace: 'pre-line' }}>{answer}</Typography>
                )}
            </AccordionDetails>
        </Accordion>
    );
};

export default FaqItem;