import React, { useState } from 'react'
import shape from '../../assets/shape.svg'
import reception from '../../assets/reception.svg'
import prasme from '../../assets/prasme-b.svg'
import { Link } from 'react-router-dom'
import axios from 'axios'
import Cookies from 'js-cookie'
import { DecodeJWT } from '../../utils'
import { useNavigate } from 'react-router-dom'
const Login = () => {
    const [activeFeild, setActiveFeild] = useState(null)
    const [credentials, setCredentials] = useState({
        email: '',
        password: ''
    })
    const [response, setResponse] = useState(null)
    const [isLoginProcessing, setIsLoginProcessing] = useState(false)

    const navigate = useNavigate()


    const LoginUser = async (e) => {
        e.preventDefault()


        const emailOrUsernameRegex = /^(?:[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}|[a-zA-Z0-9_-]{3,30})$/;

        if (!emailOrUsernameRegex.test(credentials.email)) {
            setResponse({
                message: "Invalid email or username format",
                type: "errorInfo",
            });
            return;
        }

        if (credentials.password.length === 0) {
            setResponse({
                message: "Please fill all the fields",
                type: "errorInfo",
            });
            return;
        }

        setResponse(null)
        setIsLoginProcessing(true)
        try {
            const res = await axios.post(import.meta.env.VITE_BACKEND_BASE_URL + import.meta.env.VITE_LOGIN_API_EP, credentials)


            if (res.data.status === 'success') {
                Cookies.set('userData', res.data.data, { expires: 30 })
                setResponse({ message: res.data.message, type: 'success' })
                navigate('/')
            }
        } catch (err) {
            setResponse({ message: err.response.data.message, type: 'error' })
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
            <div className='aspect-ratio bg-[#F8FAFB] shadow-2xl rounded-3xl  md:h-[80%] w-[calc(100%-2rem)] md:w-[90%] lg:w-[80%] xl:w-[70%] m-auto grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='px-6 md:px-16 py-5 md:py-24 flex flex-col justify-center items-center relative'>
                    <div className='absolute left-5 top-5 md:top-10 md:left-10'>
                        <img className='w-40' src={prasme} alt="prasme" />
                    </div>
                    <img onContextMenu={(e) => e.preventDefault()} src={reception} alt="reception" className=' mt-20 md:mt-0' />
                </div>
                <div className='px-6 md:px-16 py-5 md:py-24 gap-10 md:gap-0 flex flex-col justify-evenly'>
                    <div className='w-full flex flex-col'>
                        <h1 className='text-3xl font-[500]'>
                            Welcome Back
                        </h1>
                        <p className='text-[#6E6E6E] text-[14px]'>To use our service please login with your credentials</p>
                    </div>
                    <div className='w-full'>
                        <form onSubmit={LoginUser} className='w-full flex flex-col items-start justify-center rounded gap-4'>
                            <div className=' bg-[#EEF2F5] w-full'>
                                <div className='px-5 flex items-center justify-center w-full border-b border-[#cfcfcf] py-3 gap-5'>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" className="text-[#8b8b8b]" viewBox="0 0 16 16">
                                        <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1zm13 2.383-4.708 2.825L15 11.105zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741M1 11.105l4.708-2.897L1 5.383z" />
                                    </svg>
                                    <div className='flex flex-col w-full'>
                                        <label htmlFor="email"
                                            className={`text-[#6E6E6E] cursor-pointer text-[13px] transition-all duration-300 select-none ${activeFeild === 'email' || credentials.email.length !== 0 ? 'mt-0 mb-1' : '-mb-6'} z-10`} >Email Address</label>
                                        <input onFocus={() => setActiveFeild('email')}
                                            autoComplete='off'
                                            onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                                            onBlur={() => setActiveFeild(null)} className='w-full outline-none bg-transparent' type="text" name="email" id="email" />

                                    </div>
                                </div>
                                <div className='px-5 flex items-center justify-center w-full py-3 gap-5'>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" className="text-[#8b8b8b]" viewBox="0 0 16 16">
                                        <path d="M5.338 1.59a61 61 0 0 0-2.837.856.48.48 0 0 0-.328.39c-.554 4.157.726 7.19 2.253 9.188a10.7 10.7 0 0 0 2.287 2.233c.346.244.652.42.893.533q.18.085.293.118a1 1 0 0 0 .101.025 1 1 0 0 0 .1-.025q.114-.034.294-.118c.24-.113.547-.29.893-.533a10.7 10.7 0 0 0 2.287-2.233c1.527-1.997 2.807-5.031 2.253-9.188a.48.48 0 0 0-.328-.39c-.651-.213-1.75-.56-2.837-.855C9.552 1.29 8.531 1.067 8 1.067c-.53 0-1.552.223-2.662.524zM5.072.56C6.157.265 7.31 0 8 0s1.843.265 2.928.56c1.11.3 2.229.655 2.887.87a1.54 1.54 0 0 1 1.044 1.262c.596 4.477-.787 7.795-2.465 9.99a11.8 11.8 0 0 1-2.517 2.453 7 7 0 0 1-1.048.625c-.28.132-.581.24-.829.24s-.548-.108-.829-.24a7 7 0 0 1-1.048-.625 11.8 11.8 0 0 1-2.517-2.453C1.928 10.487.545 7.169 1.141 2.692A1.54 1.54 0 0 1 2.185 1.43 63 63 0 0 1 5.072.56" />
                                        <path d="M9.5 6.5a1.5 1.5 0 0 1-1 1.415l.385 1.99a.5.5 0 0 1-.491.595h-.788a.5.5 0 0 1-.49-.595l.384-1.99a1.5 1.5 0 1 1 2-1.415" />
                                    </svg>
                                    <div className='flex flex-col w-full'>
                                        <label htmlFor="password"
                                            className={`text-[#6E6E6E] cursor-pointer text-[13px] transition-all duration-300 select-none ${activeFeild === 'password' || credentials.password.length !== 0 ? 'mt-0 mb-1' : '-mb-6'} z-10`} >Password</label>
                                        <input onFocus={() => setActiveFeild('password')}
                                            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                            onBlur={() => setActiveFeild(null)} className='w-full outline-none bg-transparent' type="password" name="password" id="password" />
                                    </div>
                                </div>
                            </div>
                            {
                                response && <p className={` font-bold ${response.type === 'success' ? 'text-[#5ed0c6]' : response.type === 'errorInfo' ? 'text-[#9d9500]' : 'text-[#f00]'} text-[13px]`}>{response.message}</p>
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
                        <p className='mt-8 text-[#6E6E6E] text-[13px] '>Don't have an account? <Link to='/register' className='text-[#5ed0c6] font-bold hover:underline'>Sign Up</Link></p>
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

export default Login
