import React, { useState, useEffect } from 'react'
import axios from 'axios'
import DataTable from 'react-data-table-component';
import Cookies from 'js-cookie'
import Spinner from '../../../global/spinner'
import Alert from '../../../global/alert';
import { deleteRows, ExpandedComponent, columns, conditionalRowStyles, customStyles } from '../dashboard/recentact';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { getUniqueCategories } from '../../../../utils';
import ExportAsExcel from '../../../global/exportasexcel';

const Table = ({ isRefresh, setIsRefresh, userData, type }) => {
    const [data, setData] = useState([])
    const [isDataFetching, setIsDataFetching] = useState(false)
    const [rpp, setRpp] = useState(10)
    const [totalRows, setTotalRows] = useState(0)
    const [isDeleting, setIsDeleting] = useState(false)
    const [removeResponse, setRemoveResponse] = useState(null)
    const [ExpenseCategory, setExpenseCategory] = useState([])
    const [IncomeCategory, setIncomeCategory] = useState([])
    const [selectedRows, setSelectedRows] = useState([]);
    const [filteredData, setFilteredData] = useState(data);
    const [titleFilter, setTitleFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState([]);
    const [fromDateFilter, setFromDateFilter] = useState('');
    const [toDateFilter, setToDateFilter] = useState('');
    const [wannaFilter, setWannaFilter] = useState(false);
    const [wannaTo, setWannaTo] = React.useState('Single');

    const sortedData = data.sort((a, b) => new Date(b.date) - new Date(a.date));

    const excelData = sortedData.map(({ id, user, ...rest }) => rest);
    
    const handleChangewannaTo = (event, newWannaTo) => {
        if (newWannaTo === null) {
            return
        }
        setWannaTo(newWannaTo);
    };

    useEffect(() => {
        let filtered = data;

        if (titleFilter) {
            filtered = filtered.filter(row => row.title.toLowerCase().includes(titleFilter.toLowerCase()));
        }
        if (categoryFilter.length > 0) {
            filtered = filtered.filter(row => categoryFilter.includes(row.category.toLowerCase()));
        }
        if (fromDateFilter) {
            if (toDateFilter) {
                filtered = filtered.filter(row => row.date >= fromDateFilter && row.date <= toDateFilter);
            } else {
                filtered = filtered.filter(row => row.date.includes(fromDateFilter));
            }
        }

        setFilteredData(filtered);
    }, [titleFilter, categoryFilter, fromDateFilter, toDateFilter, data]);

    const toggleCategoryFilter = (category) => {
        if (categoryFilter.includes(category)) {
            setCategoryFilter(categoryFilter.filter(c => c !== category));
        } else {
            setCategoryFilter([...categoryFilter, category]);
        }
    };

    const handleChange = ({ selectedRows }) => {
        const ids = selectedRows.map((row) => row.id);
        setSelectedRows(ids);
    };

    const handleRowsPerPageChange = (newRpp) => {
        setRpp(newRpp)
    }

    useEffect(() => {
        if (isRefresh) {
            fetchDatas(rpp, type)
            setIsRefresh(false)
        }
    }, [isRefresh, type])

    useEffect(() => {
        if (userData) {
            fetchDatas(rpp, type)
        }
    }, [userData, rpp, type])

    const fetchDatas = async (rpp, q) => {
        setSelectedRows([])
        setIsDataFetching(true)
        try {
            const res = await axios.get(
                `${import.meta.env.VITE_BACKEND_BASE_URL}${import.meta.env.VITE_GET_DATAS_API_EP}?u=${userData.userUID}&rpp=${rpp || 10}&q=${q}`
            )

            if (res.status === 200) {
                setData(res.data.data)
                setTotalRows(res.data.totalEntries || 0)
                if (type === 'Income')
                {
                    setIncomeCategory(getUniqueCategories(res.data.data))

                } else {
                    setExpenseCategory(getUniqueCategories(res.data.data))
                }
            }
        } catch (err) {
            console.log(err)
        } finally {
            setIsDataFetching(false)
        }
    }



    return (
        <div className=''>
            <Alert onClose={setRemoveResponse} className={removeResponse ? "block" : "hidden"} message={removeResponse && removeResponse.message} status={removeResponse && removeResponse.type} />
            <div className=' bg-[white] rounded shadow'>
                <div className='flex items-center justify-between border-b'>  <h1 className='w-full text-left text-[#000] text-[14px] md:text-[16px]  font-bold  px-3 py-3'>{type}</h1>
                    <div className='flex items-center gap-1 mr-2'>
                        {Cookies.get("userData") && <ExportAsExcel data={excelData} buttonName={"Export"} fileName={`${type}-${new Date().toLocaleDateString(
                            "en-US",
                            {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                            }
                        )}`} className={"text-[14px] font-bold px-3 bg-green-500 text-white py-1 rounded outline-none"} />}
                        <input
                            className='bg-[#f1f1f1] w-[150px] md:w-[200px] py-[4px] placeholder:text-[14px] text-[14px] font-bold px-2 rounded outline-none'
                            type="text"
                            placeholder="Search"
                            value={titleFilter}
                            onChange={(e) => setTitleFilter(e.target.value)}
                        />
                        <button type='button' onClick={() => setWannaFilter(!wannaFilter)}
                            className='hover:text-black hover:bg-[#dfdfdf] transition-all duration-300 bg-[#f1f1f1] text-gray-500 p-2 rounded'>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="" viewBox="0 0 16 16">
                                <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5z" />
                            </svg>
                        </button>
                    </div>
                </div>
                <div className={`border-b ${wannaFilter ? "h-80 py-2" : "h-0 border-transparent"} transition-all duration-300 px-3 overflow-auto flex flex-col gap-3`}>
                    <div className='flex flex-col'>
                        <h1 className='font-bold text-[14.5px] pb-[3px] border-b-2 border-[#b6b6b6]'>Category</h1>
                        <div className='flex flex-wrap gap-1 mt-2 transition-all duration-300'>
                            {type === "Income" ? (
                                IncomeCategory.map((category, i) => (
                                    <button
                                        type='button'
                                        onClick={() => toggleCategoryFilter(category.toLowerCase())}
                                        key={i}
                                        className={`${categoryFilter.includes(category.toLowerCase()) ? "bg-[#A4D3FF] hover:bg-[#79beff] font-bold" : "bg-[#f1f1f1] hover:bg-[#dfdfdf]"}
                                     flex text-[13px] items-center px-2 py-1 rounded gap-1`}>
                                        {category}
                                    </button>
                                ))
                            ) : (
                                ExpenseCategory.map((category, i) => (
                                    <button
                                        type='button'
                                        onClick={() => toggleCategoryFilter(category.toLowerCase())}
                                        key={i}
                                        className={`${categoryFilter.includes(category.toLowerCase()) ? "bg-[#A4D3FF] hover:bg-[#79beff] font-bold" : "bg-[#f1f1f1] hover:bg-[#dfdfdf]"}
                                     flex text-[13px] items-center px-2 py-1 rounded gap-1`}>
                                        {category}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                    <div className='flex flex-col mt-4'>
                        <div className='w-full flex items-center justify-between pb-[3px] border-b-2 border-[#b6b6b6]'><h1 className='font-bold text-[14.5px] '>Date Filter</h1>
                            <ToggleButtonGroup
                                color="primary"
                                value={wannaTo}
                                exclusive
                                onChange={handleChangewannaTo}
                                aria-label="Platform"
                                className='py-0 border-l '
                            >
                                <style>
                                    {`
            .MuiButtonBase-root {
            padding: 3px 8px;
            font-size: 12px;
            font-weight: bold;}
            .css-d9c359-MuiButtonBase-root-MuiToggleButton-root.Mui-selected {
            background-color: #b5dbff !important;
            color: #000 !important;}`}
                                </style>
                                <ToggleButton value="Multiple">Multiple</ToggleButton>
                                <ToggleButton value="Single">Single</ToggleButton>
                            </ToggleButtonGroup></div>
                        <div className='mt-2 flex gap-3 items-center'>
                            <input
                                className='bg-[#f1f1f1] w-[150px] md:w-[200px] py-[4px]  placeholder:text-[14px] text-[14px] font-bold px-2 rounded outline-none'
                                type="date"
                                placeholder="From"
                                value={fromDateFilter}
                                onChange={(e) => setFromDateFilter(e.target.value)}
                                required
                            />
                            {wannaTo !== "Single" && <div className='flex gap-3'>
                                <span className='text-[14px] font-bold mt-1.5'>To</span>
                                <input
                                    className='bg-[#f1f1f1] w-[150px] md:w-[200px] py-[4px]  placeholder:text-[14px] text-[14px] font-bold px-2 rounded outline-none'
                                    type="date"
                                    placeholder="To"
                                    value={toDateFilter}
                                    onChange={(e) => setToDateFilter(e.target.value)}
                                />
                            </div>}
                        </div>
                    </div>
                </div>
                <style>
                    {
                        `
                        }

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
                            <div>
                                <DataTable
                                    columns={columns}
                                    data={filteredData}
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
                            </div>
                        )
                    }
                </div>


                <div className={`${selectedRows.length > 0 ? " h-14 py-3" : "h-0"} overflow-hidden transition-all duration-300 fixed w-full z-50 bottom-0 right-0 bg-emerald-800 text-white px-3  flex items-center justify-between`}>
                    <h1>{selectedRows.length > 0 ? `${selectedRows.length} items selected` : ""}</h1>
                    <button onClick={() => {
                        deleteRows(selectedRows, setIsRefresh, setSelectedRows, setIsDeleting, userData, setRemoveResponse)
                    }} className=' bg-gray-500 w-20 py-1 rounded'>
                        {isDeleting ? <Spinner className="transition-all duration-300 py-[3px]" bgColor="bg-gray-500" frColor="text-black" svgClassName="w-[18px] h-[18px]" /> : "Delete"}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Table