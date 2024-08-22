import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import DetailedBAccount from './baccount/detailedAccount';

const BankAccounts = ({ userData }) => {
    const [accounts, setAccounts] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isCompoOnTrash, setIsCompoOnTrash] = useState(false);

    const navigate = useNavigate();

    const fetchAccounts = async () => {
        setIsProcessing(true);
        try {
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_BASE_URL}${import.meta.env.VITE_GET_USER_BANK_ACCOUNTS_API_EP}?u=${userData.userUID}`);
            setAccounts(res.data.data);
        } catch (err) {
            console.log(err);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleAccountClick = (account) => {
        setSelectedAccount(account);
    };

    const handleCloseModal = () => {
        setSelectedAccount(null);
    };

    useEffect(() => {
        if (userData) {
            fetchAccounts();
        }
    }, [userData]);

    const handleDragStart = (e, account) => {
        setIsDragging(true);
        e.dataTransfer.setData('account', JSON.stringify(account));
    };

    const handleDragEnd = () => {
        setIsDragging(false);
    };

    const handleDrop = async (e) => {
        const account = JSON.parse(e.dataTransfer.getData('account'));

        try {
            const res = await axios.delete(`${import.meta.env.VITE_BACKEND_BASE_URL}${import.meta.env.VITE_DELETE_BANK_ACCOUNT_API_EP}?q=${account.id}&u=${userData.userUID}`)

            if (res.status === 200) {
                await fetchAccounts();
                setIsDragging(false);
                setIsCompoOnTrash(false);
            }
        } catch (err) {
            console.log(err);
        }

    };

    return (
        <main className='mt-[60px] overflow-auto px-2 min-h-[calc(100vh-60px)] relative'>
            {selectedAccount ? (
                <DetailedBAccount
                    userData={userData}
                    fetchAccounts={fetchAccounts}
                    account_id={selectedAccount?.id}
                    onClose={handleCloseModal}
                    userUID={userData.userUID}
                />
            ) : isProcessing ? (
                <div className='absolute top-1/2 translate-y-[-50%] w-full h-full flex items-center justify-center py-10 col-span-1 /md:col-span-2 pras-ov'>
                    <svg className="text-emerald-400 animate-spin w-[24px] h-[24px]" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M32 3C35.8083 3 39.5794 3.75011 43.0978 5.20749C46.6163 6.66488 49.8132 8.80101 52.5061 11.4939C55.199 14.1868 57.3351 17.3837 58.7925 20.9022C60.2499 24.4206 61 28.1917 61 32C61 35.8083 60.2499 39.5794 58.7925 43.0978C57.3351 46.6163 55.199 49.8132 52.5061 52.5061C49.8132 55.199 46.6163 57.3351 43.0978 58.7925C39.5794 60.2499 35.8083 61 32 61C28.1917 61 24.4206 60.2499 20.9022 58.7925C17.3837 57.3351 14.1868 55.199 11.4939 52.5061C8.801 49.8132 6.66487 46.6163 5.20749 43.0978C3.7501 39.5794 3 35.8083 3 32C3 28.1917 3.75011 24.4206 5.2075 20.9022C6.66489 17.3837 8.80101 14.1868 11.4939 11.4939C14.1868 8.80099 17.3838 6.66487 20.9022 5.20749C24.4206 3.7501 28.1917 3 32 3L32 3Z" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"></path>
                        <path d="M32 3C36.5778 3 41.0906 4.08374 45.1692 6.16256C49.2477 8.24138 52.7762 11.2562 55.466 14.9605C58.1558 18.6647 59.9304 22.9531 60.6448 27.4748C61.3591 31.9965 60.9928 36.6232 59.5759 40.9762" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-800"></path>
                    </svg>
                </div>
            ) : accounts.length === 0 ? (
                !Cookies.get('userData') ? (
                    <div className='col-span-1 md:col-span-2 flex items-center justify-center h-[calc(100vh-60px)]'>
                        <button onClick={() => navigate('/login')} className='bg-[#00EA79] rounded-md shadow hover:bg-[#006cd8] transition-all duration-300'>
                            <h1 className='text-[#000] text-[14px] md:text-[16px] font-[500] font-bold px-3 py-3'>Login required</h1>
                        </button>
                    </div>
                ) : (
                    <div className='absolute top-1/2 translate-y-[-50%] w-full h-full flex items-center justify-center py-10 col-span-1'>
                        <p className='text-center text-[15px] font-[500] text-gray-500'>No accounts found</p>
                    </div>
                )
            ) : (
                <div className='grid pt-[10px] pb-[20px] grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5'>
                    {accounts.map((account, i) => (
                        <div
                            key={i}
                            className='w-full h-full rounded'
                            draggable
                            onDragStart={(e) => handleDragStart(e, account)}
                            onDragEnd={handleDragEnd}
                            onClick={() => handleAccountClick(account)}
                        >
                            <div className='bg-white rounded border-[1px] border-gray-200 shadow px-3 py-2 h-full w-full relative'>
                                <h1 className='text-[#000] text-xl font-[500] font-bold'>{account?.account_number}</h1>
                                <h2 className={` ${account?.account_type === 'cash' ? 'font-bold text-xl ' : 'font-bold text-[13px]'}`}>
                                    {(account?.account_name).toUpperCase()}
                                </h2>
                                <p className='text-[11px]'>
                                    {account?.account_type === 'mobile' ? `${'Mobile Wallet'} - ${account?.mobile_bank}` :
                                        account?.account_type === 'debit' ? 'Debit Card' :
                                            account?.account_type === 'credit' ? 'Credit Card' :
                                                account?.account_type === 'genaral' ? 'Bank Account' : 'Cash'}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isDragging && (
                <div
                    className={`fixed bottom-5 left-1/2 transform -translate-x-1/2 text-white p-5 rounded-full ${isCompoOnTrash ? 'bg-red-500 border border-red-800 shadow scale-110' : 'bg-gray-500/80 border border-gray-800'} transition-all duration-300`}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onDragEnter={() => {
                        setIsCompoOnTrash(true)
                    }}
                    onDragLeave={() => {
                        setIsCompoOnTrash(false)
                    }}
                >
                    Remove
                </div>
            )}

        </main>
    );
};

export default BankAccounts;
