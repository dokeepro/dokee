'use client'
import React, { useState } from 'react'

export default function CheckoutPage() {
    const [amount, setAmount] = useState('1000')

    const handlePay = async () => {
        const res = await fetch('/api/pay', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount })
        })
        const html = await res.text()
        const win = window.open('', '_self')
        win?.document.write(html)
    }

    return (
        <div >
            <h2>Оплата через WayForPay</h2>
            <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="Сумма в тенге"
            />
            <button onClick={handlePay}>Оплатить</button>
        </div>
    )
}
