import { useState, useRef, useEffect } from 'react'
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Select from 'react-select';
import { Spinner } from '../baccount/detailedAccount';

const Payment = ({ isShow, setIsShow, user, setIsRefresh }) => {
    const [accounts, setAccounts] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [data, setData] = useState(null)
    const [paymentAmount, setPaymentAmount] = useState(0)


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
            console.log(selectedAccount.value)

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
                const data = res.data.data;
                setData({
                    account: data.account,
                    balanceData: res.data.data.balance,
                    userData: user
                })
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



    const PayCredit = async () => {
        const CurrentDate = new Date().toISOString().split('T')[0]
        if (paymentAmount <= 0) {
            toast.error('Invalid payment amount.')
            return
        }

        if (data.account?.loan_remaining <= 0) {
            toast.error('No loan remaining.')
            return
        }

        if (data?.account?.last_payment_date === new Date(data?.account?.created_at).toISOString().split('T')[0]) {
            toast.error('Loan payment is not allowed on the first day of account creation.')
            return
        }

        if (data.account?.last_payment_date === CurrentDate) {
            toast.error('Card payment already made for today.')
            return
        }
        try {
            let res;
            if (data.account.account_type === "loan") {
                res = await axios.post(`${import.meta.env.VITE_BACKEND_BASE_URL}${import.meta.env.VITE_PAY_CREDIT_API_EP}?q=${data.account.id}&u=${data.userData.userUID}&type=loan`, { amount: paymentAmount }, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })

            } else {
                res = await axios.post(`${import.meta.env.VITE_BACKEND_BASE_URL}${import.meta.env.VITE_PAY_CREDIT_API_EP}?q=${data.account.id}&u=${data.userData.userUID}&type=credit`,)
            }

            if (res.status === 200) {
                toast.success(res.data.message)
                fetchAccountDetails()
            }
        } catch (err) {
            toast.error(err.response.data.message)
        }
    }






    return (
        <div onClick={() => {
            setIsShow(false);
        }} className={`w-full h-screen z-50 flex justify-center items-center fixed top-0 left-0 bg-black bg-opacity-50 ${isShow ? "block" : "hidden"}`}>
            <div onClick={(e) => {
                e.stopPropagation();
            }} className='w-[calc(100%-32px)] md:w-auto aspect-[3/4] h-[75%] p-3 z-50 bg-white rounded shadow-lg'>
                <div className='w-full text-xl font-bold text-center border-b mb-3 pb-2 relative'>
                    <h1 >Make Payment</h1>
                    <button onClick={() => setIsShow(!isShow)} className='mr-2 p-1 rounded border border-teal-600 bg-teal-400 hover:bg-teal-500 cursor-pointer absolute top-0 right-0'>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="text-teal-600" viewBox="0 0 16 16">
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

                {isProcessing ? (
                    <div className='relative h-[calc(100%-73px)] w-full flex items-center justify-center'>
                        <Spinner />
                    </div>
                ) : !data ? (
                    <div className='relative h-[calc(100%-73px)] w-full flex items-center justify-center'>
                        <p className='font-bold text-gray-600 text-sm'>Select a account</p>
                    </div>
                ) : data?.account?.account_type === 'loan' ? <div className='relative h-[calc(100%-73px)] w-full'>
                    <div className='flex flex-col  '>
                        <div className='flex flex-col mt-2'>
                            <h1 className='text-sm'>

                                Account Number:{' '}
                                <span
                                    className={`font-bold`}

                                >
                                    {data?.account?.account_number}
                                </span>
                            </h1>

                            <h1 className='text-sm'>Interest Rate: <span className='font-bold'>{data?.account?.interest_rate}%</span></h1>
                            <h1 className='text-sm'>Loan Amount: <span className='font-bold'>{data?.account?.loan_amount}{" "}{data?.userData?.currency_type === "USD" ? "$" : "৳"}</span></h1>
                            <h1 className='text-sm'>Loan Remaining: <span className='font-bold'>{data?.account?.loan_remaining}{" "}{data?.userData?.currency_type === "USD" ? "$" : "৳"}</span></h1>
                        </div>
                    </div>
                    <div className='flex flex-col gap-3 text-sm absolute bottom-5 w-full '>
                        <div>
                            <label htmlFor="payment_amount">Amount</label>
                            <input type='number' onChange={(e) => setPaymentAmount(e.target.value)} name="payment_amount" id="payment_amount" className='w-full border border-gray-300 rounded px-2 py-1.5 outline-none bg-slate-100' />
                        </div>
                        <div className='flex justify-center gap-1'><button type='button' onClick={() => PayCredit()} className='w-full bg-teal-500 border border-teal-700 font-bold text-white rounded py-1.5 transition-all duration-300 hover:bg-teal-600'>Pay</button>
                            <button type='button' onClick={() => { setIsShow(false) }} className='px-2 border transition-all duration-300 border-teal-700 bg-transparent hover:text-white rounded py-1.5 hover:bg-teal-500'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x-lg" viewBox="0 0 16 16">
                                    <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div> : <div className='relative h-[calc(100%-73px)] w-full'>
                    <div className='flex flex-col'>

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
                    <div className='flex flex-col gap-1 text-sm absolute bottom-5 w-full '>
                        <div className='flex justify-between '>
                            <h2>Credit Used</h2>
                            <h2 className='font-bold'>{Math.abs(parseFloat(data?.balanceData?.balance)) - Math.abs(parseFloat(data?.account?.interest))} {data?.userData?.currency_type}</h2>
                        </div>
                        <div className='flex justify-between border-black'>
                            <h2>Interest</h2>
                            <h2 className='font-bold'>{Math.abs(parseFloat(data?.account?.interest))} {data?.userData?.currency_type}</h2>
                        </div>
                        <div className='w-full h-[.5px] bg-black' />

                        <div className='flex justify-between  mb-4'>
                            <h2>Total</h2>
                            <h2 className='font-bold'>{Math.abs(parseFloat(data?.balanceData?.balance))} {data?.userData?.currency_type}</h2>
                        </div>
                        <div className='flex justify-center gap-1'><button type='button' onClick={() => PayCredit()} className='w-full bg-teal-500 border border-teal-700 text-white rounded py-1.5 transition-all duration-300 hover:bg-teal-600'>Pay</button>
                            <button type='button' onClick={() => { setIsShow(false) }} className='px-2 border transition-all duration-300 border-teal-700 bg-transparent hover:text-white rounded py-1.5 hover:bg-teal-500'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x-lg" viewBox="0 0 16 16">
                                    <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>}
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

export default Payment
