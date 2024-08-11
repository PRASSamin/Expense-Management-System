import React, { useEffect, useState } from 'react'
import Add from './dashboard/add'
import Table from './global/table'
import axios from 'axios'
import Cookies from 'js-cookie'
import { useNavigate } from 'react-router-dom'

const Incomes = ({ userData }) => {
    const [isAddShow, setIsAddShow] = useState(false)
    const [isRefresh, setIsRefresh] = useState(false)

    const navigate = useNavigate()


    return (
        <main className='mt-[70px] overflow-auto px-2 grid grid-cols-1 min-h-screen md:grid-cols-2 gap-4'>
            <div className='col-span-1 md:col-span-2 flex flex-col gap-4'>
                <button onClick={() => {
                     if (!Cookies.get('userData')) {
                        navigate('/login')
                        return
                      }
                    setIsAddShow(!isAddShow)}} className='w-full bg-[#4495E4] px-3 rounded-md w-full shadow hover:bg-[#006cd8] transition-all duration-300  flex items-center
                font-bold text-white text-[14px] justify-center w-full py-2.5 gap-5'>
                    New Income
                </button>
                <Table isRefresh={isRefresh} setIsRefresh={setIsRefresh} userData={userData} type={"Income"}/>
            </div>

            <Add isShow={isAddShow} user={userData} setIsShow={setIsAddShow} setIsRefresh={setIsRefresh} expenseOrIncome={"Income"} />
        </main>
    )
}

export default Incomes
