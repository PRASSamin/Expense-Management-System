import React, { useEffect, useState } from 'react'
import Add from './dashboard/add'
import Table from './global/table'
import axios from 'axios'
import Cookies from 'js-cookie'
import { useNavigate } from 'react-router-dom'

const Expenses = ({ userData }) => {
    const [isAddShow, setIsAddShow] = useState(false)
    const [isRefresh, setIsRefresh] = useState(false)

    const navigate = useNavigate()



    return (
        <main className='mt-[70px] overflow-auto px-2 grid grid-cols-1 min-h-[calc(100vh-70px)] md:grid-cols-2 gap-4  pras-ov'>
            <div className='col-span-1 md:col-span-2 flex flex-col gap-4 pras-ov'>
                <button onClick={() => {
                    if (!Cookies.get('userData')) {
                        navigate('/login')
                        return
                    }
                    setIsAddShow(!isAddShow)
                }} className='w-full bg-[#4495E4] px-3 rounded-md w-full shadow hover:bg-[#006cd8] transition-all duration-300  flex items-center
                font-bold text-white text-[14px] justify-center w-full py-2.5 gap-5'>
                    New Expense
                </button>
                <Table isRefresh={isRefresh} setIsRefresh={setIsRefresh} userData={userData} type={"Expense"} />
            </div>

            <Add isRefresh={isRefresh} isShow={isAddShow} user={userData} setIsShow={setIsAddShow} setIsRefresh={setIsRefresh} expenseOrIncome={"Expense"} />
        </main>
    )
}

export default Expenses
