import React from 'react'
import { useNavigate } from 'react-router-dom'
import Cookies from 'js-cookie'

const QuickAcc = ({ setIsAddShow, setAddExpenseOrIncome, isAddShow }) => {
  const navigate = useNavigate()
  return (
    <div className=' bg-white shadow rounded col-span-1 md:col-span-2'>
      <h1 className='w-full text-left text-[#000] text-[12px] md:text-[14px] font-[500] font-bold border-b px-2 py-1.5'>Quick Access</h1>
      <div className="px-2 py-2 flex-col  sm:flex-row flex items-center gap-2">
        <button onClick={() => {
          if (!Cookies.get('userData')) {
            navigate('/login')
            return
          }
          setIsAddShow(!isAddShow)
          setAddExpenseOrIncome('Income')
        }} className='w-full sm:w-auto h-full px-6 flex items-center  gap-2 py-8 bg-[#F8F8FA] justify-center hover:bg-[#cecece] transition-all duration-300 rounded'>
          <div className='flex items-center gap-2 p-3 bg-[#00eaea] rounded-full'>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="text-[#006a6a]" viewBox="0 0 16 16">
              <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v1h14V4a1 1 0 0 0-1-1zm13 4H1v5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1z" />
              <path d="M2 10a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1z" />
            </svg>
          </div>
          <h1 className=' text-[#000] text-[12px] md:text-[14px] font-[500] font-bold text-left '>+New Income</h1>
        </button>
        <button onClick={() => {
          if (!Cookies.get('userData')) {
            navigate('/login')
            return
          }
          setIsAddShow(!isAddShow)
          setAddExpenseOrIncome('Expense')
        }} className='w-full sm:w-auto h-full px-6 flex items-center  gap-2 py-8 bg-[#F8F8FA] justify-center hover:bg-[#cecece] transition-all duration-300 rounded'>
          <div className='flex items-center gap-2 p-3 bg-[#00ea79] rounded-full'>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="text-[#006a2a]" viewBox="0 0 16 16">
              <path d="M6.5 7a.5.5 0 0 0 0 1h4a.5.5 0 0 0 0-1z" />
              <path d="M.5 1a.5.5 0 0 0 0 1h1.11l.401 1.607 1.498 7.985A.5.5 0 0 0 4 12h1a2 2 0 1 0 0 4 2 2 0 0 0 0-4h7a2 2 0 1 0 0 4 2 2 0 0 0 0-4h1a.5.5 0 0 0 .491-.408l1.5-8A.5.5 0 0 0 14.5 3H2.89l-.405-1.621A.5.5 0 0 0 2 1zm3.915 10L3.102 4h10.796l-1.313 7zM6 14a1 1 0 1 1-2 0 1 1 0 0 1 2 0m7 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0" />
            </svg>
          </div>
          <h1 className=' text-[#000] text-[12px] md:text-[14px] font-[500] font-bold text-left'>+New Expense</h1>
        </button>

        <button onClick={() => {
          if (!Cookies.get('userData')) {
            navigate('/login')
            return
          }
          setIsAddShow(!isAddShow)
          setAddExpenseOrIncome('Account')
        }} className='w-full sm:w-auto h-full px-6 flex items-center  gap-2 py-8 bg-[#F8F8FA] justify-center hover:bg-[#cecece] transition-all duration-300 rounded'>
          <div className='flex items-center gap-2 p-3 bg-[#a154ff] rounded-full'>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-bank" viewBox="0 0 16 16">
              <path d="m8 0 6.61 3h.89a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5H15v7a.5.5 0 0 1 .485.38l.5 2a.498.498 0 0 1-.485.62H.5a.498.498 0 0 1-.485-.62l.5-2A.5.5 0 0 1 1 13V6H.5a.5.5 0 0 1-.5-.5v-2A.5.5 0 0 1 .5 3h.89zM3.777 3h8.447L8 1zM2 6v7h1V6zm2 0v7h2.5V6zm3.5 0v7h1V6zm2 0v7H12V6zM13 6v7h1V6zm2-1V4H1v1zm-.39 9H1.39l-.25 1h13.72z" />
            </svg>
          </div>
          <h1 className='text-[#000] text-[12px] md:text-[14px] font-[500] font-bold text-left'>+Add Account</h1>
        </button>

      </div>

    </div>
  )
}

export default QuickAcc
