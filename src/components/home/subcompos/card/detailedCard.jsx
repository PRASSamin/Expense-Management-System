import React, { useState, useEffect } from 'react';
import { Breadcrumb } from 'antd';
import Cards from 'react-credit-cards-2';
import 'react-credit-cards/es/styles-compiled.css';
import axios from 'axios';
import Alert from '../../../global/alert';
import { getMyData } from '../../../../utils';
import Cookies from 'js-cookie';
import { useAppContext } from '../../../../root';
import Table from '../global/table';
import { columns, conditionalRowStyles, customStyles, deleteRows, ExpandedComponent } from '../dashboard/recentact';
import DataTable from 'react-data-table-component';
import { calculateBalance } from '../reports';
import Incomes from '../incomes';
import { Tooltip } from 'react-tooltip'
import RestoreCredit from './restoreCredit';

const DetailedCard = ({ card_number, onClose, userUID, cvv, fetchCards, userData }) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const [response, setResponse] = useState(null);
    const [card, setCard] = useState(null);
    const [isProcessing, setIsProcessing] = useState(true);
    const [isLoading, setIsLoading] = useState(null);
    const { refreshApp } = useAppContext();
    const [ExpenseIncomes, setExpenseIncomes] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false)
    const [removeResponse, setRemoveResponse] = useState(null)
    const [selectedRows, setSelectedRows] = useState([]);
    const [isRefresh, setIsRefresh] = useState(false)
    const [totalBalance, setTotalBalance] = useState(0)
    const [balanceData, setBalanceData] = useState([])
    const [wannaRestore, setWannaRestore] = useState(false)

    const handleMouseEnter = () => {
        setIsFlipped(true);
    };

    const handleMouseLeave = () => {
        setIsFlipped(false);
    };
    const formatExpiryDate = (expiryDate) => {
        const [month, year] = expiryDate?.split('-');
        return `${month}/${year}`;
    };


    const reSaveUserData = async (uid) => {
        try {
            const userRes = await getMyData(uid)
            Cookies.set('userData', userRes.data, { expires: 30 });
        } catch (err) {
            console.log(err)
        }
    }
    const handleChange = ({ selectedRows }) => {
        const ids = selectedRows.map((row) => row.id);
        setSelectedRows(ids);
    };


    const fetchCardDetails = async () => {
        setSelectedRows([]);
        try {
            const res = await axios.get(
                `${import.meta.env.VITE_BACKEND_BASE_URL}${import.meta.env.VITE_GET_CARD_DETAILS_API_EP}?c=${card_number}&u=${userUID}&cvv=${cvv}`
            );

            if (res.status === 200) {
                const data = res.data.data;
                setCard(data.card);
                setExpenseIncomes(data.expenses_incomes);
                setBalanceData(res.data.data.balance)

                const incomes = [];
                const expenses = [];

                data.expenses_incomes.forEach(record => {
                    if (record.type === 'Income') {
                        incomes.push(record);
                    } else if (record.type === 'Expense') {
                        expenses.push(record);
                    }
                });

                setTotalBalance(calculateBalance({ incomes, expenses }));
            }
        } catch (err) {
            console.log(err);
        }
    };



    const DeleteCard = async () => {
        const url = `${import.meta.env.VITE_BACKEND_BASE_URL}${import.meta.env.VITE_DELETE_CARD_API_EP}?c=${card.card_number}`
        setIsLoading("deleting")

        try {
            const res = await axios.delete(url,
                {
                    headers: {
                        'Content-Type': 'application/json'

                    }
                }
            )


            if (res.status === 200) {
                await fetchCards()
                await reSaveUserData(userUID)
                await refreshApp()
                onClose()
            }
        } catch (err) {
            console.log(err)
        } finally {
            setIsLoading(null)
        }
    }
    const CardActivation = async (action) => {
        const url = `${import.meta.env.VITE_BACKEND_BASE_URL}${import.meta.env.VITE_CARD_ACTIVATION_AND_DEFAULTATION_API_EP}?c=${card.card_number}&a=${action}`
        setIsLoading(action)


        try {
            const res = await axios.post(url,
                {
                    headers: {
                        'Content-Type': 'application/json'

                    }
                }
            )

            if (res.status === 200) {
                await fetchCardDetails()
                await reSaveUserData(userUID)
                await refreshApp()

                setResponse({
                    status: 'success',
                    message: res.data.message
                })
            }
        } catch (err) {
            console.log(err)
        } finally {
            setIsLoading(null)
        }
    }
    const DefaultCard = async () => {
        const url = `${import.meta.env.VITE_BACKEND_BASE_URL}${import.meta.env.VITE_CARD_ACTIVATION_AND_DEFAULTATION_API_EP}?c=${card.card_number}&a=default`

        setIsLoading("defaulting")

        try {
            const res = await axios.post(url,
                {
                    headers: {
                        'Content-Type': 'application/json'

                    }
                }
            )

            if (res.status === 200) {
                await fetchCardDetails()
                await reSaveUserData(userUID)
                await refreshApp()

                setResponse({
                    status: 'success',
                    message: res.data.message
                })
            }
        } catch (err) {
            console.log(err)
        } finally {
            setIsLoading(null)
        }
    }


    const fetch = async () => {
        setIsProcessing(true)
        await fetchCardDetails()
        setIsProcessing(false)
    }
    useEffect(() => {
        fetch()
    }, [])



    useEffect(() => {
        if (userData) {
            fetch()
        }
    }, [userData])

    useEffect(() => {
        if (isRefresh) {
            fetch()
            setIsRefresh(false)
        }
    }, [isRefresh])


    const ActionButton = ({ onClick, isLoading, loadingState, buttonText, buttonClass }) => {
        const getButtonClass = () => {
            return isLoading === loadingState ? "px-5" : "px-2.5";
        };

        const getButtonText = () => {
            return isLoading === loadingState ? Spinner() : buttonText;
        };

        return (
            <button
                onClick={onClick}
                className={`${getButtonClass()} ${buttonClass} py-0.5 rounded transition-all duration-300 `}
                type='button'
            >
                {getButtonText()}
            </button>
        );
    };




    return (
        <div className=" flex items-center justify-center mx-2">
            {
                isProcessing ? (
                    <div className='absolute top-1/2 translate-y-[-50%] w-full h-full flex items-center justify-center py-10 col-span-1 /md:col-span-2'>
                        <svg className="text-emerald-400 animate-spin w-[24px] h-[24px]" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M32 3C35.8083 3 39.5794 3.75011 43.0978 5.20749C46.6163 6.66488 49.8132 8.80101 52.5061 11.4939C55.199 14.1868 57.3351 17.3837 58.7925 20.9022C60.2499 24.4206 61 28.1917 61 32C61 35.8083 60.2499 39.5794 58.7925 43.0978C57.3351 46.6163 55.199 49.8132 52.5061 52.5061C49.8132 55.199 46.6163 57.3351 43.0978 58.7925C39.5794 60.2499 35.8083 61 32 61C28.1917 61 24.4206 60.2499 20.9022 58.7925C17.3837 57.3351 14.1868 55.199 11.4939 52.5061C8.801 49.8132 6.66487 46.6163 5.20749 43.0978C3.7501 39.5794 3 35.8083 3 32C3 28.1917 3.75011 24.4206 5.2075 20.9022C6.66489 17.3837 8.80101 14.1868 11.4939 11.4939C14.1868 8.80099 17.3838 6.66487 20.9022 5.20749C24.4206 3.7501 28.1917 3 32 3L32 3Z" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"></path>
                            <path d="M32 3C36.5778 3 41.0906 4.08374 45.1692 6.16256C49.2477 8.24138 52.7762 11.2562 55.466 14.9605C58.1558 18.6647 59.9304 22.9531 60.6448 27.4748C61.3591 31.9965 60.9928 36.6232 59.5759 40.9762" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-800"></path>
                        </svg>
                    </div>
                ) : (

                    <div className="w-full mt-4">
                        <Breadcrumb className='mb-10'>
                            <Breadcrumb.Item onClick={onClose} className="cursor-pointer">Cards</Breadcrumb.Item>
                            <Breadcrumb.Item>{card?.card_number}</Breadcrumb.Item>
                        </Breadcrumb>

                        <Alert className={`mb-10 -mt-7 ${response ? "block" : "hidden"}`} status={response?.status} message={response?.message} onClose={setResponse} />
                        <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 mb-10'>
                            <div className='w-full order-last lg:order-first lg:mt-0 mt-6'>
                                <h1 className='text-2xl font-bold'>{card?.cardholder_name}</h1>
                                <p className='text-lg'>{card?.card_number} ({card?.card_category})</p>


                                <div className='flex gap-2 lg:gap-3 flex-wrap mt-4'>
                                    <ActionButton
                                        buttonClass={'bg-red-300 text-red-800 hover:bg-red-200'}
                                        onClick={DeleteCard}
                                        isLoading={isLoading}
                                        loadingState='deleting'
                                        buttonText='Delete'
                                    />
                                    <ActionButton
                                        onClick={() => CardActivation(card?.is_active ? 'deactivate' : 'activate')}
                                        isLoading={isLoading}
                                        loadingState={card?.is_active ? 'deactivate' : 'activate'}
                                        buttonText={card?.is_active ? 'Deactivate' : 'Activate'}
                                        buttonClass={'bg-emerald-300 text-emerald-800 hover:bg-emerald-200'}
                                    />
                                    <ActionButton
                                        onClick={() => {
                                            if (card?.is_default) {
                                                setResponse({ status: 'info', message: 'Card is already default' });
                                                return;
                                            }
                                            if (!card?.is_active) {
                                                setResponse({ status: 'info', message: 'Card is not active' });
                                                return;
                                            }
                                            DefaultCard();
                                        }}
                                        isLoading={isLoading}
                                        loadingState='defaulting'
                                        buttonText={card?.is_default ? 'Default' : 'Set as default'}
                                        buttonClass={'bg-blue-300 text-blue-800 hover:bg-blue-200'}
                                    />
                                    {card?.card_category === 'Credit' && <ActionButton
                                        onClick={() => {
                                            if (!card?.is_active) {
                                                setResponse({ status: 'info', message: 'Card is not active' });
                                                return;
                                            }
                                            setWannaRestore(true)
                                        }}
                                        isLoading={isLoading}
                                        loadingState='restoring'
                                        buttonText={'Restore Credits'}
                                        buttonClass={'bg-purple-300 text-purple-800 hover:bg-purple-200'}
                                    />}
                                </div>

                            </div>
                            <div className=' flex items-center justify-center lg:justify-end'>
                                <div
                                    className='relative'
                                    onMouseEnter={() => handleMouseEnter()}
                                    onMouseLeave={handleMouseLeave}

                                >
                                    <div className={`card-inner ${isFlipped ? 'flipped' : ''}`}>
                                        <div className="card-front">
                                            <Cards
                                                cvc={''}
                                                expiry={formatExpiryDate(card?.expiry_date)}
                                                name={card?.cardholder_name}
                                                number={card?.card_number}
                                                issuer={card?.card_type.toLowerCase()}
                                                preview={true}
                                            />
                                        </div>
                                        <div className="card-back">
                                            <Cards
                                                cvc={`${card?.cvv}`}
                                                expiry={formatExpiryDate(card?.expiry_date)}
                                                name={card?.cardholder_name}
                                                number={card?.card_number}
                                                issuer={card?.card_type.toLowerCase()}
                                                preview={true}
                                                focused="cvc"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {card?.card_category === "Debit" ? (
                            <div className='flex flex-col gap-2 my-5'>
                                <div className='flex flex-col mt-3 lg:mt-0'>
                                    <h1 className='text-2xl font-medium'>Card Balance</h1>
                                    <h1 className={`text-3xl font-bold ${parseInt(totalBalance?.totalBalance) > 0 ? 'text-green-500' : 'text-red-500'}`}>{totalBalance?.totalBalance} {userData?.currency_type}</h1>
                                </div>
                                <div className='w-full py-3 bg-white shadow rounded grid grid-cols-1 sm:grid-cols-2 place-items-center'>
                                    <div className='flex w-full flex-col gap-1 items-center justify-center sm:border-r border-b sm:border-b-0 py-5'>
                                        <h1 className='text-lg md:text-xl font-bold'>Incomes</h1>
                                        <h1 className='text-green-500 text-sm  md:text-md'>{(totalBalance?.totalIncomes).toFixed(2)} {userData?.currency_type}</h1>
                                    </div>
                                    <div className='flex w-full flex-col gap-1 items-center justify-center sm:border-l border-t sm:border-t-0 py-5'>
                                        <h1 className=' text-lg md:text-xl font-bold'>Expenses</h1>
                                        <h1 className='text-red-500  text-sm  md:text-md'>{(totalBalance?.totalExpenses).toFixed(2)} {userData?.currency_type}</h1>
                                    </div>


                                </div>
                            </div>
                        ) : (
                            <div className='flex flex-col gap-2 my-5'>
                                <div className='w-full py-14 bg-white shadow rounded grid grid-cols-1 place-items-center relative'>
                                    <h1 className='text-[12px] absolute top-1 right-2 text-gray-500 font-bold'>Interest Rate: {card?.interest_rate}%</h1>
                                    <div className='flex  gap-1 items-center justify-center rotate-45'>
                                        <div className='flex w-full flex-col gap-1 items-center justify-center pt-5 -rotate-45'>

                                            <h1 data-tooltip-id="credit_used" data-tooltip-content="Credit Used" className=' flex items-start justify-start text-green-500 font-bold text-lg  md:text-xl cursor-pointer'> {(balanceData?.credit_used)}</h1><Tooltip id='credit_used' placement='top'></Tooltip>
                                        </div>
                                        <div className='w-1 h-20 bg-gray-400 rounded mx-2' />

                                        <div className='flex w-full flex-col gap-1 items-center justify-center pb-5 -rotate-45'>
                                            <h1
                                                data-tooltip-id="credit_limit" data-tooltip-content="Credit Limit"
                                                className='text-green-500 font-bold  text-lg  md:text-xl'>{parseInt(card?.credit_limit)}</h1>
                                            <Tooltip id='credit_limit' placement='top'></Tooltip>
                                        </div>
                                    </div>


                                </div>
                            </div>
                        )}
                        <div className=''>
                            <Alert onClose={setRemoveResponse} className={removeResponse ? "block" : "hidden"} message={removeResponse && removeResponse.message} status={removeResponse && removeResponse.type} />
                            <div className=' bg-[white] rounded shadow'>
                                <div className='flex items-center justify-between border-b'>  <h1 className='w-full text-left text-[#000] text-[12px] md:text-[14px] font-[500] font-bold  px-3 py-4'>Recent Activities</h1>

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
                                    <DataTable
                                        columns={columns}
                                        data={ExpenseIncomes}
                                        pagination
                                        paginationServer
                                        expandableRows={true}
                                        paginationPerPage={ExpenseIncomes.length}
                                        paginationRowsPerPageOptions={[
                                            ExpenseIncomes.length
                                        ]}
                                        expandOnRowClicked={true}
                                        expandOnRowDoubleClicked={true}
                                        expandableRowsHideExpander={true}
                                        expandableRowsComponent={ExpandedComponent}
                                        customStyles={customStyles}
                                        conditionalRowStyles={conditionalRowStyles}
                                        selectableRows
                                        onSelectedRowsChange={handleChange}

                                    />


                                </div>


                                <div className={`${selectedRows.length > 0 ? " h-14 py-3" : "h-0"} overflow-hidden transition-all duration-300 fixed w-full z-50 bottom-0 right-0 bg-emerald-800 text-white px-3  flex items-center justify-between`}>
                                    <h1>{selectedRows.length > 0 ? `${selectedRows.length} items selected` : ""}</h1>
                                    <button onClick={() => {
                                        deleteRows(selectedRows, setIsRefresh, setSelectedRows, setIsDeleting, userData, setRemoveResponse)
                                    }} className=' bg-gray-500 w-20 py-1 rounded flex items-center justify-center'>
                                        {isDeleting ? <Spinner className="transition-all duration-300 py-[3px]" bgColor="bg-gray-500" frColor="text-black" svgClassName="w-[18px] h-[18px]" /> : "Delete"}
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                )
            }

            <RestoreCredit data={{
                card: card,
                balanceData: balanceData,
                userData: userData
            }} isOpen={wannaRestore} fetchCardDetails={fetchCardDetails} onClose={() => {
                setWannaRestore(false)
            }} />
        </div>
    );
};

