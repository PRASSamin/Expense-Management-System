import React, { useState, useEffect } from 'react'
import axios from 'axios'
import DataTable from 'react-data-table-component';
import spinner from '../../../global/spinner'
import Alert from '../../../global/alert';


const RecentActs = ({ isRefresh, setIsRefresh, userData }) => {
    const [recentData, setRecentData] = useState([])
    const [isDataFetching, setIsDataFetching] = useState(false)
    const [rpp, setRpp] = useState(10)
    const [totalRows, setTotalRows] = useState(0)
    const [isDeleting, setIsDeleting] = useState(false)
    const [removeResponse, setRemoveResponse] = useState(null)
    const [selectedRows, setSelectedRows] = useState([]);

    const handleChange = ({ selectedRows }) => {
        const ids = selectedRows.map((row) => row.id);
        setSelectedRows(ids);
    };


    const getRecent = async (rpp) => {
        setSelectedRows([])
        setIsDataFetching(true)
        try {
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_BASE_URL}${import.meta.env.VITE_GET_7DAYS_EXPENSE_INCOME_API_EP}?u=${userData.userUID}&rpp=${rpp}`)
            setRecentData(res.data.data)
            setTotalRows(res.data.totalEntries || 0)
        } catch (error) {
            console.log(error)
        } finally {
            setIsDataFetching(false)
        }
    }

    useEffect(() => {
        if (isRefresh) {
            getRecent(rpp)
            setIsRefresh(false)
        }
    }, [isRefresh])

    useEffect(() => {
        if (userData) {
            getRecent(rpp)
        }
    }, [userData, rpp])

    const handleRowsPerPageChange = (newRpp) => {
        setRpp(newRpp)
    }


    return (
        <div className=''>
            <Alert onClose={setRemoveResponse} className={removeResponse ? "block" : "hidden"} message={removeResponse && removeResponse.message} status={removeResponse && removeResponse.type} />
            <div className=' bg-[white] rounded shadow'>
                <div className='flex items-center justify-between border-b'>  <h1 className='w-full text-left text-[#000] text-[12px] md:text-[14px] font-bold  px-3 py-4'>Recent Activities</h1>
                    <select className='bg-gray-300 px-2 py-1 rounded border-none opacity-50 mx-3 text-[13px]' defaultValue={"last7days"} disabled name="last7days" id="last7days">
                        <option value="last7days">Last 7 days</option>
                    </select>
                </div>
                <style>
                    {
                        `
                  @media only screen and (max-width: 600px) {
                    .sc-bhjgvs.fxNobI {
                      display: flex !important;
    
                      #pagination-last-page,
                      #pagination-next-page,
                      #pagination-previous-page,
                      #pagination-first-page{
                      display: none !important;
                      }
                    }
                  }
                    @media only screen and (min-width: 600px) {
                      .sc-bhjgvs {
                        display: none !important;
                      }
                    }
               
                   `
                    }
                </style>
                <div className='mb-14'>
                    {
                        isDataFetching ? (
                            <div className='w-full h-full flex items-center justify-center py-10'>
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
                            <DataTable
                                columns={columns}
                                data={recentData}
                                pagination
                                paginationServer
                                onChangeRowsPerPage={handleRowsPerPageChange}
                                paginationPerPage={rpp}
                                paginationRowsPerPageOptions={[
                                    totalRows >= 10 ? 10 : null,
                                    totalRows >= 20 ? 20 : null,
                                    totalRows >= 30 ? 30 : null,
                                    totalRows >= 50 ? 50 : null,
                                    totalRows >= 100 ? 100 : null,
                                    totalRows
                                ].filter(option => option !== null)}
                                expandableRows={true}
                                expandOnRowClicked={true}
                                expandOnRowDoubleClicked={true}
                                expandableRowsHideExpander={true}
                                expandableRowsComponent={ExpandedComponent}
                                customStyles={customStyles}
                                progressPending={isDataFetching}
                                conditionalRowStyles={conditionalRowStyles}
                                selectableRows
                                onSelectedRowsChange={handleChange}

                            />
                        )
                    }
                </div>


                <div className={`${selectedRows.length > 0 ? " h-14 py-3" : "h-0"} overflow-hidden transition-all duration-300 fixed w-full z-50 bottom-0 right-0 bg-emerald-800 text-white px-3  flex items-center justify-between`}>
                    <h1>{selectedRows.length > 0 ? `${selectedRows.length} items selected` : ""}</h1>
                    <button onClick={() => {
                        deleteRows(selectedRows, setIsRefresh, setSelectedRows, setIsDeleting, userData, setRemoveResponse)
                    }} className=' bg-gray-500 w-20 py-1 rounded'>
                        {isDeleting ? <spinner className="transition-all duration-300 py-[3px]" bgColor="bg-gray-500" frColor="text-black" svgClassName="w-[18px] h-[18px]" /> : "Delete"}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default RecentActs



export const ExpandedComponent = ({ data }) => {
    return (
        <div className={`${data.type === 'Expense' ? 'bg-[#f8d7da]' : data.type === 'Income' ? 'bg-[#d1e7dd]' : data.type === 'Loan Payment' ? 'bg-[#d1e7dd]' : 'bg-[#f8d7da]'}  px-2 py-1 text-sm`}>
            <style>{`
          input {
          background-color: transparent !important; border: none !important; font-weight: bold !important;
          outline: none !important;
          border: none !important;
          }
          label {
            font-weight: normal !important;}
          `}</style>
            <div >
                <label htmlFor="title">Title: </label>
                <input type="text" readOnly value={data.title} />
            </div>
            <div >
                <label htmlFor="Date">Date: </label>
                <input type="text" readOnly value={data.date} />
            </div>
            <div >
                <label htmlFor="Date">Category: </label>
                <input type="text" readOnly value={data.category} />
            </div>
            <di >
                <label htmlFor="Date">Amount: </label>
                <input type="text" readOnly value={data.amount + " " + data.user.currency_type} />
            </di>
            <div >
                <label htmlFor="Date">Account: </label>
                <input type="text" readOnly value={`${(data.account.account_name)?.split(' ')
                    ?.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                    ?.join(' ')} (${data.account?.account_type === 'debit' ? 'Debit Card' :
                        data.account?.account_type === 'credit' ? 'Credit Card' :
                            data.account?.account_type === 'genaral' ? 'Bank Account' :
                                data.account?.account_type === 'mobile' ? data.account?.mobile_bank : data.account?.account_type === 'cash' ? 'Cash' : data?.account?.account_type})`} />
            </div>
            <div className='flex gap-2'>
                <label htmlFor="Date">Description: </label>
                <p className='bg-transparent border-none w-full resize-none font-bold'>{data.description ? data.description : "N/A"}</p>
            </div>
        </div>

    )
}


export const deleteRows = async (selectedRows, setIsRefresh, setSelectedRows, setIsDeleting, userData, setRemoveResponse) => {
    setIsDeleting(true)
    try {
        const res = await axios.post(`${import.meta.env.VITE_BACKEND_BASE_URL}${import.meta.env.VITE_DELETE_7DAYS_EXPENSE_INCOME_API_EP}?u=${userData.userUID}`, {
            ids: selectedRows
        })

        if (res.status === 200) {
            setIsRefresh(true)
            setSelectedRows([])
            setRemoveResponse(
                {
                    type: res.data.status,
                    message: res.data.message
                }
            )
        }
    } catch (err) {
        console.log(err)
    } finally {
        setIsDeleting(false)
    }
}


export const columns = [
    {
        name: 'Title',
        selector: row => row.title,
    },
    {
        name: 'Date',
        selector: row => row.date,
        sortable: true,
        reorder: true,
    },
    {
        name: 'Type',
        selector: row => row.type,
    },
    {
        name: 'Category',
        selector: row => row.category,
    },
    {
        name: 'Amount',
        selector: row => row.amount,
    },
    {
        name: 'Balance',
        selector: row => row?.account?.balance?.balance,
    },
    {
        name: 'Account',
        selector: row => row?.account?.account_type === 'cash' ? 'Cash' : row?.account?.account_number
    }
]


export const conditionalRowStyles = [
    {
        when: row => row.type === 'Expense',
        style: {
            backgroundColor: '#f8d7da',
            color: '#721c24',
        }
    },
    {
        when: row => row.type === 'Income',
        style: {
            backgroundColor: '#d4edda',
            color: '#155724',
        }
    },
    {
        when: row => row.type === 'Credit Payment',
        style: {
            backgroundColor: '#f8d7da',
            color: '#721c24',
        }
    },
    {
        when: row => row.type === 'Loan Payment',
        style: {
            backgroundColor: '#d4edda',
            color: '#155724',
        }
    }
]


export const customStyles = {
    header: {
        style: {
            backgroundColor: '#ffffff',
            color: '#333',
            fontWeight: 'bold',
            fontSize: '16px',
        },
    },
    headCells: {
        style: {
            backgroundColor: '#ffffff',
            color: '#000',
            fontWeight: 'bold',
            fontSize: '14px',
        },
    },
};
