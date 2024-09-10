import React, { useState, useRef, useEffect } from 'react'
import Slider from '@mui/material/Slider';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import { fetchData } from '../../../../utils';
import { Spinner } from '../baccount/detailedAccount';

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



const Transfer = ({ isShow, setIsShow, expenseOrIncome, user, setIsRefresh }) => {
    const [accounts, setAccounts] = useState([]);
    const fromdropdownRef = useRef(null);
    const todropdownRef = useRef(null);
    const [isToDropDownOpen, setIsToDropDownOpen] = useState(false);
    const [isFromDropDownOpen, setIsFromDropDownOpen] = useState(false);
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
    const [response, setResponse] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

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

    const fetchAccounts = async () => {
        setIsAccountsFetching(true);
        try {
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_BASE_URL}${import.meta.env.VITE_GET_USER_BANK_ACCOUNTS_API_EP}?u=${user.userUID}`);
            if (res?.data?.data?.length === 0) {
                setIsShow(false);
                setResponse({ type: "error", message: "You don't have any accounts. Please add one." });
            } else {
                const filteredAccounts = res.data.data.filter(account => account?.account_type !== "credit" && account?.account_type !== 'loan');
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
        if (transferData?.from_account_id) {
            fetchData(`${import.meta.env.VITE_BACKEND_BASE_URL}${import.meta.env.VITE_GET_ACCOUNT_BALANCE}?q=${transferData?.from_account_id}`)
                .then(res => setFromAccBalance(parseInt(res?.data?.balance)))
                .catch(err => console.error(err));
        }
    }, [transferData?.from_account_id]);


    const submitData = async (e) => {
        if (!transferData.amount || !transferData.from_account_id || !transferData.to_account_id) {
            setResponse({ type: "error", message: "Please fill all the fields" });
            return;
        }
        setIsProcessing(true);
        setResponse(null);
        try {
            const res = await axios.post(`${import.meta.env.VITE_BACKEND_BASE_URL}${import.meta.env.VITE_TRANSFER_BALANCE}?u=${user.userUID}`, transferData)

            setResponse({ type: "success", message: res.data.message });
            setIsShow(false);
            setIsRefresh(true);
            setAddData(null);
            setResponse(null);
            e.target.reset();
        } catch (err) {
            setResponse({ type: "error", message: err.response.data.message });
        } finally {
            setIsProcessing(false);
        }
    }


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
                            <label htmlFor="from"
                                className={``} >From<span className='text-red-500'>*</span></label>
                            <div className=' bg-[#EEF2F5]  rounded-md border border-gray-300 flex items-center justify-center w-full py-2 px-1 gap-5'>
                                <div className='flex flex-col w-full'>
                                    <div ref={fromdropdownRef} className={`${isFromDropDownOpen && `z-20`} relative`}>
                                        <div className="select-component">
                                            <div className="custom-select">
                                                <div
                                                    className={`${transferData?.from_account_id ? "text-[#000000]" : "text-[#a7a7a7]"} selected-option px-1 flex items-center justify-between text-[15px]`}
                                                    onClick={() => setIsFromDropDownOpen(!isFromDropDownOpen)}
                                                >
                                                    {transferData?.from_account_id ? transferData?.from_account_label : "Select Account"}
                                                    <svg
                                                        className={`w-4 h-4 ml-2 inline-block transform ${isFromDropDownOpen ? "rotate-180" : "rotate-0"
                                                            }`}
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 20 20"
                                                        fill="currentColor"
                                                        aria-hidden="true"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                </div>
                                                {isFromDropDownOpen && (
                                                    <div className={`${isFromDropDownOpen ? "max-h-[100px]" : "h-0"} transition-all duration-300 select-none options-container overflow-y-auto absolute mt-1 bg-white border border-gray-400 w-full rounded-b-lg shadow-lg`}>
                                                        {accounts?.length === 0 ? (
                                                            isAccountsFetching ? (
                                                                <div className='flex py-2 items-center justify-center w-full h-full'>
                                                                    <svg className="text-emerald-400 animate-spin w-[20px] h-[20px]" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                        <path d="M32 3C35.8083 3 39.5794 3.75011 43.0978 5.20749C46.6163 6.66488 49.8132 8.80101 52.5061 11.4939C55.199 14.1868 57.3351 17.3837 58.7925 20.9022C60.2499 24.4206 61 28.1917 61 32C61 35.8083 60.2499 39.5794 58.7925 43.0978C57.3351 46.6163 55.199 49.8132 52.5061 52.5061C49.8132 55.199 46.6163 57.3351 43.0978 58.7925C39.5794 60.2499 35.8083 61 32 61C28.1917 61 24.4206 60.2499 20.9022 58.7925C17.3837 57.3351 14.1868 55.199 11.4939 52.5061C8.801 49.8132 6.66487 46.6163 5.20749 43.0978C3.7501 39.5794 3 35.8083 3 32C3 28.1917 3.75011 24.4206 5.2075 20.9022C6.66489 17.3837 8.80101 14.1868 11.4939 11.4939C14.1868 8.80099 17.3838 6.66487 20.9022 5.20749C24.4206 3.7501 28.1917 3 32 3L32 3Z" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"></path>
                                                                        <path d="M32 3C36.5778 3 41.0906 4.08374 45.1692 6.16256C49.2477 8.24138 52.7762 11.2562 55.466 14.9605C58.1558 18.6647 59.9304 22.9531 60.6448 27.4748C61.3591 31.9965 60.9928 36.6232 59.5759 40.9762" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-800"></path>
                                                                    </svg>
                                                                </div>
                                                            ) : (
                                                                <p className=' w-full text-left relative font-medium option hover:bg-gray-200 py-[6px] px-[8px] text-[13px] cursor-pointer' >No Accounts</p>
                                                            )
                                                        ) : accounts
                                                            .map((option, i) => (
                                                                <button
                                                                    type="button"
                                                                    key={i}
                                                                    className={`w-full text-left relative font-medium option hover:bg-gray-200 py-[6px] px-[8px] text-[13px] cursor-pointer ${transferData.from_account_id === option.id ? "bg-gray-200" : ""}`}
                                                                    onClick={(e) => {
                                                                        setTransferData({
                                                                            ...transferData,
                                                                            from_account_id: option.id,
                                                                            from_account_label: option.account_type === 'cash' ? (
                                                                                `${(option.account_name)?.split(' ')
                                                                                    ?.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                                                                                    ?.join(' ')} (Cash)`
                                                                            ) : (
                                                                                `${option.account_name + "-" + option.account_number} (${option?.account_type === 'mobile' ? `${option?.mobile_bank}` :
                                                                                    option?.account_type === 'debit' ? 'Debit Card' :
                                                                                        option?.account_type === 'credit' ? 'Credit Card' :
                                                                                            option?.account_type === 'genaral' ? 'Bank Account' : option?.account_type === 'cash' ? 'Cash' : option?.account_type})`
                                                                            )
                                                                        });
                                                                        setIsFromDropDownOpen(false);

                                                                    }}
                                                                >
                                                                    {option.account_type === 'cash' ? (
                                                                        `${(option.account_name)?.split(' ')
                                                                            ?.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                                                                            ?.join(' ')} (Cash)`
                                                                    ) : (
                                                                        `${option.account_name + "-" + option.account_number} (${option?.account_type === 'mobile' ? `${option?.mobile_bank}` :
                                                                            option?.account_type === 'debit' ? 'Debit Card' :
                                                                                option?.account_type === 'credit' ? 'Credit Card' :
                                                                                    option?.account_type === 'genaral' ? 'Bank Account' : option?.account_type === 'cash' ? 'Cash' : option?.account_type})`
                                                                    )}

                                                                </button>
                                                            ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>


                                </div>

                            </div>
                        </div>

                        <div>
                            <label htmlFor="to"
                                className={``} >To<span className='text-red-500'>*</span></label>
                            <div className=' bg-[#EEF2F5]  rounded-md border border-gray-300 flex items-center justify-center w-full py-2 px-1 gap-5'>
                                <div className='flex flex-col w-full'>
                                    <div ref={todropdownRef} className={`${isToDropDownOpen && "z-20"} relative`}>
                                        <div className="select-component">
                                            <div className="custom-select">
                                                <div
                                                    className={`${transferData?.to_account_id ? "text-[#000000]" : "text-[#a7a7a7]"} selected-option px-1 flex items-center justify-between text-[15px]`}
                                                    onClick={() => setIsToDropDownOpen(!isToDropDownOpen)}
                                                >
                                                    {transferData?.to_account_id ? transferData?.to_account_label : "Select Account"}
                                                    <svg
                                                        className={`w-4 h-4 ml-2 inline-block transform ${isToDropDownOpen ? "rotate-180" : "rotate-0"
                                                            }`}
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 20 20"
                                                        fill="currentColor"
                                                        aria-hidden="true"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                </div>
                                                {isToDropDownOpen && (
                                                    <div className={`${isToDropDownOpen ? "max-h-[100px]" : "h-0"} transition-all duration-300 select-none options-container overflow-y-auto absolute mt-1 bg-white border border-gray-400 w-full rounded-b-lg shadow-lg`}>
                                                        {accounts?.length === 0 ? (
                                                            isAccountsFetching ? (
                                                                <div className='flex py-2 items-center justify-center w-full h-full'>
                                                                    <svg className="text-emerald-400 animate-spin w-[20px] h-[20px]" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                        <path d="M32 3C35.8083 3 39.5794 3.75011 43.0978 5.20749C46.6163 6.66488 49.8132 8.80101 52.5061 11.4939C55.199 14.1868 57.3351 17.3837 58.7925 20.9022C60.2499 24.4206 61 28.1917 61 32C61 35.8083 60.2499 39.5794 58.7925 43.0978C57.3351 46.6163 55.199 49.8132 52.5061 52.5061C49.8132 55.199 46.6163 57.3351 43.0978 58.7925C39.5794 60.2499 35.8083 61 32 61C28.1917 61 24.4206 60.2499 20.9022 58.7925C17.3837 57.3351 14.1868 55.199 11.4939 52.5061C8.801 49.8132 6.66487 46.6163 5.20749 43.0978C3.7501 39.5794 3 35.8083 3 32C3 28.1917 3.75011 24.4206 5.2075 20.9022C6.66489 17.3837 8.80101 14.1868 11.4939 11.4939C14.1868 8.80099 17.3838 6.66487 20.9022 5.20749C24.4206 3.7501 28.1917 3 32 3L32 3Z" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"></path>
                                                                        <path d="M32 3C36.5778 3 41.0906 4.08374 45.1692 6.16256C49.2477 8.24138 52.7762 11.2562 55.466 14.9605C58.1558 18.6647 59.9304 22.9531 60.6448 27.4748C61.3591 31.9965 60.9928 36.6232 59.5759 40.9762" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-800"></path>
                                                                    </svg>
                                                                </div>
                                                            ) : (
                                                                <p className=' w-full text-left relative font-medium option hover:bg-gray-200 py-[6px] px-[8px] text-[13px] cursor-pointer' >No Accounts</p>
                                                            )
                                                        ) : accounts
                                                            .map((option, i) => (
                                                                <button
                                                                    type="button"
                                                                    key={i}
                                                                    className={`w-full text-left relative font-medium option hover:bg-gray-200 py-[6px] px-[8px] text-[13px] cursor-pointer ${transferData.to_account_id === option.id ? "bg-gray-200" : ""}`}
                                                                    onClick={(e) => {
                                                                        if (option.id === transferData.from_account_id) {
                                                                            return
                                                                        }
                                                                        setTransferData({
                                                                            ...transferData,
                                                                            to_account_id: option.id,
                                                                            to_account_label: option.account_type === 'cash' ? (
                                                                                `${(option.account_name)?.split(' ')
                                                                                    ?.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                                                                                    ?.join(' ')} (Cash)`
                                                                            ) : (
                                                                                `${option.account_name + "-" + option.account_number} (${option?.account_type === 'mobile' ? `${option?.mobile_bank}` :
                                                                                    option?.account_type === 'debit' ? 'Debit Card' :
                                                                                        option?.account_type === 'credit' ? 'Credit Card' :
                                                                                            option?.account_type === 'genaral' ? 'Bank Account' : option?.account_type === 'cash' ? 'Cash' : option?.account_type})`
                                                                            )
                                                                        });
                                                                        setIsToDropDownOpen(false);

                                                                    }}
                                                                >
                                                                    {option.account_type === 'cash' ? (
                                                                        `${(option.account_name)?.split(' ')
                                                                            ?.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                                                                            ?.join(' ')} (Cash)`
                                                                    ) : (
                                                                        `${option.account_name + "-" + option.account_number} (${option?.account_type === 'mobile' ? `${option?.mobile_bank}` :
                                                                            option?.account_type === 'debit' ? 'Debit Card' :
                                                                                option?.account_type === 'credit' ? 'Credit Card' :
                                                                                    option?.account_type === 'genaral' ? 'Bank Account' : option?.account_type === 'cash' ? 'Cash' : option?.account_type})`
                                                                    )}

                                                                </button>
                                                            ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>


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
                    </div>
                    <div className='flex flex-col'>
                        <p className={`${response?.type === "success" ? "text-green-500 " : "text-red-500 "}`}>{response?.message}</p>
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
        </div>
    )
}

export default Transfer
