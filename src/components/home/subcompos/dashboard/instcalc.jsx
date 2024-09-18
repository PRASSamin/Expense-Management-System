import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios';
import { fetchData } from '../../../../utils';
import { Spinner } from '../baccount/detailedAccount';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Select from 'react-select';


const InterestCalculation = ({ isShow, setIsShow, user, setIsRefresh }) => {
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
    const [data, setData] = useState(null);
    const [selectedAccount, setSelectedAccount] = useState(null);
const [mode, setMode] = useState('daily')
const [calculatedData, setCalculatedData] = useState(null)


    const fetchAccounts = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_BASE_URL}${import.meta.env.VITE_GET_USER_BANK_ACCOUNTS_API_EP}?u=${user.userUID}`);
            setAccounts((res.data.data).filter(acc => acc.account_type === 'credit' || acc.account_type === 'loan'));


        } catch (err) {
            console.log(err);
        } 
    };

    useEffect(() => {
        fetchAccounts();
    }, []);


    const fetchAccountDetails = async () => {
        setIsProcessing(true);
        try {
            const selectedAccountData = accounts.find(acc => parseInt(acc.id) === parseInt(selectedAccount.value));

            const { account_type } = selectedAccountData;

            const res = await axios.get(
                `${import.meta.env.VITE_BACKEND_BASE_URL}${import.meta.env.VITE_GET_BANK_ACCOUNT_DETAILS_API_EP}`,
                {
                    params: {
                        q: selectedAccount.value,
                        u: user.userUID,
                        type: account_type
                    }
                }
            );


            if (res.status === 200) {
                if (account_type === 'loan') {
                    const data = res.data.data;
                    setData({
                        total_amount: data.account.loan_amount,
                        loan_amount: data.account.loan_remaining,
                        last_interest_update: data.account.last_interest_update,
                        last_payment_date: data.account.last_payment_date,
                        interest_rate: data.account.interest_rate,
                        account_number: data.account.account_number,
                    })
                } else if (account_type === 'credit') {
                    const data = res.data.data;
                    setData({
                        total_amount: data.account.credit_limit,
                        loan_amount: Math.abs(data.account.balance.balance),
                        last_interest_update: data.account.last_interest_update,
                        last_payment_date: data.account.last_payment_date,
                        interest_rate: data.account.interest_rate,
                        account_number: data.account.account_number,
                    })
                }
            }
        } catch (err) {
            console.log(err);
        } finally {
            setIsProcessing(false);
        }
    };

    useEffect(() => {
        if (selectedAccount) {
            fetchAccountDetails()
        }
    }, [selectedAccount])


    useEffect(() => {
        if (mode === 'daily') {
            setCalculatedData({
                interest: parseFloat(data?.interest_rate) / 100 / 365 * parseFloat(data?.loan_amount),
                loan_amount: parseFloat(data?.loan_amount),
                total_amount: parseFloat(data?.loan_amount) + parseFloat(data?.interest_rate) / 100 / 365 * parseFloat(data?.loan_amount),
            })
        } else if (mode === 'monthly') {
            setCalculatedData({
                interest: parseFloat(data?.interest_rate) / 100 / 12 * parseFloat(data?.loan_amount),
                loan_amount: parseFloat(data?.loan_amount),
                total_amount: parseFloat(data?.loan_amount) + parseFloat(data?.interest_rate) / 100 / 12 * parseFloat(data?.loan_amount),
            })
        } else if (mode === 'yearly') {
            setCalculatedData({
                interest: parseFloat(data?.interest_rate) / 100 * parseFloat(data?.loan_amount),
                loan_amount: parseFloat(data?.loan_amount),
                total_amount: parseFloat(data?.loan_amount) + parseFloat(data?.interest_rate) / 100 * parseFloat(data?.loan_amount),
            })
        }
    }, [mode, data])
    


    return (
        <div onClick={() => {
            setIsShow(false);
        }} className={`w-full h-screen z-50 flex justify-center items-center fixed top-0 left-0 bg-black bg-opacity-50 ${isShow ? "block" : "hidden"}`}>
            <div onClick={(e) => {
                e.stopPropagation();
            }} className='w-[calc(100%-32px)] md:w-auto aspect-[3/4] h-[75%] p-3 z-50 bg-white rounded shadow-lg'>
                <div className='w-full text-xl font-bold text-center border-b mb-3 pb-2 relative'>
                    <h1 >Interest Calculator</h1>
                    <button onClick={() => setIsShow(!isShow)} className='mr-2 p-1 rounded border border-yellow-600 bg-yellow-300 hover:bg-yellow-400 cursor-pointer absolute top-0 right-0'>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="text-yellow-600" viewBox="0 0 16 16">
                            <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
                        </svg>
                    </button>
                </div>
                <div>

                    <div className='flex flex-col w-full'>
                        <div className={`relative`}>
                            <Select
                                options={accounts.map(account => ({
                                    value: account.id,
                                    label: `${account.account_name} - ${account.account_number} (${account?.account_type === 'mobile' ? account.mobile_bank :
                                        account.account_type === 'debit' ? 'Debit Card' :
                                            account.account_type === 'credit' ? 'Credit Card' :
                                                account.account_type === 'genaral' ? 'Bank Account' : account.account_type === 'cash' ? 'Cash' : account.account_type})`,

                                }))}
                                onChange={(selectedOption) => {
                                    setSelectedAccount(selectedOption);
                                }}

                                isDisabled={false}
                            />

                        </div>
                    </div>
                </div>

                {
                    isProcessing ? (
                        <div className='relative h-[calc(100%-73px)] w-full flex items-center justify-center'>
<Spinner/>
                        </div>
                    ) : (
                        data && (
                            <div className='relative h-[calc(100%-73px)] w-full'>
                    <div className='flex flex-col'>

                        <div className='flex flex-col mt-2'>
                            <h1 className='text-sm'>

                                {accounts.find(acc => parseInt(acc.id) === parseInt(selectedAccount.value)).account_type === "loan" ? "Account" :"Card"} Number:{' '}
                                <span
                                    className={`font-bold`}

                                >
                                    {data?.account_number}
                                </span>
                            </h1>

                            <h1 className='text-sm'>Interest Rate: <span className='font-bold'>{data?.interest_rate}%</span></h1>
                        </div>
                    </div>
                    <div className='flex flex-col gap-1 text-sm absolute bottom-5 w-full '>
                        <div className='flex justify-between '>
                            <h2>{accounts.find(acc => parseInt(acc.id) === parseInt(selectedAccount.value)).account_type === "loan" ? "Loan Amount" : "Credit Limit"}</h2>
                            <h2 className='font-bold'>{data.total_amount} {user.currency_type}</h2>
                        </div>
                        <div className='w-full h-[5px] rounded-full bg-gray-300' />

                        <div className='flex justify-between '>
                            <h2>{accounts.find(acc => parseInt(acc.id) === parseInt(selectedAccount.value)).account_type === "loan" ? "Loan Remaining" : "Credit Used"}</h2>
                            <h2 className='font-bold'>{calculatedData?.loan_amount} {user.currency_type}</h2>
                        </div>
                        <div className='flex justify-between'>
                            <h2>Interest</h2>
                            <h2 className='font-bold'>{(calculatedData?.interest).toFixed(3)} {user?.currency_type}</h2>
                        </div>
                        <div className='w-full h-[5px] rounded-full bg-gray-300' />
                        <div className='flex justify-between  mb-4'>
                            <h2>Total</h2>
                            <h2 className='font-bold'>{(calculatedData?.total_amount).toFixed(3)} {user?.currency_type}</h2>
                        </div>
                        <div className='flex justify-center gap-1 font-bold'>
                            <button type='button' onClick={() => setMode('daily')} className={`w-full border ${mode === 'daily' ? "bg-yellow-400 hover:bg-yellow-600 text-white" : "text-yellow-700"} border-yellow-700   rounded py-1.5 transition-all duration-300 `}>Daily</button>

                            <button type='button' onClick={() => setMode('monthly')} className={`w-full border ${mode === 'monthly' ? "bg-yellow-400 hover:bg-yellow-600 text-white" : "text-yellow-700"} border-yellow-700   rounded py-1.5 transition-all duration-300 `}>Monthly</button>

                            <button type='button' onClick={() => setMode('yearly')} className={`w-full border ${mode === 'yearly' ? "bg-yellow-400 hover:bg-yellow-600 text-white" : "text-yellow-700"} border-yellow-700   rounded py-1.5 transition-all duration-300 `}>Yearly</button>
                            
                          
                            
                        </div>
                    </div>
                </div>
                        )
                    )
                }

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
        </div >
    )
}

export default InterestCalculation
