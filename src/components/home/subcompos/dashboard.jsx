import React, { useState } from 'react'
import Add from './dashboard/add'
import QuickAcc from './dashboard/quickacc'
import RecentActs from './dashboard/recentact'
import AddBank from './dashboard/addBank'
import Transfer from './dashboard/transfer'

const Dashboard = ({ userData }) => {
  const [isRefresh, setIsRefresh] = useState(false)


  return (
    <main className='mt-[70px] overflow-auto mx-2 grid grid-cols-1 md:grid-cols-2 gap-4'>
      <QuickAcc userData={userData} setIsRefresh={setIsRefresh} />
      <div className='col-span-1 p-0.5 md:col-span-2'>
        <RecentActs isRefresh={isRefresh} setIsRefresh={setIsRefresh} userData={userData} /></div>


    </main>
  )
}

export default Dashboard
