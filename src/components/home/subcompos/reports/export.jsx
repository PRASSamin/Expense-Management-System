import React, { useRef, useState, useEffect } from 'react'
import { exportDataToExcel, exportDataToCSV, exportDataToJSON } from '../../../../utils';

const ExportWindow = ({ isOpen, setIsOpen, data }) => {
    const [type, setType] = useState("Lifetime")
    const dropdownRef = useRef(null);
    const [isFormatDropdownOpen, setIsFormatDropdownOpen] = useState(false);
    const [format, setFormat] = useState("Excel");

    const removeNestedObjects = (data, fieldsToRemove = []) => {
        const isObject = (value) => value && typeof value === 'object' && !Array.isArray(value);

        const removeFields = (obj) => {
            if (!isObject(obj)) return obj;

            return Object.keys(obj).reduce((acc, key) => {
                if (!fieldsToRemove.includes(key)) {
                    acc[key] = isObject(obj[key]) ? removeFields(obj[key]) : obj[key];
                }
                return acc;
            }, {});
        };

        if (Array.isArray(data)) {
            return data.map(item => removeFields(item));
        } else if (isObject(data)) {
            return removeFields(data);
        } else {
            throw new Error("Input must be an object or array of objects");
        }
    };

    const handleExport = (e) => {
        e.preventDefault();
        if (format === "") {
            alert("Please select a format");
            return;
        } else if (format === "Excel") {
            if (type === "Lifetime") {
                exportDataToExcel([removeNestedObjects(data.lifetimeReport, ["Income Sources", "Expense Sources"])], `Lifetime Report(${data.lifetimeReport.Period})`);
            } else if (type === "Monthly") {
                exportDataToExcel(removeNestedObjects(data.monthlyReport, ["Income Sources", "Expense Sources"]), `Monthly Report(${data.lifetimeReport.Period})`);
            } else if (type === "Yearly") {
                exportDataToExcel(removeNestedObjects(data.yearlyReport, ["Income Sources", "Expense Sources"]), `Yearly Report(${data.lifetimeReport.Period})`);
            }
        } else if (format === "JSON") {
            if (type === "Lifetime") {
                exportDataToJSON([data.lifetimeReport], `Lifetime Report(${data.lifetimeReport.Period})`);
            } else if (type === "Monthly") {
                exportDataToJSON(data.monthlyReport, `Monthly Report(${data.lifetimeReport.Period})`);
            } else if (type === "Yearly") {
                exportDataToJSON(data.yearlyReport, `Yearly Report(${data.lifetimeReport.Period})`);
            }
        } else if (format === "CSV") {
            if (type === "Lifetime") {
                exportDataToCSV([removeNestedObjects(data.lifetimeReport, ["Income Sources", "Expense Sources"])], `Lifetime Report(${data.lifetimeReport.Period})`);
            } else if (type === "Monthly") {
                exportDataToCSV(removeNestedObjects(data.monthlyReport, ["Income Sources", "Expense Sources"]), `Monthly Report(${data.lifetimeReport.Period})`);
            } else if (type === "Yearly") {
                exportDataToCSV(removeNestedObjects(data.yearlyReport, ["Income Sources", "Expense Sources"]), `Yearly Report(${data.lifetimeReport.Period})`);
            }
        }
    }


    return (
        <div onClick={() => setIsOpen(false)} className={`fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-50 ${isOpen ? 'block' : 'hidden'} flex justify-center items-center`}>
            <div onClick={e => e.stopPropagation()} className='relative aspect-[12/16] h-[80%] flex flex-col justify-between rounded shadow-sm shadow-black/50 bg-white px-4 py-3'>
                <div className='flex flex-col'>
                    <h1 className='text-lg font-bold'>Export Report</h1>
                    <div className='flex gap-10 mt-7 items-center'>
                        <h2 className='text-[15px] font-bold text-gray-400'>Type</h2>
                        <div className='flex'>
                            <button onClick={() => setType("Lifetime")} className={`rounded-l font-bold ${type === "Lifetime" ? 'bg-[#4495E4] hover:bg-[#317cbd] text-white hover:border-[#317cbd]' : 'text-[#4495E4] '} border-[#4495E4] transition-all duration-300 px-3 text-sm md:text-md py-2 border `}>
                                Lifetime
                            </button>
                            <button onClick={() => setType("Yearly")} className={` bg- ${type === "Yearly" ? 'bg-[#4495E4] hover:bg-[#317cbd] text-white hover:border-[#317cbd]' : 'text-[#4495E4] '} font-bold border px-3 text-sm md:text-md transition-all duration-300 py-2 border-[#4495E4]`}>
                                Yearly
                            </button>
                            <button onClick={() => setType("Monthly")} className={`rounded-r  ${type === "Monthly" ? 'bg-[#4495E4] hover:bg-[#317cbd] hover:bg-[#317cbd] text-white' : 'text-[#4495E4] '} font-bold border border-[#4495E4] transition-all duration-300 px-3 text-sm md:text-md py-2 `}>
                                Monthly
                            </button>
                        </div>
                    </div>
                    <div className='flex gap-[22px] mt-7 items-center'>
                        <h2 className='text-[15px] font-bold text-gray-400'>Format</h2>
                        <div className='flex w-full select-none'>
                            <div ref={dropdownRef} className="z-20 relative w-full">
                                <div className="select-component">
                                    <div className="custom-select">
                                        <div
                                            className={`${format ? "text-[#000000]" : "text-[#a7a7a7]"} selected-option px-3 py-2 border border-[#4495E4]  flex items-center justify-between text-sm rounded cursor-pointer w-full font-bold`}
                                            onClick={() => setIsFormatDropdownOpen(!isFormatDropdownOpen)}
                                        >
                                            {format ? format : "Select Gender"}
                                            <svg
                                                className={`w-4 h-4 ml-2 inline-block transform ${isFormatDropdownOpen ? "rotate-180" : "rotate-0"
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
                                        {isFormatDropdownOpen && (
                                            <div className={`${isFormatDropdownOpen ? "max-h-[200px]" : "h-0"} transition-all duration-300 select-none  options-container  overflow-y-auto absolute mt-1 bg-[#f1f1f1] w-full rounded shadow-md `}>
                                                {["Excel (.xlsx)", "JSON (.json)", "CSV (.csv)"].map((option, i) => (
                                                    <div
                                                        key={i}
                                                        className={`font-bold option
                                                            transition-all duration-300  relative py-[8px] px-[10px] text-[13px]  cursor-pointer ${format.includes(option.split(" ")[0])
                                                                ? "bg-[#4495E4] hover:bg-[#317cbd] text-white"
                                                                : "hover:bg-gray-400"
                                                            }`}
                                                        onClick={() => {
                                                            setIsFormatDropdownOpen(false)
                                                            setFormat(option.split(" ")[0])

                                                        }}
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
                <button type='button' onClick={handleExport} className='mt-5 w-full bg-[#4495E4] hover:bg-[#317cbd] text-white hover:border-[#317cbd] font-bold px-3 text-sm md:text-md transition-all duration-300 py-2 rounded'>Export</button>
            </div>

        </div>
    )
}

export default ExportWindow
