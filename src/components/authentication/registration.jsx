import React, { useState, useRef, useEffect } from 'react'
import shape from '../../assets/shape.svg'
import reception from '../../assets/reception.svg'
import prasme from '../../assets/prasme-b.svg'
import { Link } from 'react-router-dom'
import axios from 'axios'
import cookies from 'js-cookie'
import { DecodeJWT } from '../../utils'
import { useNavigate } from 'react-router-dom'

const Register = () => {
    const [credentials, setCredentials] = useState({
        email: '',
        first_name: '',
        last_name: '',
        gender: '',
        username: '',
        currency: 'USD',
    })

    const [passwordData, setPasswordData] = useState({
        password: '',
        confirmPassword: ''
    })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [response, setResponse] = useState(null)
    const [isLoginProcessing, setIsLoginProcessing] = useState(false)
    const [isGenOpen, setisGenOpen] = useState(false);
    const [isCurrencyOpen, setisCurrencyOpen] = useState(false);


    const navigate = useNavigate()

    const handleGenOptionSelect = (selectedValue) => {
        setCredentials({ ...credentials, gender: selectedValue });

        setisGenOpen(false);
    };

    const handleCurrencyOptionSelect = (selectedValue) => {
        setCredentials({ ...credentials, currency: selectedValue });

        setisCurrencyOpen(false);
    };

    const dropdownRef = useRef(null);

    useEffect(() => {
        if (isGenOpen) {
            setisCurrencyOpen(false);
        }

    }, [isGenOpen]);

    useEffect(() => {
        if (isCurrencyOpen) {
            setisGenOpen(false);
        }
    }, [isCurrencyOpen]);

    const LoginUser = async (e) => {
        e.preventDefault()

        if (
            credentials.username === "" ||
            credentials.email === "" ||
            credentials.first_name === "" ||
            credentials.last_name === ""
        ) {
            setResponse({
                message: "Please fill all the fields",
                type: "errorInfo",
            });
            return;
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(credentials.email)) {
            setResponse({
                message: "Invalid email format",
                type: "errorInfo",
            });
            return;
        }

        const nameRegex = /^[a-zA-Z]+(?:['$-][a-zA-Z]+)?$/;

        if (
            !nameRegex.test(credentials.first_name) ||
            !nameRegex.test(credentials.last_name)
        ) {
            setResponse({
                message: "Invalid first name or last name format",
                type: "errorInfo",
            });
            return;
        }


        const usernameRegex = /^(?!.*\.\.)(?!.*\.$)[^\W][\w.]{0,29}$/;
        if (!usernameRegex.test(credentials.username)) {
            setResponse({
                message: "Invalid username format",
                type: "errorInfo",
            });
            return;
        }

        if (passwordData.password !== passwordData.confirmPassword) {
            setResponse({ message: "Passwords do not match", type: "errorInfo" });
            return;
        }

        if (
            passwordData.password.length < 8
        ) {
            setResponse({ message: "Password must be at least 8 characters", type: "errorInfo" });
            return;
        }


        setResponse(null)
        setIsLoginProcessing(true)
        try {
            const res = await axios.post(import.meta.env.VITE_BACKEND_BASE_URL + import.meta.env.VITE_REGISTER_API_EP, {
            email: credentials.email,
            password: passwordData.password,
            first_name: credentials.first_name,
            last_name: credentials.last_name,
            gender: credentials.gender,
            username: credentials.username,
            currency: credentials.currency

        })

            cookies.set('userData', res.data.data)
            setResponse({ message: res.data.message, type: 'success' })
            if (res.data.status === 'success') {
                navigate('/')
            }
        } catch (err) {
            console.log(err)
            setResponse({ message: err.response, type: 'error' })
        } finally {
            setIsLoginProcessing(false)
        }
    }

    return (
        <div style={{ backgroundImage: "url(" + shape + ")" }} className='w-full h-screen bg-center bg-cover bg-no-repeat bg-fixed bg-[#F5F6F6] flex justify-center items-center'>

            <style>
                {`
          [data-lastpass-icon-root] {
            display: none !important;
          }

        `}
            </style>
            <div className='aspect-ratio bg-[#F8FAFB] shadow-2xl rounded-3xl w-[calc(100%-2rem)] md:w-[90%] lg:w-[80%] xl:w-[70%] m-auto grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='px-6 md:px-16 py-5 md:py-24  flex flex-col justify-center items-center relative'>
                    <div className='absolute md:top-10 md:left-10 top-5 left-5'>
                        <img className='w-40' src={prasme} alt="prasme" />
                    </div>
                    <img onContextMenu={(e) => e.preventDefault()} src={reception} alt="reception" className=' mt-20 md:mt-0' />
                </div>
                <div className='px-6 md:px-16 py-5 md:py-10  gap-10 flex flex-col justify-between'>
                    <div className='w-full flex flex-col'>
                        <h1 className='text-3xl font-[500]'>
                            Create Account
                        </h1>
                        <p className='text-[#6E6E6E] text-[14px]'>Create a account to access our services</p>
                    </div>
                    <div className='w-full'>
                        <form onSubmit={LoginUser} className='w-full flex flex-col items-start justify-center rounded gap-4'>
                            <div className=' w-full grid grid-cols-1 lg:grid-cols-2  gap-3'>
                                <div className='px-3  w-full border-b rounded-md border-[#cfcfcf]  bg-[#EEF2F5] py-3 gap-5'>
                                    <div className='flex flex-col w-full'>
                                        <label htmlFor="first_name"
                                            className={`sr-only`} >First Name</label>
                                        <input
                                            autoComplete='off'
                                            placeholder='First Name'
                                            onChange={(e) => setCredentials({ ...credentials, first_name: e.target.value })}
                                            className='w-full placeholder:text-[#a7a7a7] outline-none placeholder:text-[15px] bg-transparent' type="text" name="first_name" id="first_name" />

                                    </div>
                                </div>
                                <div className=' bg-[#EEF2F5] px-3 rounded-md w-full border-b border-[#cfcfcf] flex items-center justify-center w-full py-3 gap-5'>

                                    <div className='flex flex-col w-full'>
                                        <label htmlFor="last_name"
                                            className={`sr-only`} >Last Name</label>
                                        <input
                                            onChange={(e) => setCredentials({ ...credentials, last_name: e.target.value })}
                                            className='w-full placeholder:text-[#a7a7a7] outline-none bg-transparent placeholder:text-[15px]' type="text" name="last_name" id="last_name" placeholder='Last Name' />
                                    </div>
                                </div>
                                <div className=' bg-[#EEF2F5] px-3 rounded-md w-full border-b border-[#cfcfcf] flex items-center justify-center w-full py-3 gap-5'>

                                    <div className='flex flex-col w-full'>
                                        <label htmlFor="last_name"
                                            className={`sr-only`} >Username</label>
                                        <input
                                            onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                                            className='w-full placeholder:text-[15px] placeholder:text-[#a7a7a7] outline-none bg-transparent' type="text" name="username" id="username" placeholder='Username' />
                                    </div>
                                </div>
                                <div className=' bg-[#EEF2F5]  rounded-md w-full border-b border-[#cfcfcf] flex items-center justify-center w-full py-3 gap-5'>

                                    <div className='flex flex-col w-full'>
                                        <label htmlFor="gender"
                                            className={`sr-only`} >Gender</label>
                                        <div ref={dropdownRef} className="z-20 relative">
                                            <div className="select-component">
                                                <div className="custom-select">
                                                    <div
                                                        className={`${credentials.gender ? "text-[#000000]" : "text-[#a7a7a7]"} selected-option px-3  flex items-center justify-between text-[15px]`}
                                                        onClick={() => setisGenOpen(!isGenOpen)}
                                                    >
                                                        {credentials.gender ? credentials.gender : "Select Gender"}
                                                        <svg
                                                            className={`w-4 h-4 ml-2 inline-block transform ${isGenOpen ? "rotate-180" : "rotate-0"
                                                                }`}
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            viewBox="0 0 20 20"
                                                            fill="currentColor"
                                                            aria-hidden="true"
                                                        >
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                    </div>
                                                    {isGenOpen && (
                                                        <div className={`${isGenOpen ? "max-h-[200px]" : "h-0"} transition-all duration-300 select-none options-container  overflow-y-auto absolute mt-1 bg-white border border-gray-400 w-full rounded-b-lg shadow-lg `}>
                                                            {["Male", "Female", "Other"].map((option, i) => (
                                                                <div
                                                                    key={i}
                                                                    className={`font-medium option hover:bg-gray-200 relative py-[6px] px-[8px] text-[13px]  cursor-pointer ${credentials.gender === option
                                                                        ? "bg-gray-200"
                                                                        : ""
                                                                        }`}
                                                                    onClick={() => handleGenOptionSelect(option)}
                                                                >
                                                                    {option}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className=' bg-[#EEF2F5] px-3 rounded-md w-full border-b border-[#cfcfcf] flex items-center justify-center w-full py-3 gap-5 col-span-1 lg:col-span-2'>

                                    <div className='flex flex-col w-full'>
                                        <label htmlFor="email"
                                            className={`sr-only`} >Email</label>
                                        <input
                                            onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                                            className='w-full placeholder:text-[15px] placeholder:text-[#a7a7a7] outline-none bg-transparent' type="email" name="email" id="email" placeholder='Email Address' />
                                    </div>
                                </div>
                                <div className=' bg-[#EEF2F5] px-3 rounded-md w-full border-b border-[#cfcfcf] flex items-center justify-center w-full py-3 gap-5 col-span-1 lg:col-span-2'>

                                    <div className='flex flex-col w-full'>
                                        <label htmlFor="password"
                                            className={`sr-only`} >Password</label>
                                        <input
                                            onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                                            className='w-full placeholder:text-[15px] placeholder:text-[#a7a7a7] outline-none bg-transparent' type={showPassword ? "text" : "password"} name="password" id="password" placeholder='Password' />
                                    </div>
                                    <button type='button' onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <EyeClose /> : <Eye />}
                                    </button>

                                </div>
                                <div className=' bg-[#EEF2F5] px-3 rounded-md w-full border-b border-[#cfcfcf] flex items-center justify-center w-full py-3 gap-5 col-span-1 lg:col-span-2'>

                                    <div className='flex flex-col w-full'>
                                        <label htmlFor="confirmPassword"
                                            className={`sr-only`} >Confirm Password</label>
                                        <input
                                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                            className='w-full placeholder:text-[15px] placeholder:text-[#a7a7a7] outline-none bg-transparent' type={showConfirmPassword ? "text" : "password"} name="confirmPassword" id="confirmPassword" placeholder='Confirm Password' />
                                    </div>
                                    <button type='button' onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                        {showConfirmPassword ? <EyeClose /> : <Eye />}
                                    </button>
                                </div>
                                <div className=' bg-[#EEF2F5]  rounded-md w-full border-b border-[#cfcfcf] flex items-center justify-center w-full py-3 gap-5 col-span-1 lg:col-span-2'>

                                    <div className='flex flex-col w-full'>
                                        <label htmlFor="gender"
                                            className={`sr-only`} >Currency</label>
                                        <div ref={dropdownRef} className="z-20 relative">
                                            <div className="select-component">
                                                <div className="custom-select">
                                                    <div
                                                        className={`${credentials.currency ? "text-[#000000]" : "text-[#a7a7a7]"} selected-option px-3  flex items-center justify-between text-[15px]`}
                                                        onClick={() => setisCurrencyOpen(!isCurrencyOpen)}
                                                    >
                                                        {credentials.currency ? credentials.currency : "Select Currency"}
                                                        <svg
                                                            className={`w-4 h-4 ml-2 inline-block transform ${isCurrencyOpen ? "rotate-180" : "rotate-0"
                                                                }`}
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            viewBox="0 0 20 20"
                                                            fill="currentColor"
                                                            aria-hidden="true"
                                                        >
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                    </div>
                                                    {isCurrencyOpen && (
                                                        <div className={`${isCurrencyOpen ? "max-h-[200px]" : "h-0"} transition-all duration-300 select-none options-container  overflow-y-auto absolute mt-1 bg-white border border-gray-400 w-full rounded-b-lg shadow-lg `}>
                                                            {["USD", "BDT"].map((option, i) => (
                                                                <div
                                                                    key={i}
                                                                    className={`font-medium option hover:bg-gray-200 relative py-[6px] px-[8px] text-[13px]  cursor-pointer ${credentials.currency === option
                                                                        ? "bg-gray-200"
                                                                        : ""
                                                                        }`}
                                                                    onClick={() => handleCurrencyOptionSelect(option)}
                                                                >
                                                                    {option}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {
                                response && <p className={` font-bold ${response.type === 'success' ? 'text-[#5ed0c6]' : response.type === 'error' ? 'text-[#f00]' : 'text-[#9d9500]'} text-[13px]`}>{response.message}</p>
                            }
                            <button
                                type='submit' disabled={isLoginProcessing} className={`w-24 flex justify-center bg-[#5ed0c6] text-[#ffffff] font-bold hover:bg-[#5fa7a1] transition-all duration-300 text-white py-2 rounded-full text-[13px] md:text-[14px] `}>
                                {isLoginProcessing ? (
                                    <div>
                                        <svg className="text-gray-100 animate-spin w-[19.5px] h-[19.5px] md:w-[21px] md:h-[21px]" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M32 3C35.8083 3 39.5794 3.75011 43.0978 5.20749C46.6163 6.66488 49.8132 8.80101 52.5061 11.4939C55.199 14.1868 57.3351 17.3837 58.7925 20.9022C60.2499 24.4206 61 28.1917 61 32C61 35.8083 60.2499 39.5794 58.7925 43.0978C57.3351 46.6163 55.199 49.8132 52.5061 52.5061C49.8132 55.199 46.6163 57.3351 43.0978 58.7925C39.5794 60.2499 35.8083 61 32 61C28.1917 61 24.4206 60.2499 20.9022 58.7925C17.3837 57.3351 14.1868 55.199 11.4939 52.5061C8.801 49.8132 6.66487 46.6163 5.20749 43.0978C3.7501 39.5794 3 35.8083 3 32C3 28.1917 3.75011 24.4206 5.2075 20.9022C6.66489 17.3837 8.80101 14.1868 11.4939 11.4939C14.1868 8.80099 17.3838 6.66487 20.9022 5.20749C24.4206 3.7501 28.1917 3 32 3L32 3Z"
                                                stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"></path>
                                            <path
                                                d="M32 3C36.5778 3 41.0906 4.08374 45.1692 6.16256C49.2477 8.24138 52.7762 11.2562 55.466 14.9605C58.1558 18.6647 59.9304 22.9531 60.6448 27.4748C61.3591 31.9965 60.9928 36.6232 59.5759 40.9762"
                                                stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" className="text-[#00877c]">
                                            </path>
                                        </svg>
                                    </div>
                                ) : "Login"}



                            </button>
                        </form>
                        <p className='mt-8 text-[#6E6E6E] text-[13px] '>Already have an account? <Link to='/login' className='text-[#5ed0c6] font-bold hover:underline'>Login</Link></p>
                    </div>
                    {/* <div className='flex flex-col items-start gap-2'>
                        <h1 className='text-[#6E6E6E]'>or</h1>
                        <button className='border border-[#5ed0c6]  rounded-full'><img className='w-6' src="https://services.google.com/fh/files/misc/google_g_icon_download.png" alt="" /></button>
                    </div> */}
                </div>
            </div>
        </div>
    )
}

export default Register



export const Eye = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="" viewBox="0 0 16 16">
            <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z" />
            <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0" />
        </svg>
    )
}

export const EyeClose = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="" viewBox="0 0 16 16">
            <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7 7 0 0 0-2.79.588l.77.771A6 6 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755q-.247.248-.517.486z" />
            <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829" />
            <path d="M3.35 5.47q-.27.24-.518.487A13 13 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7 7 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12z" />
        </svg>
    )
}
