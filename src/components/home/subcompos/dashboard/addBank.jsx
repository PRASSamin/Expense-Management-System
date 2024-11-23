import axios from 'axios';
import { useState } from 'react';
import cookies from 'js-cookie';
import { getMyData } from '../../../../utils';
import { Spinner } from '../baccount/detailedAccount';
import { useAppContext } from '../../../../root';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Select from 'react-select';


const AddBank = ({ isShow, setIsShow, expenseOrIncome, user, setIsRefresh }) => {
    const [addData, setAddData] = useState({
        account_number: '',
        account_type: 'genaral',
        account_name: '',
        mobile_bank: '',
        is_default: false,
        transfer_rate: 0,
    });
    const [isProcessing, setIsProcessing] = useState(false);
    const { refreshApp } = useAppContext();
    const [isOther, setIsOther] = useState(false);

    const validate = () => {
        let validationErrors = {};

        if (!addData.account_number && addData.account_type !== 'cash') {
            validationErrors = 'Invalid account number';
        }
        if (!addData.account_type) validationErrors = 'Account type is required';
        if (!addData.account_name) validationErrors = 'Account title is required';
        if (['credit', 'loan'].includes(addData.account_type) && !addData.interest_rate) validationErrors = 'Interest rate is required';
        if (['credit'].includes(addData.account_type) && !addData.credit_limit) validationErrors = 'Credit limit is required';
        if (['loan'].includes(addData.account_type) && !addData.loan_amount) validationErrors = 'Loan amount is required';

        toast.error(validationErrors);
        return Object.keys(validationErrors).length === 0;
    };

    const submitData = async (e) => {
        e.stopPropagation();
        e.preventDefault();

        if (!validate()) return;

        setIsProcessing(true);
        try {
            const requestData = {
                account_number: addData.account_type === 'cash' ? '' : addData.account_number,
                account_type: addData.account_type,
                account_name: addData.account_name,
                mobile_bank: addData.mobile_bank,
                is_default: addData.is_default,
                transfer_rate: addData.transfer_rate,
            };

            if (addData.account_type === 'credit') {
                requestData.interest_rate = addData.interest_rate;
                requestData.credit_limit = addData.credit_limit;
            } else if (addData.account_type === 'loan') {
                requestData.loan_amount = addData.loan_amount;
                requestData.interest_rate = addData.interest_rate;
            }


            const res = await axios.post(
                `${import.meta.env.VITE_BACKEND_BASE_URL}${import.meta.env.VITE_ADD_BANK_ACCOUNT_API_EP}?u=${user.userUID}`,
                requestData
            )

            const userRes = await getMyData(user.userUID)
            cookies.set('userData', userRes.data, { expires: 30 });
            setIsShow(false);
            setIsRefresh(true);
            setAddData(null);
            refreshApp();
            e.target.reset();
        } catch (err) {
            toast.error(err?.response?.data?.message);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div onClick={() => setIsShow(!isShow)} className={`w-full h-screen z-50 flex justify-center items-center fixed top-0 left-0 bg-black bg-opacity-50 ${isShow ? "block" : "hidden"}`}>
            <div onClick={(e) => e.stopPropagation()} className='w-[calc(100%-32px)] md:w-auto aspect-[3/4] h-[75%] p-3 z-50 bg-white rounded shadow-lg'>
                <div className='flex justify-between items-center border-b pb-3 border-gray-300'><h1 className='text-3xl font-bold text-black'>Add a {expenseOrIncome.toLowerCase()}</h1>
                    <button onClick={() => setIsShow(!isShow)} className='mr-2 p-1 rounded border border-[#a154ff] bg-[#e4cdff] hover:bg-[#ca9eff] cursor-pointer'>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="text-[#a154ff]" viewBox="0 0 16 16">
                            <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
                        </svg>
                    </button></div>
                <form onSubmit={submitData} className='flex flex-col justify-between h-[calc(100%-49px)] pt-3'>
                    <style>
                        {`
                            label {
        font-weight: 500;
        font-size: 14px;
        }
        input, select, textarea {
        outline: none;
        border: 1px solid hsl(0, 0%, 80%);
        background-color: hsl(0, 0%, 100%);
        cursor: pointer;
        transition: all 100ms;
        -webkit-transition: all 100ms;
        }
        input:hover , select:hover , textarea:hover {
        border: 1px solid hsl(0, 0%, 70%);
        }

        [data-lastpass-icon-root] {
        display: none;
        }
                        `}
                    </style>

                    <div className='flex flex-col gap-3'>
                        <div>
                            <label htmlFor="account_type">Account Type<span className='text-red-500'>*</span></label>
                            <Select
                                options={[
                                    { value: 'genaral', label: 'Bank Account' },
                                    { value: 'credit', label: 'Credit Card' },
                                    { value: 'debit', label: 'Debit Card' },
                                    { value: 'mobile', label: 'Mobile Wallet' },
                                    { value: 'loan', label: 'Loan Account' },
                                    { value: 'cash', label: 'Cash' },
                                    { value: 'other', label: 'Other' }
                                ]}
                                onChange={(selectedOption) => {
                                    if (selectedOption.value === 'other') {
                                        setIsOther(true)
                                    } else {
                                        setAddData({ ...addData, account_type: selectedOption.value })
                                    }
                                }}
                                isDisabled={false}
                            />
                        </div>
                        {isOther && <div>
                            <label htmlFor="account_type">Custom Account<span className='text-red-500'>*</span></label>
                            <input
                                name="account_type" id="account_type"
                                className='w-full border border-gray-300 rounded px-2 py-1' onChange={(e) => {

                                    setAddData({ ...addData, account_type: e.target.value })
                                }

                                } required />

                        </div>}

                        {
                            addData.account_type === 'mobile' &&
                            <div>
                                <label htmlFor="mobile_bank">Mobile Wallet Provider<span className='text-red-500'>*</span></label>
                                <input onChange={(e) => setAddData({ ...addData, mobile_bank: (e.target.value).toLowerCase() })}
                                    type="text"
                                    name="mobile_bank" id="mobile_bank"
                                    placeholder='eg. Paytm, PayPal, Bkash, etc.'
                                    className=' placeholder:text-sm w-full border border-gray-300 rounded px-2 py-1' required />
                            </div>
                        }

                        {addData.account_type !== 'cash' && <div>
                            <label htmlFor="account_number">{addData.account_type === 'debit' || addData.account_type === 'credit' ? 'Card' : 'Account'} Number<span className='text-red-500'>*</span></label>
                            <input onChange={(e) => {
                                setAddData({ ...addData, account_number: e.target.value });
                            }}
                                autoComplete='off' type="number" name="account_number" id="account_number"
                                placeholder='eg. 1234567890'
                                className='placeholder:text-sm w-full border border-gray-300 rounded px-2 py-1' required />
                        </div>}
                        {
                            addData.account_type === 'credit' && (

                                <>
                                    <div>
                                        <label htmlFor="interest_rate">Interest Rate {"(% per annum)"}<span className='text-red-500'>*</span></label>
                                        <input onChange={(e) => setAddData({ ...addData, interest_rate: e.target.value })}
                                            type="number" placeholder='eg. 10' name="interest_rate" id="interest_rate"
                                            className=' placeholder:text-sm w-full border border-gray-300 rounded px-2 py-1' />
                                    </div>
                                    <div>
                                        <label htmlFor="credit_limit">Credit Limit<span className='text-red-500'>*</span></label>
                                        <input onChange={(e) => setAddData({ ...addData, credit_limit: e.target.value })}
                                            type="number" placeholder='eg. 10000' name="credit_limit" id="credit_limit"
                                            className=' placeholder:text-sm w-full border border-gray-300 rounded px-2 py-1' />
                                    </div>
                                </>


                            )
                        }

                        {
                            addData.account_type === 'loan' && (
                                <div className='flex flex-col gap-3'>
                                    <div>
                                        <label htmlFor="interest_rate">Interest Rate {"(% per annum)"}<span className='text-red-500'>*</span></label>
                                        <input onChange={(e) => setAddData({ ...addData, interest_rate: e.target.value })}
                                            type="number" name="interest_rate" id="interest_rate"
                                            placeholder='eg. 10'
                                            className=' placeholder:text-sm w-full border border-gray-300 rounded px-2 py-1' />
                                    </div>
                                    <div>
                                        <label htmlFor="loan_amount">Loan Amount<span className='text-red-500'>*</span></label>
                                        <input onChange={(e) => setAddData({ ...addData, loan_amount: e.target.value })}
                                            type="number" name="loan_amount" id="loan_amount"
                                            placeholder='eg. 10000'
                                            className=' placeholder:text-sm w-full border border-gray-300 rounded px-2 py-1' />
                                    </div>

                                </div>
                            )
                        }



                        <div>
                            <label htmlFor="transfer_rate">Transfer Rate</label>
                            <input placeholder='eg. 1' autoComplete='off' step="0.01" onChange={(e) => setAddData({ ...addData, transfer_rate: e.target.value })}
                                type="number" name="transfer_rate" id="transfer_rate"
                                className='placeholder:text-sm w-full border border-gray-300 rounded px-2 py-1' />
                        </div>
                        <div>
                            <label htmlFor="account_name">Account Title<span className='text-red-500'>*</span></label>
                            <input placeholder='eg. My Bank Account' onChange={(e) => setAddData({ ...addData, account_name: e.target.value })}
                                type="text" name="account_name" id="account_name"
                                className='placeholder:text-sm w-full border border-gray-300 rounded px-2 py-1' />
                        </div>
                    </div>


                    <div className={`flex ${addData.account_type === 'loan' ? 'justify-end' : 'justify-between'}`}>
                        {addData.account_type !== 'loan' && <div className="flex justify-between col-span-1 lg:col-span-2">
                            <div className="flex flex-col sm:flex-row gap-1 sm:items-center">
                                <div className="w-full">
                                    <label
                                        className={`
                                ${addData?.is_default ? "text-white bg-[#a154ff] border-[#a154ff] " : " border-blue-500"}    
                              } text-[14px] w-full  transition-all duration-300 select-none cursor-pointer px-4 py-2
                                block font-medium border outline-none rounded shadow-sm  focus:bg-indigo-400 `}>
                                        <input className='hidden' type="checkbox" onChange={() => setAddData({ ...addData, is_default: !addData.is_default })} />
                                        <span>Set as Default</span>
                                    </label>
                                </div>
                            </div>
                        </div>}
                        <div className='flex justify-end'>
                            <button type="submit" disabled={isProcessing}
                                className={`${isProcessing ?
                                    'px-[36.3px] py-[10.5px]' : 'px-3 py-2'
                                    }  text-white bg-[#a154ff] hover:bg-[#7e35d8] font-bold rounded `}>
                                {isProcessing ? (
                                    <Spinner />
                                ) : 'Add Card'}
                            </button>
                        </div>

                    </div>
                </form>
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
        </div>
    );
};

export default AddBank;