export default DetailedCard;


export const Spinner = () => (
    <svg className="text-gray-400 animate-spin w-[19px] h-[19px]" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M32 3C35.8083 3 39.5794 3.75011 43.0978 5.20749C46.6163 6.66488 49.8132 8.80101 52.5061 11.4939C55.199 14.1868 57.3351 17.3837 58.7925 20.9022C60.2499 24.4206 61 28.1917 61 32C61 35.8083 60.2499 39.5794 58.7925 43.0978C57.3351 46.6163 55.199 49.8132 52.5061 52.5061C49.8132 55.199 46.6163 57.3351 43.0978 58.7925C39.5794 60.2499 35.8083 61 32 61C28.1917 61 24.4206 60.2499 20.9022 58.7925C17.3837 57.3351 14.1868 55.199 11.4939 52.5061C8.801 49.8132 6.66487 46.6163 5.20749 43.0978C3.7501 39.5794 3 35.8083 3 32C3 28.1917 3.75011 24.4206 5.2075 20.9022C6.66489 17.3837 8.80101 14.1868 11.4939 11.4939C14.1868 8.80099 17.3838 6.66487 20.9022 5.20749C24.4206 3.7501 28.1917 3 32 3L32 3Z" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"></path>
        <path d="M32 3C36.5778 3 41.0906 4.08374 45.1692 6.16256C49.2477 8.24138 52.7762 11.2562 55.466 14.9605C58.1558 18.6647 59.9304 22.9531 60.6448 27.4748C61.3591 31.9965 60.9928 36.6232 59.5759 40.9762" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" className="text-black"></path>
    </svg>
);