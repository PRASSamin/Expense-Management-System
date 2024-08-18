import React from 'react'

const Alert = ({ status, message, className, onClose }) => {
    return (
        <div className={`${className} text-left text-[12px] font-[500] w-full md:text-[14px] rounded-b mb-2 ${status === "success" ? "text-green-800 border-t-4 border-green-400 bg-green-200" : status === 'info' ? "text-blue-800 border-t-4 border-blue-400 bg-blue-200" : "bg-[#ffe0e0] text-[#9B1C1C] border-t-4 border-[#F8B4B4]"} pl-3 pr-2 py-2 flex items-center justify-between`}><span>{message}</span>
            <button onClick={() => {
                onClose(null)
            }} type='button' className={`p-1 ${status === "success" ? " hover:bg-green-300 text-green-500" : status === 'info' ? " hover:bg-blue-300 text-blue-500" : "hover:bg-[#F8B4B4] text-[#9B1C1C]"} rounded cursor-pointer`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-x" viewBox="0 0 16 16">
                    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
                </svg>
            </button>
        </div>
    )
}

export default Alert
