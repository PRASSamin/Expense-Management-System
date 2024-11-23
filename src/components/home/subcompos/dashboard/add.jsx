import axios from 'axios';
import React, { useEffect, useState, useRef } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Select from 'react-select';

const Add = ({ isShow, setIsShow, expenseOrIncome, user, setIsRefresh, isRefresh }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [isOtherShow, setIsOtherShow] = useState(false);
    const [categories, setCategories] = useState({ expenses: [], incomes: [] });

    const [accounts, setAccounts] = useState([]);

    const defaultAccount = accounts?.find(account => {
        return account?.is_default === true
    });



    const [addData, setAddData] = useState({
        amount: '',
        category: '',
        description: '',
        title: '',
        date: new Date().toISOString().split("T")[0],
        account_id: defaultAccount?.id || '',
        account_label: defaultAccount?.account_type === 'cash' ? (
            `${(defaultAccount?.account_name)?.split(' ')
                ?.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                ?.join(' ')} (Cash)`
        ) : (
            `${defaultAccount?.account_name + "-" + defaultAccount?.account_number} (${defaultAccount?.account_type === 'mobile' ? `${defaultAccount?.mobile_bank}` :
                defaultAccount?.account_type === 'debit' ? 'Debit Card' :
                    defaultAccount?.account_type === 'credit' ? 'Credit Card' :
                        defaultAccount?.account_type === 'genaral' ? 'Bank Account' : defaultAccount?.account_type === 'cash' ? 'Cash' : defaultAccount?.account_type})`
        )
    });


    useEffect(() => {
        setAddData({
            ...addData,
            account_id: defaultAccount?.id,
            account_label: defaultAccount?.account_type === 'cash' ? (
                `${(defaultAccount?.account_name)?.split(' ')
                    ?.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                    ?.join(' ')} (Cash)`
            ) : (
                `${defaultAccount?.account_name + "-" + defaultAccount?.account_number} (${defaultAccount?.account_type === 'mobile' ? `${defaultAccount?.mobile_bank}` :
                    defaultAccount?.account_type === 'debit' ? 'Debit Card' :
                        defaultAccount?.account_type === 'credit' ? 'Credit Card' :
                            defaultAccount?.account_type === 'genaral' ? 'Bank Account' : defaultAccount?.account_type === 'cash' ? 'Cash' : defaultAccount?.account_type})`
            )
        })
    }, [defaultAccount]);



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


    const fetchAccounts = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_BASE_URL}${import.meta.env.VITE_GET_USER_BANK_ACCOUNTS_API_EP}?u=${user.userUID}`);
            if (res?.data?.data?.length === 0) {
                toast.error("You don't have any accounts. Please add one.", {
                    autoClose: false
                });
                document.getElementById("submit").disabled = true;
            } else {

                let filteredAccounts = res.data.data;

                if ((expenseOrIncome === "Income")) {
                    filteredAccounts = res.data.data.filter(account => account.account_type !== "credit" && account.account_type !== "loan");
                } else if ((expenseOrIncome === "Expense")) {
                    filteredAccounts = res.data.data.filter(account => account.account_type !== "loan");
                }

                setAccounts(filteredAccounts);

            }
        } catch (err) {
            if (err?.response?.data?.data?.length === 0) {
                toast.error("You don't have any accounts. Please add one.", {
                    autoClose: false
                });
                document.getElementById("submit").disabled = true;
            }
            console.log(err);
        } 

    };


    useEffect(() => {
        fetchAccounts();
    }, []);


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
            toast.error("Please fill all the fields");
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
        try {
            const res = await axios.post(import.meta.env.VITE_BACKEND_BASE_URL + import.meta.env.VITE_ADD_EXPENSE_INCOME_API_EP, {
                amount: addData.amount,
                category: addData.category,
                description: addData.description,
                date: addData.date,
                title: addData.title,
                userUID: user.userUID,
                type: expenseOrIncome,
                account_id: addData.account_id
            });

            setIsShow(false);
            setIsRefresh(true);
            setAddData(null);
            e.target.reset();
        } catch (err) {
            console.log(err);
            toast.error(err?.response?.data?.message);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div onClick={() => setIsShow(!isShow)} className={`w-full h-screen z-50 flex justify-center items-center fixed top-0 left-0 bg-black bg-opacity-50 ${isShow ? "block" : "hidden"}`}>
            <div onClick={(e) => e.stopPropagation()} className='w-[calc(100%-32px)] md:w-[70%] p-3 z-50 bg-white rounded shadow-lg'>
                <div className='flex justify-between items-center border-b pb-3 border-gray-300'><h1 className='text-3xl font-bold text-black'>New {expenseOrIncome}</h1>
                    <button onClick={() => setIsShow(!isShow)} className={`mr-2 p-1 rounded border ${expenseOrIncome === "Expense" ? "border-red-600 bg-red-200 hover:bg-red-300" : "border-emerald-600 bg-emerald-100 hover:bg-emerald-200"} cursor-pointer`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className={`${expenseOrIncome === "Expense" ? "text-red-600" : "text-emerald-600"}`} viewBox="0 0 16 16">
                            <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
                        </svg>
                    </button></div>
                <form onSubmit={submitData} className='flex flex-col gap-3 pt-3' >
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
                    <div>
                        <label htmlFor="account"
                            className={``} >Account<span className='text-red-500'>*</span></label>
                        {/* <div className='   rounded-md border border-gray-300 flex items-center justify-center w-full py-2 px-1 gap-5'> */}
                        <div className='flex flex-col w-full'>
                            <Select
                                options={accounts.map(account => ({
                                    value: account.id,
                                    label: `${account.account_name} - ${account.account_number} (${account?.account_type === 'mobile' ? account.mobile_bank :
                                        account.account_type === 'debit' ? 'Debit Card' :
                                            account.account_type === 'credit' ? 'Credit Card' :
                                                account.account_type === 'genaral' ? 'Bank Account' : account.account_type === 'cash' ? 'Cash' : account.account_type})`,
                                }))}
                                onChange={(selectedOption) => {
                                    setAddData({
                                        ...addData,
                                        account_id: selectedOption.value
                                    });
                                }}
                                isDisabled={false}
                            />

                        </div>

                        {/* </div> */}
                    </div>

                    <div>
                        <label htmlFor="title">Title<span className='text-red-500'>*</span></label>
                        <input placeholder='eg. Salary' onChange={(e) => setAddData({ ...addData, title: e.target.value })} type="text" name="title" id="title" className=' placeholder:text-sm w-full border border-gray-300 rounded px-2 py-1' />
                    </div>
                    <div>
                        <label htmlFor="description">Description</label>
                        <textarea onChange={(e) => setAddData({ ...addData, description: e.target.value })} rows={3} type="text" name="description" id="description" className='w-full border border-gray-300 rounded px-2 py-1 resize-none' />
                    </div>
                    <div>
                        <label htmlFor="amount">Amount<span className='text-red-500'>*</span></label>
                        <input placeholder='eg. 5000' onChange={(e) => setAddData({ ...addData, amount: e.target.value })} type="number" name="amount" step={0.01} id="amount" className='placeholder:text-sm w-full border border-gray-300 rounded px-2 py-1' />
                    </div>
                    <div>
                        <label htmlFor="category">Category<span className='text-red-500'>*</span></label>
                        <Select
                            options={expenseOrIncome === "Expense" ? categories.expenses.map((item, index) => ({ value: item, label: item })) : categories.incomes.map((item, index) => ({ value: item, label: item }))}
                            onChange={(selectedOption) => {
                                if (selectedOption.value === "other") {
                                    setIsOtherShow(true)
                                    return
                                }

                                setIsOtherShow(false)
                                setAddData({ ...addData, category: selectedOption.value })
                            }}
                            isDisabled={false}
                        />
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

                    <button id='submit' type="submit" className={`disabled:cursor-not-allowed ${expenseOrIncome === "Income" ? 'bg-green-500 hover:bg-green-600' : 'bg-[#ff4040] hover:bg-[#ff1c1c]'}  transition-all duration-300 text-white px-3 py-2 mt-2 rounded flex items-center justify-center`}>{isProcessing ? (
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
