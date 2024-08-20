import axios from 'axios';
import React, { useEffect, useState, useRef } from 'react';
import Cookies from 'js-cookie';
import { ClassNames } from '@emotion/react';

const Add = ({ isShow, setIsShow, expenseOrIncome, user, setIsRefresh, isRefresh }) => {

    const defaultCard = user?.cards?.find(card => {
        if (expenseOrIncome === 'Income') {
            return card?.is_default === true && card?.card_category === 'Debit';
        } else {
            return card?.is_default === true;
        }
    });
    const [addData, setAddData] = useState({
        amount: '',
        category: '',
        description: '',
        title: '',
        date: new Date().toISOString().split("T")[0],
        card_number: defaultCard?.card_number || '',
    });


    const dropdownRef = useRef(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [response, setResponse] = useState(null);
    const [isOtherShow, setIsOtherShow] = useState(false);
    const [categories, setCategories] = useState({ expenses: [], incomes: [] });
    const [isDropDownOpen, setIsDropDownOpen] = useState(false);
    const [selectedCardType, setSelectedCardType] = useState(defaultCard?.card_category || 'Debit');


    useEffect(() => {
        const storedCategories = JSON.parse(localStorage.getItem('userCategory')) || { expense: [], income: [] };

        const arrangeCategories = (defaultCategories, storedCategories) => {
            const withoutOther = defaultCategories.filter(category => category !== 'other');
            const combinedCategories = [...new Set([...withoutOther, ...storedCategories])];
            return [...combinedCategories, 'other'];
        };

        setCategories({
            expenses: arrangeCategories(ExpenseCategory, storedCategories.expense),
            incomes: arrangeCategories(IncomeCategory, storedCategories.income),
        });
    }, [isProcessing]);


    useEffect(() => {
        setAddData(prevData => ({
            ...prevData,
            category: expenseOrIncome === "Expense" ? ExpenseCategory[0] : IncomeCategory[0],
        }));
    }, [expenseOrIncome]);

    const submitData = async (e) => {
        e.stopPropagation();
        e.preventDefault();

        if (!addData.amount || !addData.category || !addData.date) {
            setResponse({ type: "error", message: "Please fill all the fields" });
            return;
        }

        const newCategory = addData.category.toLowerCase();
        const userCategory = JSON.parse(localStorage.getItem("userCategory")) || { expense: [], income: [] };

        if (expenseOrIncome === "Expense" && !userCategory.expense.includes(newCategory)) {
            userCategory.expense.push(newCategory);
        } else if (expenseOrIncome === "Income" && !userCategory.income.includes(newCategory)) {
            userCategory.income.push(newCategory);
        }

        localStorage.setItem("userCategory", JSON.stringify(userCategory));

        setIsProcessing(true);
        setResponse(null);
        try {
            const res = await axios.post(import.meta.env.VITE_BACKEND_BASE_URL + import.meta.env.VITE_ADD_EXPENSE_INCOME_API_EP, {
                amount: addData.amount,
                category: addData.category,
                description: addData.description,
                date: addData.date,
                title: addData.title,
                userUID: user.userUID,
                type: expenseOrIncome,
                card_number: addData.card_number
            });

            setIsShow(false);
            setIsRefresh(true);
            setAddData(null);
            setResponse(null);
            e.target.reset();
        } catch (err) {
            console.log(err);
            setResponse({ type: "error", message: err?.response?.data?.message });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div onClick={() => setIsShow(!isShow)} className={`w-full h-screen z-50 flex justify-center items-center fixed top-0 left-0 bg-black bg-opacity-50 ${isShow ? "block" : "hidden"}`}>
            <div onClick={(e) => e.stopPropagation()} className='w-[calc(100%-32px)] md:w-[70%] p-3 z-50 bg-white rounded shadow-lg'>
                <div className='flex justify-between items-center border-b pb-3 border-gray-300'><h1 className='text-3xl font-bold text-black'>New {expenseOrIncome}</h1>
                    <button onClick={() => setIsShow(!isShow)} className='mr-2 p-1 rounded border border-emerald-600 bg-emerald-100 hover:bg-emerald-200 cursor-pointer'>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="text-emerald-600" viewBox="0 0 16 16">
                            <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
                        </svg>
                    </button></div>
                <form onSubmit={submitData} className='flex flex-col gap-3 pt-3' >
                    <style>
                        {`
                            label {
                            font-weight: bold;
                            }
                            input, textarea, select {
                            outline: none;
                            background-color: #EEF2F5;
                            }
                        `}
                    </style>
                    <div>
                        <label htmlFor="gender"
                            className={``} >Card<span className='text-red-500'>*</span></label>
                        <div className=' bg-[#EEF2F5]  rounded-md w-full border border-gray-300 flex items-center justify-center w-full py-2 px-1 gap-5'>
                            <div className='flex flex-col w-full'>
                            <div ref={dropdownRef} className="z-20 relative">
    <div className="select-component">
        <div className="custom-select">
            <div
                className={`${addData?.card_number ? "text-[#000000]" : "text-[#a7a7a7]"} selected-option px-1 flex items-center justify-between text-[15px]`}
                onClick={() => setIsDropDownOpen(!isDropDownOpen)}
            >
                {addData?.card_number ? addData.card_number : "Select Card"}
                <svg
                    className={`w-4 h-4 ml-2 inline-block transform ${isDropDownOpen ? "rotate-180" : "rotate-0"
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
            {isDropDownOpen && (
                <div className={`${isDropDownOpen ? "max-h-[100px]" : "h-0"} transition-all duration-300 select-none options-container overflow-y-auto absolute mt-1 bg-white border border-gray-400 w-full rounded-b-lg shadow-lg`}>
                    {(expenseOrIncome === 'Income' ? 
                        user?.cards.filter(card => card.card_category === 'Debit') : 
                        user?.cards.filter(card => card.card_category === 'Credit' || card.card_category === 'Debit')
                    )
                    .sort((a, b) => a.is_active === b.is_active ? 0 : a.is_active ? -1 : 1)
                    .map((option, i) => (
                        <button
                            type="button"
                            disabled={!option.is_active}
                            key={i}
                            className={`w-full text-left relative font-medium option hover:bg-gray-200 py-[6px] px-[8px] text-[13px] cursor-pointer ${addData.card_number === option.card_number ? "bg-gray-200" : ""}`}
                            onClick={() => {
                                setAddData({
                                    ...addData,
                                    card_number: option.card_number
                                });
                                setIsDropDownOpen(false);
                                setSelectedCardType(option.card_category);
                            }}
                        >
                            {option.card_number} ({option.card_type})
                            {!option.is_active && (
                                <div className="bg-[#000000]/30 absolute inset-0 flex items-center justify-center text-red-500 text-md font-bold">
                                    Deactivated
                                </div>
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
                        <label htmlFor="title">Title<span className='text-red-500'>*</span></label>
                        <input onChange={(e) => setAddData({ ...addData, title: e.target.value })} type="text" name="title" id="title" className='w-full border border-gray-300 rounded px-2 py-1' />
                    </div>
                    <div>
                        <label htmlFor="description">Description</label>
                        <textarea onChange={(e) => setAddData({ ...addData, description: e.target.value })} rows={3} type="text" name="description" id="description" className='w-full border border-gray-300 rounded px-2 py-1 resize-none' />
                    </div>
                    <div>
                        <label htmlFor="amount">Amount<span className='text-red-500'>*</span></label>
                        <input onChange={(e) => setAddData({ ...addData, amount: e.target.value })} type="number" name="amount" id="amount" className='w-full border border-gray-300 rounded px-2 py-1' />
                    </div>
                    <div>
                        <label htmlFor="category">Category<span className='text-red-500'>*</span></label>
                        <select onChange={(e) => {
                            if (e.target.value === "other") {
                                setIsOtherShow(true)
                                return
                            }
                            
                            setIsOtherShow(false)
                            setAddData({ ...addData, category: (e.target.value).toLowerCase() })
                        }} type="text" name="category" id="category" className='w-full border border-gray-300 rounded px-2 py-1' >
                            {(expenseOrIncome === "Income" ? (categories.incomes.length > 0 && (categories.incomes).map((item, index) => <option className={``} key={index}>{item}</option>)) : (categories.expenses.length > 0 && (categories.expenses).map((item, index) => <option className={``} key={index}>{item}</option>)))}
                        </select>
                    </div>
                    <div className={`${isOtherShow ? "block" : "hidden"}`} >
                        <label htmlFor="other">Other Category<span className='text-red-500'>*</span></label>
                        <input onChange={(e) => {
                            const userCategory = localStorage.getItem("userCategory")
                            if (userCategory) {
                                if (userCategory.includes(e.target.value)) {
                                    setAddData({ ...addData, category: (e.target.value).toLowerCase() })
                                    return
                                }
                            }
                            setAddData({ ...addData, category: (e.target.value).toLowerCase() })
                        }} type="text" name="other" id="other" className='w-full border border-gray-300 rounded px-2 py-1' />
                    </div>
                    <div>
                        <label htmlFor="date">Date<span className='text-red-500'>*</span></label>
                        <input onChange={(e) => setAddData({ ...addData, date: e.target.value })} type="date"
                            defaultValue={new Date().toISOString().split("T")[0]}
                            name="date" id="date" className='w-full border border-gray-300 rounded px-2 py-1' />
                    </div>

                    {response?.message ? (
                        <p className={`${response.type === "success" ? "text-emerald-500" : "text-red-500"} text-sm`}>{response.message}</p>
                    ) : null}
                    <button type="submit" className='bg-blue-500 text-white px-3 py-2 mt-2 rounded flex items-center justify-center'>{isProcessing ? (
                        <div>
                            <svg className="text-gray-100 animate-spin w-[24px] h-[24px]" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M32 3C35.8083 3 39.5794 3.75011 43.0978 5.20749C46.6163 6.66488 49.8132 8.80101 52.5061 11.4939C55.199 14.1868 57.3351 17.3837 58.7925 20.9022C60.2499 24.4206 61 28.1917 61 32C61 35.8083 60.2499 39.5794 58.7925 43.0978C57.3351 46.6163 55.199 49.8132 52.5061 52.5061C49.8132 55.199 46.6163 57.3351 43.0978 58.7925C39.5794 60.2499 35.8083 61 32 61C28.1917 61 24.4206 60.2499 20.9022 58.7925C17.3837 57.3351 14.1868 55.199 11.4939 52.5061C8.801 49.8132 6.66487 46.6163 5.20749 43.0978C3.7501 39.5794 3 35.8083 3 32C3 28.1917 3.75011 24.4206 5.2075 20.9022C6.66489 17.3837 8.80101 14.1868 11.4939 11.4939C14.1868 8.80099 17.3838 6.66487 20.9022 5.20749C24.4206 3.7501 28.1917 3 32 3L32 3Z"
                                    stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"></path>
                                <path
                                    d="M32 3C36.5778 3 41.0906 4.08374 45.1692 6.16256C49.2477 8.24138 52.7762 11.2562 55.466 14.9605C58.1558 18.6647 59.9304 22.9531 60.6448 27.4748C61.3591 31.9965 60.9928 36.6232 59.5759 40.9762"
                                    stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" className="text-[#000000]">
                                </path>
                            </svg>
                        </div>
                    ) : "Add"}</button>
                </form>
            </div>
        </div>
    )
}

export default Add


export const ExpenseCategory = [
    "rent",
    "utilities",
    "groceries",
    "transportation",
    "healthcare/medical",
    "insurance",
    "education",
    "entertainment",
    "dining Out",
    "clothing",
    "debt payments",
    "savings/investments",
    "gifts/donations",
    "miscellaneous",
    "other",
]

export const IncomeCategory = [
    "salary",
    "freelancing",
    "business",
    "investments",
    "interest",
    "rental income",
    "dividends",
    "gifts",
    "bonuses",
    "other",
]
