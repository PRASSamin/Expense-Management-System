import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Cookies from 'js-cookie'
import Add from './add'
import AddBank from './addBank'
import Transfer from './transfer'
import Payment from './payment'

const QuickAcc = ({ setIsRefresh, userData }) => {
  const navigate = useNavigate()
  const [addExpenseOrIncome, setAddExpenseOrIncome] = useState('')
  const [isAddShow, setIsAddShow] = useState(false)

  return (
    <div className=' bg-white shadow rounded col-span-1 md:col-span-2'>
      <h1 className='w-full text-left text-[#000] text-[12px] md:text-[14px] font-bold border-b px-2 py-1.5'>Quick Access</h1>
      <div className="px-2 py-2 flex-col  sm:flex-row flex  flex-wrap items-center gap-2">
        <button onClick={() => {
          if (!Cookies.get('userData')) {
            navigate('/login')
            return
          }
          setIsAddShow(!isAddShow)
          setAddExpenseOrIncome('Income')
        }} className='w-full sm:w-auto h-full px-6 flex items-center  gap-2 py-8 bg-[#F8F8FA] justify-center hover:bg-[#cecece] transition-all duration-300 rounded'>
          <div className='flex items-center gap-2 p-3 bg-green-400 rounded-full'>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="text-[#006a6a]" viewBox="0 0 16 16">
              <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v1h14V4a1 1 0 0 0-1-1zm13 4H1v5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1z" />
              <path d="M2 10a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1z" />
            </svg>
          </div>
          <h1 className=' text-[#000] text-[12px] md:text-[14px] font-bold text-left '>+New Income</h1>
        </button>
        <button onClick={() => {
          if (!Cookies.get('userData')) {
            navigate('/login')
            return
          }
          setIsAddShow(!isAddShow)
          setAddExpenseOrIncome('Expense')
        }} className='w-full sm:w-auto h-full px-6 flex items-center  gap-2 py-8 bg-[#F8F8FA] justify-center hover:bg-[#cecece] transition-all duration-300 rounded'>
          <div className='flex items-center gap-2 p-3 bg-[#ff5d5d] rounded-full'>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="text-[#006a2a]" viewBox="0 0 16 16">
              <path d="M6.5 7a.5.5 0 0 0 0 1h4a.5.5 0 0 0 0-1z" />
              <path d="M.5 1a.5.5 0 0 0 0 1h1.11l.401 1.607 1.498 7.985A.5.5 0 0 0 4 12h1a2 2 0 1 0 0 4 2 2 0 0 0 0-4h7a2 2 0 1 0 0 4 2 2 0 0 0 0-4h1a.5.5 0 0 0 .491-.408l1.5-8A.5.5 0 0 0 14.5 3H2.89l-.405-1.621A.5.5 0 0 0 2 1zm3.915 10L3.102 4h10.796l-1.313 7zM6 14a1 1 0 1 1-2 0 1 1 0 0 1 2 0m7 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0" />
            </svg>
          </div>
          <h1 className=' text-[#000] text-[12px] md:text-[14px]  font-bold text-left'>+New Expense</h1>
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
          <h1 className='text-[#000] text-[12px] md:text-[14px] font-bold text-left'>+Add Account</h1>
        </button>
        <button onClick={() => {
          if (!Cookies.get('userData')) {
            navigate('/login')
            return
          }
          setIsAddShow(!isAddShow)
          setAddExpenseOrIncome('Transfer')
        }} className='w-full sm:w-auto h-full px-6 flex items-center  gap-2 py-8 bg-[#F8F8FA] justify-center hover:bg-[#cecece] transition-all duration-300 rounded'>
          <div className='flex items-center gap-2 p-3 bg-[#ff8a54] rounded-full'>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-left-right" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M1 11.5a.5.5 0 0 0 .5.5h11.793l-3.147 3.146a.5.5 0 0 0 .708.708l4-4a.5.5 0 0 0 0-.708l-4-4a.5.5 0 0 0-.708.708L13.293 11H1.5a.5.5 0 0 0-.5.5m14-7a.5.5 0 0 1-.5.5H2.707l3.147 3.146a.5.5 0 1 1-.708.708l-4-4a.5.5 0 0 1 0-.708l4-4a.5.5 0 1 1 .708.708L2.707 4H14.5a.5.5 0 0 1 .5.5" />
            </svg>
          </div>
          <h1 className='text-[#000] text-[12px] md:text-[14px] font-bold text-left'>+Transfer</h1>
        </button>
        <button onClick={() => {
          if (!Cookies.get('userData')) {
            navigate('/login')
            return
          }
          setIsAddShow(!isAddShow)
          setAddExpenseOrIncome('pay')
        }} className='w-full sm:w-auto h-full px-6 flex items-center  gap-2 py-8 bg-[#F8F8FA] justify-center hover:bg-[#cecece] transition-all duration-300 rounded'>
          <div className='flex items-center gap-2 p-3 bg-teal-500 rounded-full'>
            <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="16" height="16" viewBox="0 0 50 50">
              <path d="M 20.625 9 C 19.175781 9 17.996094 9.71875 17.21875 10.625 C 17.015625 10.859375 16.839844 11.121094 16.6875 11.375 C 16.207031 11.191406 15.726563 11.085938 15.28125 11.0625 C 14.542969 11.027344 13.882813 11.1875 13.3125 11.5 C 12.175781 12.125 11.375 13.074219 10.53125 13.78125 C 9.667969 14.503906 7.085938 16.402344 4.78125 18.0625 C 2.476563 19.722656 0.4375 21.1875 0.4375 21.1875 C 0.0820313 21.359375 -0.136719 21.722656 -0.125 22.117188 C -0.113281 22.511719 0.128906 22.863281 0.492188 23.011719 C 0.859375 23.164063 1.277344 23.085938 1.5625 22.8125 C 1.5625 22.8125 3.65625 21.355469 5.96875 19.6875 C 8.28125 18.019531 10.808594 16.179688 11.84375 15.3125 C 12.847656 14.46875 13.621094 13.613281 14.28125 13.25 C 14.828125 12.949219 15.261719 12.851563 16.0625 13.25 C 16.046875 13.386719 16 13.519531 16 13.65625 L 16 25.5625 L 14.625 26.1875 C 14.257813 26.300781 13.988281 26.621094 13.933594 27 C 13.878906 27.382813 14.050781 27.761719 14.371094 27.976563 C 14.691406 28.1875 15.105469 28.199219 15.4375 28 L 24.6875 23.75 L 24.71875 23.75 C 26.035156 23.046875 27.414063 22.402344 28.46875 22.1875 C 29.523438 21.972656 30.050781 22.0625 30.5 22.65625 C 31.027344 23.351563 31.148438 24.117188 30.90625 24.96875 C 30.664063 25.820313 30.019531 26.742188 28.90625 27.53125 C 26.574219 29.179688 22.96875 30.40625 22.96875 30.40625 L 22.78125 30.46875 L 22.625 30.59375 C 20.769531 32.171875 19.695313 33.671875 18.34375 34.6875 C 16.992188 35.703125 15.320313 36.375 11.875 36.375 L 11.8125 36.375 L 0.9375 37 C 0.386719 37.035156 -0.0351563 37.511719 0 38.0625 C 0.0351563 38.613281 0.511719 39.035156 1.0625 39 L 11.875 38.375 C 11.898438 38.375 11.914063 38.375 11.9375 38.375 C 14.492188 38.367188 16.347656 37.945313 17.8125 37.28125 C 18.066406 38.03125 18.589844 38.671875 19.40625 38.9375 C 20.554688 39.308594 21.6875 39.199219 22.59375 38.8125 C 22.996094 38.640625 23.363281 38.40625 23.6875 38.15625 C 24.003906 38.882813 24.570313 39.5625 25.4375 39.875 C 26.347656 40.203125 27.253906 40.277344 28.0625 40.0625 C 28.871094 39.847656 29.53125 39.390625 30.15625 38.8125 C 30.261719 38.714844 30.332031 38.640625 30.40625 38.5625 C 30.617188 38.707031 30.859375 38.804688 31.125 38.875 C 32.421875 39.214844 33.9375 38.84375 35.09375 37.6875 C 36.109375 36.671875 36.71875 35.113281 36.9375 33 L 45.65625 33 C 48.058594 33 50 31.03125 50 28.625 L 50 13.5625 C 50 11.054688 47.835938 9 45.375 9 Z M 20.625 11 L 45.375 11 C 46.621094 11 48 12.332031 48 13.5625 L 48 14 L 18 14 L 18 13.65625 C 18 13.242188 18.269531 12.496094 18.75 11.9375 C 19.230469 11.378906 19.835938 11 20.625 11 Z M 18 18 L 48 18 L 48 28.625 C 48 29.957031 46.960938 31 45.65625 31 L 26.78125 31 C 27.832031 30.519531 28.992188 29.945313 30.0625 29.1875 C 31.480469 28.183594 32.453125 26.914063 32.84375 25.53125 C 33.234375 24.148438 32.988281 22.652344 32.09375 21.46875 C 31.117188 20.179688 29.5 19.957031 28.0625 20.25 C 26.644531 20.539063 25.195313 21.21875 23.84375 21.9375 C 23.824219 21.949219 23.800781 21.957031 23.78125 21.96875 L 18 24.625 Z M 23 33 L 23.6875 33 C 23.628906 33.703125 23.527344 34.761719 23.40625 35.4375 C 23.390625 35.519531 23.386719 35.601563 23.375 35.6875 C 23.320313 35.722656 23.265625 35.765625 23.21875 35.8125 C 22.789063 36.324219 22.292969 36.75 21.78125 36.96875 C 21.269531 37.1875 20.757813 37.265625 20.03125 37.03125 C 19.851563 36.972656 19.648438 36.683594 19.625 36.21875 C 20.914063 35.234375 21.863281 34.117188 23 33 Z M 25.71875 33 L 29.46875 33 C 29.398438 33.464844 29.335938 33.996094 29.28125 34.53125 C 29.214844 35.183594 29.15625 35.964844 29.3125 36.75 C 29.257813 36.824219 29.234375 36.839844 29.15625 36.9375 C 28.992188 37.144531 28.699219 37.445313 28.8125 37.34375 C 28.320313 37.796875 27.90625 38.054688 27.53125 38.15625 C 27.15625 38.257813 26.761719 38.230469 26.125 38 C 25.785156 37.878906 25.609375 37.660156 25.46875 37.25 C 25.328125 36.839844 25.289063 36.257813 25.375 35.78125 C 25.546875 34.835938 25.667969 33.628906 25.71875 33 Z M 31.5 33 L 34.90625 33 C 34.699219 34.671875 34.234375 35.734375 33.6875 36.28125 C 32.945313 37.027344 32.316406 37.117188 31.625 36.9375 C 31.394531 36.875 31.375 36.820313 31.28125 36.40625 C 31.1875 35.992188 31.1875 35.34375 31.25 34.75 C 31.316406 34.109375 31.414063 33.488281 31.5 33 Z"></path>
            </svg>
          </div>
          <h1 className='text-[#000] text-[12px] md:text-[14px] font-bold text-left'>Pay Loan/Credit</h1>
        </button>

      </div>

      {
        isAddShow && ["Expense", "Income"].includes(addExpenseOrIncome) ? <Add isShow={isAddShow} user={userData} setIsShow={setIsAddShow} setIsRefresh={setIsRefresh} expenseOrIncome={addExpenseOrIncome} /> : isAddShow && addExpenseOrIncome === "Account" ? <AddBank isShow={isAddShow} user={userData} setIsShow={setIsAddShow} setIsRefresh={setIsRefresh} expenseOrIncome={addExpenseOrIncome} /> : isAddShow && addExpenseOrIncome === "Transfer" ? <Transfer isShow={isAddShow} user={userData} setIsShow={setIsAddShow} setIsRefresh={setIsRefresh} expenseOrIncome={addExpenseOrIncome} /> : addExpenseOrIncome === "pay" ? <Payment isShow={isAddShow} user={userData} setIsShow={setIsAddShow} setIsRefresh={setIsRefresh} expenseOrIncome={addExpenseOrIncome} /> : null
      }
    </div>
  )
}

export default QuickAcc
