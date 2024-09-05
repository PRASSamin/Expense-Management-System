import React, { useState, useEffect } from 'react'
import cookies from 'js-cookie'
import { DecodeJWT, LogOut } from '../../utils'
import prasme from '../../assets/prasme-b.svg'
import prasmeOBJ from '../../assets/prasme-b-obj.svg'
import Cookies from 'js-cookie'
import { useNavigate } from 'react-router-dom'
import Dashboard from './subcompos/dashboard'
import Incomes from './subcompos/incomes'
import Expenses from './subcompos/expenses'
import Reports from './subcompos/reports'
import BankAccounts from './subcompos/baccounts'

const Home = ({ activeTab }) => {
  const [userData, setUserData] = useState(null)
  const [isCollapsed, setIsCollapsed] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 || window.innerHeight < 600) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };

    handleResize();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const token = cookies.get('userData')
    if (token) {
      const decoded = DecodeJWT(token)
      setUserData(decoded)
    }
  }, [])



  return (
    <div className={`w-full h-screen bg-[#F5F6F6] flex justify-center items-center`}>
      <section className={`${isCollapsed ? "min-w-[50px] px-2" : "min-w-[200px] px-5"}  transition-all duration-300 shadow-sm z-10 h-screen bg-[#ffffff]  relative pt-[70px]`}>
        <h1 className="sr-only">Sidebar</h1>
        <ul className='flex flex-col gap-1 text-[14px] '>
          <li>
            <button onClick={() => navigate('/dashboard')} type='button' className={`${activeTab === 'dashboard' ? 'bg-[#D6EBFE] text-[#4495DE] font-bold hover:bg-[#a4d3ff]' : 'hover:bg-[#d8d8d8]'} flex items-center gap-2  p-2 rounded w-full`}>
              <div>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-boxes" viewBox="0 0 16 16">
                  <path d="M7.752.066a.5.5 0 0 1 .496 0l3.75 2.143a.5.5 0 0 1 .252.434v3.995l3.498 2A.5.5 0 0 1 16 9.07v4.286a.5.5 0 0 1-.252.434l-3.75 2.143a.5.5 0 0 1-.496 0l-3.502-2-3.502 2.001a.5.5 0 0 1-.496 0l-3.75-2.143A.5.5 0 0 1 0 13.357V9.071a.5.5 0 0 1 .252-.434L3.75 6.638V2.643a.5.5 0 0 1 .252-.434zM4.25 7.504 1.508 9.071l2.742 1.567 2.742-1.567zM7.5 9.933l-2.75 1.571v3.134l2.75-1.571zm1 3.134 2.75 1.571v-3.134L8.5 9.933zm.508-3.996 2.742 1.567 2.742-1.567-2.742-1.567zm2.242-2.433V3.504L8.5 5.076V8.21zM7.5 8.21V5.076L4.75 3.504v3.134zM5.258 2.643 8 4.21l2.742-1.567L8 1.076zM15 9.933l-2.75 1.571v3.134L15 13.067zM3.75 14.638v-3.134L1 9.933v3.134z" />
                </svg></div><span className={isCollapsed ? "hidden" : "block"}>Dashboard</span>
            </button>
          </li>

          <li className='flex items-center gap-2'>
            <button onClick={() => navigate('/incomes')} type='button' className={`${activeTab === 'incomes' ? 'bg-[#D6EBFE] text-[#4495DE] font-bold hover:bg-[#a4d3ff]' : 'hover:bg-[#d8d8d8] '} flex items-center gap-2 p-2 rounded w-full`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-credit-card" viewBox="0 0 16 16">
                <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v1h14V4a1 1 0 0 0-1-1zm13 4H1v5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1z" />
                <path d="M2 10a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1z" />
              </svg>
              <span className={isCollapsed ? "hidden" : "block"}>Incomes</span>
            </button>
          </li>
          <li className='flex items-center gap-2'>
            <button onClick={() => navigate('/expenses')} type='button' className={`${activeTab === 'expenses' ? 'bg-[#D6EBFE] text-[#4495DE] font-bold hover:bg-[#a4d3ff]' : 'hover:bg-[#d8d8d8]'} flex items-center gap-2 p-2 rounded w-full`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-cart" viewBox="0 0 16 16">
                <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5M3.102 4l1.313 7h8.17l1.313-7zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4m7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4m-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2m7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2" />
              </svg>
              <span className={isCollapsed ? "hidden" : "block"}>Expenses</span>
            </button>
          </li>
          <li className=''>
            <button onClick={() => navigate('/reports')} type='button' className={`${activeTab === 'reports' ? 'bg-[#D6EBFE] text-[#4495DE] font-bold hover:bg-[#a4d3ff]' : 'hover:bg-[#d8d8d8]'} flex items-center gap-2 p-2 rounded w-full`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-bar-chart-line" viewBox="0 0 16 16">
                <path d="M11 2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12h.5a.5.5 0 0 1 0 1H.5a.5.5 0 0 1 0-1H1v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3h1V7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7h1zm1 12h2V2h-2zm-3 0V7H7v7zm-5 0v-3H2v3z" />
              </svg>
              <span className={isCollapsed ? "hidden" : "block"}>Reports</span>
            </button>
          </li>
          <li className=''>
            <button id='accountsTab' onClick={() =>{
              if (window.location.pathname !== '/accounts') {
                navigate('/accounts')

              }
            } 
          } 
            type='button' className={`${activeTab === 'accounts' ? 'bg-[#D6EBFE] text-[#4495DE] font-bold hover:bg-[#a4d3ff]' : 'hover:bg-[#d8d8d8]'} flex items-center gap-2 p-2 rounded w-full`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-bank" viewBox="0 0 16 16">
                <path d="m8 0 6.61 3h.89a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5H15v7a.5.5 0 0 1 .485.38l.5 2a.498.498 0 0 1-.485.62H.5a.498.498 0 0 1-.485-.62l.5-2A.5.5 0 0 1 1 13V6H.5a.5.5 0 0 1-.5-.5v-2A.5.5 0 0 1 .5 3h.89zM3.777 3h8.447L8 1zM2 6v7h1V6zm2 0v7h2.5V6zm3.5 0v7h1V6zm2 0v7H12V6zM13 6v7h1V6zm2-1V4H1v1zm-.39 9H1.39l-.25 1h13.72z" />
              </svg>
              <span className={isCollapsed ? "hidden" : "block"}>Accounts</span>
            </button>
          </li>
          {Cookies.get('userData') ? <li className='absolute bottom-3 left-1/2 -translate-x-1/2'>
            <button onClick={() => LogOut()} type='button' className={`bg-[#ffffff] text-[#000000] font-bold hover:bg-[#d8d8d8] transition-all duration-300 flex items-center gap-2 ${isCollapsed ? 'p-2' : 'px-3 py-2'} rounded w-full`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-box-arrow-right" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z" />
                <path fillRule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z" />
              </svg>
              <span className={isCollapsed ? "hidden" : "block"}>Logout</span>
            </button>
          </li> : null}
        </ul>
      </section>
      <section className={`w-full bg-[#F8F8FA] main h-screen overflow-auto ${activeTab === 'incomes' || activeTab === 'expenses' || activeTab === 'accounts' ? "pras-ov" : ""}`}>
        <div className={`w-full h-[60px] bg-[#ffffff] py-3 flex items-center shadow-sm z-30 justify-between absolute top-0 left-0`}>
          <h1 className="sr-only">Top Header</h1>
          <button onClick={() => {
            navigate('/')
          }} className={`h-full ${isCollapsed ? "min-w-[50px]" : "min-w-[200px]"} transition-all duration-300 flex items-center justify-center border-r-[2px] border-[#f1f1f1]`}>
            <img onContextMenu={(e) => e.preventDefault()} src={isCollapsed ? prasmeOBJ : prasme} alt="prasme" className='h-full' />
          </button>
          <div className='flex items-center justify-end md:justify-between w-full'>
            <button type='button' onClick={() => setIsCollapsed(!isCollapsed)} className={`px-6 ${isCollapsed ? "rotate-180" : ""} transition-all duration-300 hidden md:block`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="text-[#000000]" viewBox="0 0 16 16">
                <path d="M9.34 8.005c0-4.38.01-7.972.023-7.982C9.373.01 10.036 0 10.831 0c1.153 0 1.51.01 1.743.05 1.73.298 3.045 1.6 3.373 3.326.046.242.053.809.053 4.61 0 4.06.005 4.537-.123 4.976-.022.076-.048.15-.08.242a4.14 4.14 0 0 1-3.426 2.767c-.317.033-2.889.046-2.978.013-.05-.02-.053-.752-.053-7.979m4.675.269a1.62 1.62 0 0 0-1.113-1.034 1.61 1.61 0 0 0-1.938 1.073 1.9 1.9 0 0 0-.014.935 1.63 1.63 0 0 0 1.952 1.107c.51-.136.908-.504 1.11-1.028.11-.285.113-.742.003-1.053M3.71 3.317c-.208.04-.526.199-.695.348-.348.301-.52.729-.494 1.232.013.262.03.332.136.544.155.321.39.556.712.715.222.11.278.123.567.133.261.01.354 0 .53-.06.719-.242 1.153-.94 1.03-1.656-.142-.852-.95-1.422-1.786-1.256" />
                <path d="M3.425.053a4.14 4.14 0 0 0-3.28 3.015C0 3.628-.01 3.956.005 8.3c.01 3.99.014 4.082.08 4.39.368 1.66 1.548 2.844 3.224 3.235.22.05.497.06 2.29.07 1.856.012 2.048.009 2.097-.04.05-.05.053-.69.053-7.94 0-5.374-.01-7.906-.033-7.952-.033-.06-.09-.063-2.03-.06-1.578.004-2.052.014-2.26.05Zm3 14.665-1.35-.016c-1.242-.013-1.375-.02-1.623-.083a2.81 2.81 0 0 1-2.08-2.167c-.074-.335-.074-8.579-.004-8.907a2.85 2.85 0 0 1 1.716-2.05c.438-.176.64-.196 2.058-.2l1.282-.003v13.426Z" />
              </svg>
            </button>
            {
              Cookies.get('userData') ? (
                <div className='px-7 flex flex-col '>
                  <h1 className='text-[#000] text-[12px] md:text-[14px] fzfont-bold'>
                    {userData?.first_name} {userData?.last_name}</h1>
                  <h2 className='text-right text-[#6E6E6E] text-[12px] md:text-[14px]'>@{userData?.username}</h2>
                </div>

              ) : (
                <div className='px-4 flex items-center gap-1'>
                  <button onClick={() => navigate('/login')} className='text-[#000] text-[12px] md:text-[14px] bg-[#00EA79] px-4 py-1.5 rounded hover:bg-[#00bf66] transition-all duration-300'>Login</button>
                  <button onClick={() => navigate('/register')} className='text-[#000] text-[12px] md:text-[14px] bg-[#d9d9d9] px-4 py-1.5 rounded hover:bg-[#c0c0c0] transition-all duration-300'>Register</button>
                </div>
              )
            }
          </div>
        </div>
        {
          activeTab === 'dashboard' ? <Dashboard userData={userData} /> : activeTab === 'incomes' ? <Incomes userData={userData} /> : activeTab === 'expenses' ? <Expenses userData={userData} /> : activeTab === 'accounts' ? <BankAccounts userData={userData} /> : <Reports userData={userData} />}
      </section>
    </div>
  )
}

export default Home