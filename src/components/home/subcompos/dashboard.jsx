import React, { useState } from 'react'
import Add from './dashboard/add'
import QuickAcc from './dashboard/quickacc'
import RecentActs from './dashboard/recentact'

const Dashboard = ({userData}) => {

    const [isAddShow, setIsAddShow] = useState(false)
    const [addExpenseOrIncome, setAddExpenseOrIncome] = useState('')
    const [isRefresh, setIsRefresh] = useState(false)


  return (
    <main className='mt-[70px] overflow-auto mx-2 grid grid-cols-1 md:grid-cols-2 gap-4'>
          <QuickAcc setAddExpenseOrIncome={setAddExpenseOrIncome} setIsAddShow={setIsAddShow} isAddShow={isAddShow} />
          <div className='col-span-1 p-0.5 md:col-span-2'> <RecentActs isRefresh={isRefresh} setIsRefresh={setIsRefresh} userData={userData} /></div>

        
      <Add isShow={isAddShow} user={userData} setIsShow={setIsAddShow} setIsRefresh={setIsRefresh} expenseOrIncome={addExpenseOrIncome} />
        </main>
  )
}

export default Dashboard
