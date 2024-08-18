import axios from 'axios'
import React, { useEffect, useState } from 'react'
import IncomeExpensePieChart from './reports/pie'
import BarChart from './reports/bar'
import { generateReport } from './reports/genExcelReport'
import ExportWindow from './reports/export'
import Cookies from 'js-cookie'
import { useNavigate } from 'react-router-dom'
const Reports = ({ userData }) => {
    const [datas, setDatas] = useState([])
    const [totalData, setTotalData] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [IncomeExpenseReportType, setIncomeExpenseReportType] = useState('monthly')
    const [excelDatas, setExcelDatas] = useState([])
    const [isExportWindowOpen, setIsExportWindowOpen] = useState(false)

    const navigate = useNavigate()

    const fetchAllData = async () => {
        setIsLoading(true)
        try {
            const res = await axios.get(`
                ${import.meta.env.VITE_BACKEND_BASE_URL}${import.meta.env.VITE_GET_ALL_DATAS_API_EP}?u=${userData.userUID}
            `)

            if (res.status === 200) {
                setExcelDatas(generateReport(res.data.data, userData.currency_type))
                setDatas(res.data.data)
                setTotalData(calculateBalance(res.data.data))
            }
        } catch (err) {
            console.log(err)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (userData) {
            fetchAllData()
        }
    }, [userData])

    const calculateBalance = ({ incomes = [], expenses = [] }) => {
        const totalIncomes = incomes.reduce((total, { amount }) => total + parseFloat(amount), 0);
        const totalExpenses = expenses.reduce((total, { amount }) => total + parseFloat(amount), 0);

        const balance = totalIncomes - totalExpenses;

        const balanceData = {
            totalIncomes: totalIncomes,
            totalExpenses: totalExpenses,
            totalBalance: balance === 0 ? 0 : balance.toFixed(2)
        }

        return balanceData;
    }



    return (
        <main className='mt-[70px] overflow-auto px-2 grid grid-cols-1 min-h-[calc(100vh-70px)] md:grid-cols-2 gap-4'>
            {
                !Cookies.get('userData') ? (
                    <div className='col-span-1 md:col-span-2 flex items-center justify-center'>
                        <button onClick={() => navigate('/login')} className='bg-[#00EA79] rounded-md shadow hover:bg-[#006cd8] transition-all duration-300 '>
                            <h1 className='text-[#000] text-[14px] md:text-[16px] font-[500] font-bold  px-3 py-3'>Login required</h1>
                        </button>
                    </div>
                ) : (isLoading ? (
                    <div className='w-full h-full flex items-center justify-center py-10 col-span-1 md:col-span-2'>
                        <svg className="text-emerald-400 animate-spin w-[24px] h-[24px]" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M32 3C35.8083 3 39.5794 3.75011 43.0978 5.20749C46.6163 6.66488 49.8132 8.80101 52.5061 11.4939C55.199 14.1868 57.3351 17.3837 58.7925 20.9022C60.2499 24.4206 61 28.1917 61 32C61 35.8083 60.2499 39.5794 58.7925 43.0978C57.3351 46.6163 55.199 49.8132 52.5061 52.5061C49.8132 55.199 46.6163 57.3351 43.0978 58.7925C39.5794 60.2499 35.8083 61 32 61C28.1917 61 24.4206 60.2499 20.9022 58.7925C17.3837 57.3351 14.1868 55.199 11.4939 52.5061C8.801 49.8132 6.66487 46.6163 5.20749 43.0978C3.7501 39.5794 3 35.8083 3 32C3 28.1917 3.75011 24.4206 5.2075 20.9022C6.66489 17.3837 8.80101 14.1868 11.4939 11.4939C14.1868 8.80099 17.3838 6.66487 20.9022 5.20749C24.4206 3.7501 28.1917 3 32 3L32 3Z"
                                stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"></path>
                            <path
                                d="M32 3C36.5778 3 41.0906 4.08374 45.1692 6.16256C49.2477 8.24138 52.7762 11.2562 55.466 14.9605C58.1558 18.6647 59.9304 22.9531 60.6448 27.4748C61.3591 31.9965 60.9928 36.6232 59.5759 40.9762"
                                stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-800">
                            </path>
                        </svg>
                    </div>
                ) : (
                    <>
                        <div className='col-span-1 md:col-span-2 flex flex-col gap-4'>
                            <div className='flex flex-col '>
                                <h1 className='text-2xl font-medium'>Your Balance</h1>
                                <h1 className={`text-3xl font-bold ${parseInt(totalData?.totalBalance) > 0 ? 'text-green-500' : 'text-red-500'}`}>{totalData?.totalBalance} {userData?.currency_type}</h1>
                            </div>
                            <div className='w-full py-3 bg-white shadow rounded grid grid-cols-1 sm:grid-cols-2 place-items-center'>
                                <div className='flex w-full flex-col gap-1 items-center justify-center sm:border-r border-b sm:border-b-0 py-5'>
                                    <h1 className='text-lg md:text-xl font-bold'>Incomes</h1>
                                    <h1 className='text-green-500 text-sm  md:text-md'>{(totalData?.totalIncomes).toFixed(2)} {userData?.currency_type}</h1>
                                </div>
                                <div className='flex w-full flex-col gap-1 items-center justify-center sm:border-l border-t sm:border-t-0 py-5'>
                                    <h1 className=' text-lg md:text-xl font-bold'>Expenses</h1>
                                    <h1 className='text-red-500  text-sm  md:text-md'>{(totalData?.totalExpenses).toFixed(2)} {userData?.currency_type}</h1>
                                </div>


                            </div>
                            {datas?.incomes?.length > 0 || datas?.expenses?.length > 0 ? <div className='w-full h-auto bg-white shadow rounded'>
                                <h1 className='py-2 text-md md:text-lg font-bold border-b text-center'>Category Wise Report</h1>
                                <div className='w-full h-auto bg-white shadow grid grid-cols-1 lg:grid-cols-2 place-items-center'>
                                    {datas?.incomes?.length > 0 ? <div className={`w-full flex justify-center items-center p-4 ${datas?.expenses?.length === 0 ? "col-span-1 lg:col-span-2" : ""}`}>
                                        <IncomeExpensePieChart type={"income"} data={datas} className={"w-full max-w-sm"} currency={userData?.currency_type} />
                                    </div> : null}
                                    {datas?.expenses?.length > 0 ? <div className={`${datas?.incomes?.length === 0 ? "col-span-1 lg:col-span-2" : ""} w-full flex justify-center items-center p-4`}>
                                        <IncomeExpensePieChart type={"expense"} data={datas} className={"w-full max-w-sm"} currency={userData?.currency_type} />
                                    </div> : null}
                                </div>
                            </div> : null}

                            {datas?.incomes?.length > 0 || datas?.expenses?.length > 0 ? <div className='w-full bg-white shadow rounded'>
                                <div className='relative'>
                                    <h1 className='py-2 text-md md:text-lg font-bold border-b ml-2 sm:ml-0 text-left sm:text-center'>Income vs Expense</h1>

                                    <div className='flex gap-1 absolute md:top-2 top-1.5 right-2'>
                                        <button onClick={() => setIncomeExpenseReportType(IncomeExpenseReportType === "monthly" ? "yearly" : "monthly")} className=' bg-[#4495E4] hover:bg-[#317cbd] text-white px-3 text-sm md:text-md py-1 rounded' type="button">{IncomeExpenseReportType === "monthly" ? "Yearly" : "Monthly"}</button>
                                        <button onClick={() => setIsExportWindowOpen(true)} className='bg-[#b3b3b3] hover:bg-[#a0a0a0] text-white px-3 text-sm md:text-md py-1 rounded' type="button">Export</button>
                                    </div>
                                </div>
                                <div className='w-full bg-white shadow '>
                                    <div className="w-full md:w-[80%] lg:w-[60%] mx-auto h-full p-4">

                                        <BarChart currency={userData?.currency_type} type={IncomeExpenseReportType} data={datas} />
                                    </div>
                                </div>
                            </div> : null}
                        </div>
                        <ExportWindow isOpen={isExportWindowOpen} setIsOpen={setIsExportWindowOpen} data={excelDatas} />
                    </>
                ))
            }



        </main>
    )
}

export default Reports
