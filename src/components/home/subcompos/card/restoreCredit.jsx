import React, { useEffect, useState } from 'react'
import axios from 'axios';

const RestoreCredit = ({ data, isOpen, onClose, fetchCardDetails }) => {
    const [showFullCardNumber, setShowFullCardNumber] = useState(false);
    const [response, setResponse] = useState(null);
    const CurrentDate = new Date().toISOString().split('T')[0];

    const maskCardNumber = (cardNumber) => {
        if (cardNumber?.length <= 4) {
            return cardNumber;
        }
        const maskedPart = cardNumber?.slice(0, -4).replace(/./g, '•');
        const lastFourDigits = cardNumber?.slice(-4);
        return `${maskedPart}${lastFourDigits}`;
    };


    
    const PayCredit = async () => {
        if (data.balanceData?.credit_used === 0) {
            setResponse({
                status: 'error',
                message: 'No credit used yet.'
            })
            return
        }

        if (data.balanceData?.last_payment_date === CurrentDate) {
            setResponse({
                status: 'error',
                message: 'Card payment already made for today.'
            })
            return
        }
        try {
            const res = await axios.post(`${import.meta.env.VITE_BACKEND_BASE_URL}${import.meta.env.VITE_PAY_CREDIT_API_EP}?c=${data.card.card_number}&cvv=${data.card.cvv}&u=${data.userData.userUID}`,)

            if (res.status === 200) {
                fetchCardDetails()
                // onClose()
            }
            console.log(res.data)
        } catch (err) {
            console.log(err)
        }
    }


    return (
        <div onClick={() => {
            onClose()
        }} className={`${isOpen ? "block" : "hidden"} h-screen w-full bg-black/40 fixed top-0 left-0 z-50`}>
            <div onClick={(e) => {
                e.stopPropagation()
            }} className='h-[calc(100vh-60px)]  sm:h-auto sm:aspect-square w-[calc(100%-32px)] sm:w-[500px] bg-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg shadow py-5'>
                <div className='flex flex-col px-5'>
                    <h1 className='font-bold text-2xl '>Restore Credit</h1>
                    <div className='flex flex-col mt-2'>
                        <h1 className='text-sm'>

                            Card Number:{' '}
                            <span
                                className={`font-bold card-number ${showFullCardNumber ? 'show-full' : 'show-masked tracking-widest'} cursor-pointer`}
                                onClick={(e) => {
                                    setShowFullCardNumber(!showFullCardNumber)
                                    if (e.detail > 1) {
                                        e.preventDefault();
                                    }
                                }}
                            >
                                {showFullCardNumber ? data?.card?.card_number : maskCardNumber(data?.card?.card_number)}
                            </span>
                        </h1>
                        <h1 className='text-sm'>Card Holder: <span className='font-bold'>{data?.card?.cardholder_name}</span></h1>
                        <h1 className='text-sm'>Credit Limit: <span className='font-bold'>{data?.card?.credit_limit} {data?.userdata?.currency_type} {data?.userData?.currency_type}</span></h1>
                        <h1 className='text-sm'>Available Credit: <span className='font-bold'>{data?.balanceData?.available_credit} {data?.userData?.currency_type}</span></h1>
                        <h1 className='text-sm'>Interest Rate: <span className='font-bold'>{data?.card?.interest_rate}%</span></h1>
                    </div>
                </div>
                <div className='flex flex-col gap-1 text-sm absolute bottom-5 w-full px-5 '>
                    <div className='flex justify-between '>
                        <h2>Credit Used</h2>
                        <h2 className='font-bold'>{parseFloat(data?.balanceData?.credit_used) - parseFloat(data?.balanceData?.interest)} {data?.userData?.currency_type}</h2>
                    </div>
                    <div className='flex justify-between'>
                        <h2>Interest</h2>
                        <h2 className='font-bold'>{parseFloat(data?.balanceData?.interest)} {data?.userData?.currency_type}</h2>
                    </div>
                    <div className='w-full h-[.5px] bg-black' />

                    <div className='flex justify-between  mb-4'>
                        <h2>Total</h2>
                        <h2 className='font-bold'>{parseFloat(data?.balanceData?.credit_used)} {data?.userData?.currency_type}</h2>
                    </div>
                    {
                        response ? (
                            <div className={`text-[13px] ${response?.status === 'error' ? 'text-red-500' : 'text-green-500'}`}>{response?.message}</div>
                        ) : null
                    }
                    <div className='flex justify-center gap-1'><button type='button' onClick={() => PayCredit()} className='w-full bg-black text-white rounded py-1.5 hover:bg-black/90'>Restore</button>
                        <button type='button' onClick={() => onClose()} className='px-2 bg-purple-900 text-white rounded py-1.5 hover:bg-purple-700'>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x-lg" viewBox="0 0 16 16">
                                <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default RestoreCredit
