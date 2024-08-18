import { jwtDecode } from "jwt-decode";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Cookies from 'js-cookie'
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const DecodeJWT = (token) => {
    return jwtDecode(token);
}


/**
 * Generates an Excel file from the given data and triggers a download.
 * @param {Array<Object>} data - The data to be included in the Excel file.
 * @param {string} fileName - The name of the file to be downloaded.
 */
export const exportDataToExcel = (data, fileName) => {
    if (!Array.isArray(data) || data.length === 0) {

    }

    if (typeof data[0] !== 'object') {
        console.error("Invalid data format: The first item in the data array should be an object.");
        return;
    }

    const wb = XLSX.utils.book_new();

    const headers = Object.keys(data[0]).map(header =>
        header.replace(/[_-]/g, ' ').replace(/\b\w/g, char => char.toUpperCase())
    );

    const formattedData = data.map(row => {
        let formattedRow = {};
        headers.forEach((header, index) => {
            formattedRow[header] = row[Object.keys(row)[index]];
        });
        return formattedRow;
    });

    const ws = XLSX.utils.json_to_sheet(formattedData, { header: headers });

    const wsCols = Object.keys(data[0]).length;
    const columnWidthInInches = 2;
    const columnWidthInChars = columnWidthInInches * 10;
    ws['!cols'] = Array(wsCols).fill({ wch: columnWidthInChars });

    const headerRange = XLSX.utils.decode_range(ws['!ref']);
    for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
        if (!ws[cellAddress]) continue;
        ws[cellAddress].s = {
            fill: { fgColor: { rgb: "FFFF00" } },
            font: { bold: true },
            alignment: { horizontal: "left" }
        };
    }

    for (let R = headerRange.s.r + 1; R <= headerRange.e.r; ++R) {
        for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
            const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
            if (!ws[cellAddress]) continue;
            if (!ws[cellAddress].s) ws[cellAddress].s = {};
            ws[cellAddress].s.alignment = { horizontal: "left" };
        }
    }

    XLSX.utils.book_append_sheet(wb, ws, "Data");

    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([wbout], { type: "application/octet-stream" }), `${fileName}.xlsx`);
};


/**
 * Exports the given data as a JSON file and triggers a download.
 * @param {Array<Object>} data - The data to be included in the JSON file.
 * @param {string} fileName - The name of the file to be downloaded.
 */
export const exportDataToJSON = (data, fileName) => {
    if (!Array.isArray(data) || data.length === 0) {
        console.error("Invalid data format: The data array is empty or not an array.");
        return;
    }

    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    saveAs(blob, `${fileName}.json`);
};


/**
 * Exports the given data as a CSV file and triggers a download.
 * @param {Array<Object>} data - The data to be included in the CSV file.
 * @param {string} fileName - The name of the file to be downloaded.
 */
export const exportDataToCSV = (data, fileName) => {
    if (!Array.isArray(data) || data.length === 0) {
        console.error("Invalid data format: The data array is empty or not an array.");
        return;
    }

    if (typeof data[0] !== 'object') {
        console.error("Invalid data format: The first item in the data array should be an object.");
        return;
    }

    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => {
        return Object.values(row).map(value => `"${value}"`).join(',');
    });

    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    saveAs(blob, `${fileName}.csv`);
};


export const LogOut = () => {
    Cookies.remove('userData');
    window.location.href = '/login';
}


export const getUniqueCategories = (data) => {
    const categories = data.map(item => item.category);
    const uniqueCategories = [...new Set(categories)];
    return uniqueCategories;
};




export const getMyData = async (uid) => {
    try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_BASE_URL}${import.meta.env.VITE_GET_MY_DATA_API_EP}?u=${uid}`);

        if (res.status === 200) {
            return res.data;
        }
    } catch (err) {
        console.log(err);
    }
}
