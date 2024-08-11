import React from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const ExportAsExcel = ({ data, fileName, buttonName, className }) => {
    const exportToExcel = () => {
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
                fill: {
                    fgColor: { rgb: "FFFF00" }
                },
                font: {
                    bold: true
                },
                alignment: {
                    horizontal: "left"
                }
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

    return (
        <button onClick={exportToExcel} className={`${className}`}>
            {buttonName || "Export to Excel"}
        </button>
    );
};

export default ExportAsExcel;