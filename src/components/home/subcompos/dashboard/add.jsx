import axios from 'axios'
import React, { useEffect, useState } from 'react'

const Add = ({ isShow, setIsShow, expenseOrIncome, user, setIsRefresh }) => {
    const [addData, setAddData] = useState({
        amount: '',
        category: '',
        description: '',
        title: '',
        date: new Date().toISOString().split("T")[0],
    })
    const [isProcessing, setIsProcessing] = useState(false)
    const [response, setResponse] = useState(null)


    useEffect(() => {
        setAddData({
            ...addData,
            date: new Date().toISOString().split("T")[0],
            category: expenseOrIncome === "Expense" ? ExpenseCategory[0] : IncomeCategory[0],
        })
    }, [])

    useEffect(() => {
        if (expenseOrIncome === "Expense") {
            setAddData({
                ...addData,
                category: ExpenseCategory[0],
            })
        } else if (expenseOrIncome === "Income") {
            setAddData({
                ...addData,
                category: IncomeCategory[0],
            })
        }
    }, [expenseOrIncome])




    const submitData = async (e) => {
        e.stopPropagation()
        e.preventDefault()

        if (addData.amount.length === 0 || addData.category.length === 0 || addData.date.length === 0) {
            setResponse({
                type: "error",
                message: "Please fill all the fields"
            })
            return
        }

        setIsProcessing(true)
        setResponse(null)
        try {
            const res = await axios.post(import.meta.env.VITE_BACKEND_BASE_URL + import.meta.env.VITE_ADD_EXPENSE_INCOME_API_EP, {
                amount: addData.amount,
                category: addData.category,
                description: addData.description,
                date: addData.date,
                title: addData.title,
                userUID: user.userUID,
                type: expenseOrIncome
            })


            setResponse({
                type: "success",
                message: res.data.message
            })
            setIsShow(false)
            setResponse(null)
            e.target.reset()
            setIsRefresh(true)


        } catch (err) {
            console.log(err)
            setResponse({
                type: "error",
                message: err?.response?.data?.message
            })
        } finally {
            setIsProcessing(false)

        }
    }
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
                            border: 1px solid #EEF2F5;
                            background-color: #EEF2F5;
                            }
                        `}
                    </style>
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
                        <select onChange={(e) => setAddData({ ...addData, category: e.target.value })} type="text" name="category" id="category" className='w-full border border-gray-300 rounded px-2 py-1' >
                            {expenseOrIncome === "Income" ? IncomeCategory.map((item, index) => <option key={index}>{item}</option>) : ExpenseCategory.map((item, index) => <option key={index}>{item}</option>)}
                        </select>
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
    "Rent",
    "Utilities",
    "Groceries",
    "Transportation",
    "Healthcare/Medical",
    "Insurance",
    "Education",
    "Entertainment",
    "Dining Out",
    "Clothing",
    "Debt Payments",
    "Savings/Investments",
    "Gifts/Donations",
    "Miscellaneous",
]

export const IncomeCategory = [
    "Salary",
    "Freelancing",
    "Business",
    "Investments",
    "Interest",
    "Rental Income",
    "Dividends",
    "Gifts",
    "Bonuses",
    "Others",
]