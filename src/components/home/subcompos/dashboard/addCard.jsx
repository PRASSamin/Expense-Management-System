import axios from 'axios';
import React, { useEffect, useState } from 'react';
import cookies from 'js-cookie';
import { getMyData } from '../../../../utils';
import valid from 'card-validator';

const AddCard = ({ isShow, setIsShow, expenseOrIncome, user, setIsRefresh, isRefresh }) => {
    const [addData, setAddData] = useState({
        card_type: '',
        card_category: '',
        card_number: '',
        expiry_date: '',
        cardholder_name: '',
        cvv: '',
        bank_name: '',
        is_default: false
    });
    const [errors, setErrors] = useState({});
    const [isProcessing, setIsProcessing] = useState(false);
    const [response, setResponse] = useState(null);

    const validate = () => {
        let validationErrors = {};

        const cardNumberValidation = valid.number(addData.card_number);
        if (!cardNumberValidation.isValid) {
            validationErrors.card_number = 'Invalid card number';
        } else {
            console.log(cardNumberValidation)
            setAddData({ ...addData, card_type: cardNumberValidation.card.type });
        }

        const expirationDateValidation = valid.expirationDate(addData.expiry_date);
        if (!expirationDateValidation.isValid) {
            validationErrors.expiry_date = 'Invalid expiry date';
        }

        const cvvValidation = valid.cvv(addData.cvv);
        if (!cvvValidation.isValid) {
            validationErrors.cvv = 'Invalid CVV';
        }

        if (!addData.card_category) validationErrors.card_category = 'Card category is required';
        if (!addData.cardholder_name) validationErrors.cardholder_name = 'Cardholder name is required';

        setErrors(validationErrors);
        return Object.keys(validationErrors).length === 0;
    };

    const submitData = async (e) => {
        e.stopPropagation();
        e.preventDefault();

        if (!validate()) return;

        if (!addData.card_type) return;
        setIsProcessing(true);
        setResponse(null);
        try {
            const res = await axios.post(`${import.meta.env.VITE_BACKEND_BASE_URL}${import.meta.env.VITE_ADD_CARD_API_EP}?u=${user.userUID}`, {
                card_type: addData.card_type,
        card_category: addData.card_category,
        card_number: (addData.card_number).replace(/\s/g, ""),
        expiry_date: addData.expiry_date,
        cardholder_name: addData.cardholder_name,
        cvv: addData.cvv,
        bank_name: addData.bank_name,
        is_default: addData.is_default
            });

            const userRes = await getMyData(user.userUID)
            cookies.set('userData', userRes.data);
            setIsShow(false);
            setIsRefresh(true);
            setAddData(null);
            setResponse(null);
            e.target.reset();
        } catch (err) {
            setResponse({ type: "error", message: err?.response?.data?.message });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div onClick={() => setIsShow(!isShow)} className={`w-full h-screen z-50 flex justify-center items-center fixed top-0 left-0 bg-black bg-opacity-50 ${isShow ? "block" : "hidden"}`}>
            <div onClick={(e) => e.stopPropagation()} className='w-[calc(100%-32px)] md:w-[70%] p-3 z-50 bg-white rounded shadow-lg'>
                <div className='flex justify-between items-center border-b pb-3 border-gray-300'><h1 className='text-3xl font-bold text-black'>Add a {expenseOrIncome.toLowerCase()}</h1>
                    <button onClick={() => setIsShow(!isShow)} className='mr-2 p-1 rounded border border-emerald-600 bg-emerald-100 hover:bg-emerald-200 cursor-pointer'>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="text-emerald-600" viewBox="0 0 16 16">
                            <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
                        </svg>
                    </button></div>
                <form onSubmit={submitData} className='flex flex-col gap-3 pt-3'>
                    <style>
                        {`
        label {
        font-weight: bold;
        }
        input, select {
        outline: none;
        border: 1px solid #EEF2F5;
        background-color: #EEF2F5;
        cursor: pointer;
        }

        [data-lastpass-icon-root] {
        display: none;
        }
        `}
                    </style>

                    <div>
                        <label htmlFor="card_category">Card Category<span className='text-red-500'>*</span></label>
                        <select onChange={(e) => setAddData({ ...addData, card_category: e.target.value })}
                            name="card_category" id="card_category"
                            className='w-full border border-gray-300 rounded px-2 py-1' required>
                            <option value="">Select Card Category</option>
                            <option value="Debit">Debit</option>
                            <option value="Credit">Credit</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="card_number">Card Number<span className='text-red-500'>*</span></label>
                        <input onChange={(e) => {
                            setAddData({ ...addData, card_number: e.target.value });
                        }}
                            type="text" name="card_number" id="card_number"
                            className='w-full border border-gray-300 rounded px-2 py-1' required />
                        {errors.card_number && <p className="text-red-500 text-sm">{errors.card_number}</p>}
                    </div>

                    <div>
                        <label htmlFor="expiry_date">Expiry Date<span className='text-red-500'>*</span></label>
                        <input onChange={(e) => setAddData({ ...addData, expiry_date: e.target.value })}
                            type="month" name="expiry_date" id="expiry_date"
                            className=' w-full border border-gray-300 rounded px-2 py-1' required />
                        {errors.expiry_date && <p className="text-red-500 text-sm">{errors.expiry_date}</p>}
                    </div>

                    <div>
                        <label htmlFor="cardholder_name">Cardholder Name<span className='text-red-500'>*</span></label>
                        <input onChange={(e) => setAddData({ ...addData, cardholder_name: e.target.value })}
                            type="text" name="cardholder_name" id="cardholder_name"
                            className='w-full border border-gray-300 rounded px-2 py-1' required />
                        {errors.cardholder_name && <p className="text-red-500 text-sm">{errors.cardholder_name}</p>}
                    </div>

                    <div>
                        <label htmlFor="cvv">CVV<span className='text-red-500'>*</span></label>
                        <input onChange={(e) => setAddData({ ...addData, cvv: e.target.value })}
                            type="number" name="cvv" id="cvv"
                            className=' number-input w-full border border-gray-300 rounded px-2 py-1' required />
                        {errors.cvv && <p className="text-red-500 text-sm">{errors.cvv}</p>}
                    </div>

                    <div>
                        <label htmlFor="bank_name">Bank Name</label>
                        <input onChange={(e) => setAddData({ ...addData, bank_name: e.target.value })}
                            type="text" name="bank_name" id="bank_name"
                            className='w-full border border-gray-300 rounded px-2 py-1' />
                    </div>

                    <div className="flex justify-between col-span-1 lg:col-span-2">
                        <div className="flex flex-col sm:flex-row gap-1 sm:items-center">
                            <div className="w-full">
                                <label
                                    className={`
                            ${addData?.is_default ? "text-white bg-emerald-400 border-emerald-500 " : " border-blue-500"}    
                          } text-[14px] w-full  transition-all duration-300 select-none cursor-pointer px-4 py-2
                            block font-medium border outline-none rounded shadow-sm  focus:bg-indigo-400 `}>
                                    <input className='hidden' type="checkbox" onChange={() => setAddData({ ...addData, is_default: !addData.is_default })} />
                                    <span>Set as Default</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className='flex justify-end'>
                        <button type="submit" disabled={isProcessing}
                            className='p-3 text-white bg-emerald-500 hover:bg-emerald-600 rounded'>
                            {isProcessing ? 'Processing...' : 'Add Card'}
                        </button>
                    </div>

                    {response && (
                        <div className={`p-4 mt-4 rounded ${response.type === "error" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
                            {response.message}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default AddCard;
