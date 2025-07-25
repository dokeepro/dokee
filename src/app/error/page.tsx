"use client";

import React from 'react';
import Message from '@/components/success-page/Message';

const Page = () => {
    return (
        <>
            <Message title="Произошла ошибка при оплате :(" description="Мы приносим искренние сожаления при обработке платежа, ваши данные не были отправленные и вы вернётесь на главную страницу через несколько секунд" />
        </>
    );
};

export default Page;