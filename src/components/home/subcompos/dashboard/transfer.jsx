import React, { useState, useRef, useEffect } from 'react'
import Slider from '@mui/material/Slider';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import { fetchData } from '../../../../utils';
import { Spinner } from '../baccount/detailedAccount';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Select from 'react-select';


function valuetext(value) {
    return `${value}`;
}

const PrettoSlider = styled(Slider)({
    color: '#FF8A54',
    height: 18,
    '& .MuiSlider-track': {
        border: 'none',
    },
    '& .MuiSlider-thumb': {
        height: 0,
        width: 0,
        backgroundColor: '#fff',
        '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
            boxShadow: 'inherit',
        },
        '&::before': {
            display: 'none',
        },
    },
    '& .MuiSlider-valueLabel': {
        display: 'none',

    },
});



const Transfer = ({ isShow, setIsShow, user, setIsRefresh }) => {
    const [accounts, setAccounts] = useState([]);
    const [isAccountsFetching, setIsAccountsFetching] = useState(false);
    const [fromAccBalance, setFromAccBalance] = useState(0);
    const [transferData, setTransferData] = useState({
        amount: 0,
        date: new Date().toISOString().split("T")[0],
        from_account_id: '',
        to_account_id: '',
        from_account_label: '',
        to_account_label: '',
    });
    const [isProcessing, setIsProcessing] = useState(false);
    const [isChecked, setIsChecked] = useState(false)
    const [transferFee, setTransferFee] = useState(0)

    const handleSliderChange = (event, newValue) => {
        setTransferData({
            ...transferData,
            amount: newValue
        });
    };

    const handleInputChange = (event) => {
        setTransferData({
            ...transferData,
            amount: event.target.value === '' ? 0 : Number(event.target.value)
        });
    };


    useEffect(() => {
        if (transferData?.from_account_id) {
            accounts.forEach(account => {
                if (account.id === transferData.from_account_id) {
                    if (account.transfer_rate !== 0) {
                        setIsChecked(true)
                    } else {
                        setIsChecked(false)
                    }
                }
            })
        }
    }, [transferData?.from_account_id])


    const fetchAccounts = async () => {
        setIsAccountsFetching(true);
        try {
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_BASE_URL}${import.meta.env.VITE_GET_USER_BANK_ACCOUNTS_API_EP}?u=${user.userUID}`);
            if (res?.data?.data?.length === 0) {
                setIsShow(false);
                toast.error("You don't have any accounts. Please add one.");
            } else {
                const filteredAccounts = res.data.data.filter(account => account?.account_type !== 'loan');
                setAccounts(filteredAccounts);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsAccountsFetching(false);
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, []);

    useEffect(() => {
        const acc = accounts.find(account => account.id === transferData?.from_account_id);

        if (transferData?.from_account_id) {
            if (acc?.account_type !== 'credit') {
                fetchData(`${import.meta.env.VITE_BACKEND_BASE_URL}${import.meta.env.VITE_GET_ACCOUNT_BALANCE}?q=${transferData?.from_account_id}`)
                    .then(res => {
                        setFromAccBalance(parseInt(res?.data?.balance, 10));
                    })
                    .catch(err => console.error(err));
            } else {
                console.log(parseInt(acc?.credit_limit, 10) - Math.abs(acc?.balance?.balance))
                setFromAccBalance(parseInt(acc?.credit_limit, 10) - Math.abs(acc?.balance?.balance));

            }
        }
    }, [transferData?.from_account_id]);



    const submitData = async (e) => {
        if (!transferData.amount || !transferData.from_account_id || !transferData.to_account_id) {
            toast.error("Please fill all the fields");
            return;
        }

        setIsProcessing(true);

        let data = {}

        if (isChecked) {
            data = {
                ...transferData,
                transfer_fee: transferFee
            }
        } else {
            data = {
                ...transferData,
                transfer_fee: 0
            }
        }

        try {
            const res = await axios.post(`${import.meta.env.VITE_BACKEND_BASE_URL}${import.meta.env.VITE_TRANSFER_BALANCE}?u=${user.userUID}`, data)

            toast.success(res.data.message);
            setIsShow(false);
            setIsRefresh(true);
            setAddData(null);
            e.target.reset();
        } catch (err) {
            toast.error(err.response.data.message);
        } finally {
            setIsProcessing(false);
        }
    }


    const handleCheckboxChange = () => {
        if (!transferData.from_account_id) {
            return
        }
        setIsChecked(!isChecked)
    }


    useEffect(() => {
        if (isChecked) {
            accounts.forEach(account => {
                if (account.id === transferData.from_account_id) {
                    const transferFee = transferData.amount * account.transfer_rate / 100
                    setTransferFee(transferFee)
                }
            })
        }
    }, [transferData?.amount])


    return (
        <div className={`w-full h-screen z-50 flex justify-center items-center fixed top-0 left-0 bg-black bg-opacity-50 ${isShow ? "block" : "hidden"}`}>
            <div className='w-[calc(100%-32px)] md:w-auto aspect-[3/4] h-[75%] p-3 z-50 bg-white rounded shadow-lg'>
                <div className='flex justify-between items-center border-b pb-3 border-gray-300'>
                    <h1 className='text-3xl font-bold text-black'>Transfer</h1>
                    <button onClick={() => setIsShow(!isShow)} className='mr-2 p-1 rounded border border-[#FF8A54] bg-[#FFD2BE] hover:bg-[#ffc0a4] cursor-pointer'>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="text-[#FF8A54]" viewBox="0 0 16 16">
                            <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
                        </svg>
                    </button>
                </div>
                <div className='flex flex-col justify-between h-[calc(100%-49px)]'>
                    <div className='flex flex-col gap-4 mt-4'>
                        <div>
                            <label htmlFor="from" className={``}>From<span className='text-red-500'>*</span></label>
                            <div className='flex flex-col w-full'>
                                <div className={`relative`}>
                                    <Select
                                        options={accounts.map(account => ({
                                            value: account.id,
                                            label: `${account.account_name} - ${account.account_number} (${account?.account_type === 'mobile' ? account.mobile_bank :
                                                account.account_type === 'debit' ? 'Debit Card' :
                                                    account.account_type === 'credit' ? 'Credit Card' :
                                                        account.account_type === 'genaral' ? 'Bank Account' : account.account_type === 'cash' ? 'Cash' : account.account_type})`,
                                            isDisabled: account.id === transferData.to_account_id
                                        }))}
                                        onChange={(selectedOption) => {
                                            setTransferData({
                                                ...transferData,
                                                from_account_id: selectedOption.value
                                            });
                                        }}
                                        isDisabled={false}
                                    />

                                </div>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="to" className={``}>To<span className='text-red-500'>*</span></label>
                            <div className='flex flex-col w-full'>
                                <div className={`relative`}>
                                    <Select
                                        options={accounts.filter(acc => acc.id !== transferData.from_account_id && acc.account_type !== 'credit').map(account => ({
                                            value: account.id,
                                            label: `${account.account_name} - ${account.account_number} (${account?.account_type === 'mobile' ? account.mobile_bank :
                                                account.account_type === 'debit' ? 'Debit Card' :
                                                    account.account_type === 'credit' ? 'Credit Card' :
                                                        account.account_type === 'genaral' ? 'Bank Account' : account.account_type === 'cash' ? 'Cash' : account.account_type})`,
                                        }))}
                                        onChange={(selectedOption) => {
                                            setTransferData({
                                                ...transferData,
                                                to_account_id: selectedOption.value
                                            });
                                        }}
                                        isDisabled={false}
                                    />

                                </div>
                            </div>
                        </div>

                        <div className='flex justify-between items-center gap-3'>
                            <div className={'w-full flex justify-center items-center relative'}>
                                <PrettoSlider
                                    defaultValue={0}
                                    valueLabelDisplay="auto"
                                    getAriaValueText={valuetext}
                                    min={0}
                                    value={typeof transferData.amount === 'number' ? transferData.amount : 0}
                                    onChange={handleSliderChange}
                                    max={fromAccBalance}
                                />
                                <span className={'absolute top-1/2 -translate-y-1/2 right-2 text-[13px] text-gray-600 '}>
                                    {fromAccBalance}
                                </span>
                            </div>
                            <input
                                className='max-w-20 outline-none border-[1.5px] border-[#FF8A54] bg-[#FFD2BE] p-1 rounded'
                                value={transferData.amount}
                                type='number'
                                onChange={handleInputChange}
                            />
                        </div>
                        <style>
                            {
                                `
                                    input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}
                                `
                            }
                        </style>
                        <div className='flex w-full items-center justify-center gap-3'>

                            <label className='mt-4 flex cursor-pointer select-none items-center'>
                                <div className='relative'>
                                    <input
                                        type='checkbox'
                                        checked={isChecked}
                                        onChange={handleCheckboxChange}
                                        className='sr-only'
                                    />
                                    <div className='block h-8 w-14 rounded-full bg-[#FFD2BE]'></div>
                                    <div className={`dot absolute ${isChecked ? "right-1" : "right-7"} top-1 h-6 w-6 rounded-full ${isChecked ? "bg-[#FF8A54]" : "bg-[#ffffff]"} transition-all duration-300`}></div>
                                </div>
                            </label>

                            <div className={`flex flex-col w-full ${isChecked ? "" : "opacity-50"}`}>
                                <span className='text-[13px] text-gray-500'>Include Transfer Fee</span>
                                <div className='relative'>
                                    <span className='absolute top-1/2 -translate-y-1/2 right-5'>
                                        {user?.currency_type === "USD" ? "$" : "৳"}
                                    </span>
                                    <input
                                        value={transferFee}
                                        onChange={(e) => setTransferFee(e.target.value)}
                                        type="number"
                                        className='bg-[#EEF2F5] rounded-md border border-gray-300 flex items-center justify-center w-full text-center py-4 px-1 gap-5 outline-none'
                                        disabled={!isChecked}
                                    />
                                </div>


                            </div>

                        </div>
                    </div>
                    <div className='flex flex-col'>
                        <button onClick={submitData} type='submit' disabled={isProcessing}
                            className={`${isProcessing ?
                                'py-[10.5px]' : 'py-2'
                                } flex justify-center  w-full bg-[#fa773a] hover:bg-[#FF8A54] transition-all duration-300 text-white font-bold rounded-full `}>
                            {isProcessing ? (
                                <Spinner />
                            ) : 'Transfer'}</button>

                    </div>
                </div>
            </div>
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
        </div >
    )
}

export default Transfer
