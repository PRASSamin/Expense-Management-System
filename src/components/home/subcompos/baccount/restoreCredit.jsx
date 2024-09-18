import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const RestoreCredit = ({ data, isOpen, onClose, fetchAccountDetails }) => {
    const CurrentDate = new Date().toISOString().split('T')[0];


    const PayCredit = async () => {
        if (Math.abs(data.balanceData?.balance) === 0) {
            toast.error('No credit used yet.')
            return
        }

        if (data.account?.last_payment_date === new Date(data.account?.created_at).toISOString().split('T')[0]) {
            toast.error('Credit payment is not allowed on the first day of account creation.')
            return
        }


        if (data.account?.last_payment_date === CurrentDate) {
            toast.error('Credit payment already made for today.')
            return
        }

        try {
            const res = await axios.post(`${import.meta.env.VITE_BACKEND_BASE_URL}${import.meta.env.VITE_PAY_CREDIT_API_EP}?q=${data.account.id}&u=${data.userData.userUID}&type=credit`,)

            if (res.status === 200) {
                toast.success(res.data.message)
                fetchAccountDetails()
            }
        } catch (err) {
            toast.error(err.response.data.message)
        }
    }


    const getPositiveNumber = (interest) => {
        return Math.abs(interest)
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
                                className={`font-bold`}

                            >
                                {data?.account?.account_number}
                            </span>
                        </h1>

                        <h1 className='text-sm'>Interest Rate: <span className='font-bold'>{data?.account?.interest_rate}%</span></h1>
                    </div>
                </div>
                <div className='flex flex-col gap-1 text-sm absolute bottom-5 w-full px-5 '>
                    <div className='flex justify-between '>
                        <h2>Credit Used</h2>
                        <h2 className='font-bold'>{getPositiveNumber(parseFloat(data?.balanceData?.balance)) - getPositiveNumber(parseFloat(data?.account?.interest))} {data?.userData?.currency_type}</h2>
                    </div>
                    <div className='flex justify-between border-b border-black'>
                        <h2>Interest</h2>
                        <h2 className='font-bold'>{getPositiveNumber(parseFloat(data?.account?.interest))} {data?.userData?.currency_type}</h2>
                    </div>
                    <div className='w-full h-[.5px] bg-black' />

                    <div className='flex justify-between  mb-4'>
                        <h2>Total</h2>
                        <h2 className='font-bold'>{getPositiveNumber(parseFloat(data?.balanceData?.balance))} {data?.userData?.currency_type}</h2>
                    </div>
                    <div className='flex justify-center gap-1'><button type='button' onClick={() => PayCredit()} className='w-full bg-black text-white rounded py-1.5 transition-all duration-300 hover:bg-black/90'>Pay</button>
                        <button type='button' onClick={() => { onClose() }} className='px-2 border transition-all duration-300 border-black bg-transparent hover:text-white rounded py-1.5 hover:bg-black'>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x-lg" viewBox="0 0 16 16">
                                <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
            <div className='select-none' onClick={(e) => {
                e.stopPropagation()
            }}>
                <ToastContainer
                    stacked={true}
                    position="top-center"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="light"
                />
            </div>
        </div>
    )
}

export default RestoreCredit
