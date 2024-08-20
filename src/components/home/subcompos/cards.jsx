import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Cards from 'react-credit-cards-2';
import 'react-credit-cards/es/styles-compiled.css';
import Cookies from 'js-cookie';
import DetailedCard from './card/detailedCard';

const UserCards = ({ userData }) => {
    const [cards, setCards] = useState([]);
    const [flippedIndex, setFlippedIndex] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedCard, setSelectedCard] = useState(null);

    const handleMouseEnter = (index) => {
        setFlippedIndex(index);
    };

    const handleMouseLeave = () => {
        setFlippedIndex(null);
    };

    const fetchCards = async () => {
        setIsProcessing(true);
        try {
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_BASE_URL}${import.meta.env.VITE_GET_USER_CARDS_API_EP}?u=${userData.userUID}`);
            setCards(res.data.data);
        } catch (err) {
            console.log(err);
        } finally {
            setIsProcessing(false);
        }
    };

    const formatExpiryDate = (expiryDate) => {
        const [month, year] = expiryDate.split('-');
        return `${month}/${year}`;
    };

    const handleCardClick = (card) => {
        setSelectedCard(card);
    };

    const handleCloseModal = () => {
        setSelectedCard(null);
    };

    useEffect(() => {
        if (userData) {
            fetchCards();
        }
    }, [userData]);

    const CardTypeFormatter = (cardType) => {
        switch (cardType.toLowerCase()) {
            case "visa":
                return "VISA";
            case "mastercard":
                return "MASTERCARD";
            case "american express":
            case "amex":
            case "american-express":
                return "AMEX";
            case "discover":
                return "DISCOVER";
            case "jcb":
                return "JCB";
            case "diners-club":
            case "diners club":
            case "dinersclub":
                return "DINERSCLUB";
            case "maestro":
                return "MAESTRO";
            case "unionpay":
                return "UNIONPAY";
            default:
                return cardType.toUpperCase();
        }
    };

    return (
        <main className='mt-[60px] overflow-auto px-2 min-h-[calc(100vh-60px)] relative'>
            {selectedCard ? <DetailedCard userData={userData} fetchCards={fetchCards} card_number={selectedCard.card_number} onClose={handleCloseModal} userUID={userData.userUID} cvv={selectedCard.cvv} /> : (isProcessing ? (
                <div className='absolute top-1/2 translate-y-[-50%] w-full h-full flex items-center justify-center py-10 col-span-1 /md:col-span-2 pras-ov'>
                    <svg className="text-emerald-400 animate-spin w-[24px] h-[24px]" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M32 3C35.8083 3 39.5794 3.75011 43.0978 5.20749C46.6163 6.66488 49.8132 8.80101 52.5061 11.4939C55.199 14.1868 57.3351 17.3837 58.7925 20.9022C60.2499 24.4206 61 28.1917 61 32C61 35.8083 60.2499 39.5794 58.7925 43.0978C57.3351 46.6163 55.199 49.8132 52.5061 52.5061C49.8132 55.199 46.6163 57.3351 43.0978 58.7925C39.5794 60.2499 35.8083 61 32 61C28.1917 61 24.4206 60.2499 20.9022 58.7925C17.3837 57.3351 14.1868 55.199 11.4939 52.5061C8.801 49.8132 6.66487 46.6163 5.20749 43.0978C3.7501 39.5794 3 35.8083 3 32C3 28.1917 3.75011 24.4206 5.2075 20.9022C6.66489 17.3837 8.80101 14.1868 11.4939 11.4939C14.1868 8.80099 17.3838 6.66487 20.9022 5.20749C24.4206 3.7501 28.1917 3 32 3L32 3Z" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"></path>
                        <path d="M32 3C36.5778 3 41.0906 4.08374 45.1692 6.16256C49.2477 8.24138 52.7762 11.2562 55.466 14.9605C58.1558 18.6647 59.9304 22.9531 60.6448 27.4748C61.3591 31.9965 60.9928 36.6232 59.5759 40.9762" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-800"></path>
                    </svg>
                </div>
            ) : cards.length === 0 ? (
                !Cookies.get('userData')?(
                    <div className='col-span-1 md:col-span-2 flex items-center justify-center h-[calc(100vh-60px)]'>
                        <button onClick={() => navigate('/login')} className='bg-[#00EA79] rounded-md shadow hover:bg-[#006cd8] transition-all duration-300 '>
                            <h1 className='text-[#000] text-[14px] md:text-[16px] font-[500] font-bold  px-3 py-3'>Login required</h1>
                        </button>
                    </div>
                ):(<div className='absolute top-1/2 translate-y-[-50%] w-full h-full flex items-center justify-center py-10 col-span-1 /md:col-span-2'><p className='text-center text-[15px] font-[500] text-gray-500'>No cards found</p></div>)
            ) : (
                <div className='grid pt-[10px] pb-[20px] grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
                    {cards.map((card, i) => (
                        <div
                            key={i}
                            className='relative'
                            onMouseEnter={() => handleMouseEnter(i)}
                            onMouseLeave={handleMouseLeave}
                            onClick={() => handleCardClick(card)}
                        >
                            <div className={`card-inner ${flippedIndex === i ? 'flipped' : ''}`}>
                                <div className={`card-front ${card.is_active ? 'opacity-100' : 'opacity-60'}`}>
                                    <Cards
                                        cvc={''}
                                        expiry={formatExpiryDate(card.expiry_date)}
                                        name={card.is_default ?`${card.cardholder_name}(Default)` : card.cardholder_name }
                                        number={card.card_number}
                                        issuer={CardTypeFormatter(card.card_type)}
                                        preview={true}

                                    />
                                </div>
                                <div className={`card-back ${card.is_active ? 'opacity-100' : 'opacity-60'}`}>
                                    <Cards
                                        cvc={card.cvv}
                                        expiry={formatExpiryDate(card.expiry_date)}
                                        name={card.cardholder_name}
                                        number={card.card_number}
                                        issuer={CardTypeFormatter(card.card_type)}
                                        preview={true}
                                        focused="cvc"
                                    />
                                </div>
                            </div>
                            {!card.is_active && (
                                <div className="absolute inset-0 flex items-center justify-center text-red-500 text-lg font-bold">
                                    Inactive
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ))}
        </main>
    );
};

export default UserCards;
