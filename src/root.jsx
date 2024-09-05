import React, { createContext, useState, useContext } from 'react';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
    const [refreshKey, setRefreshKey] = useState(0);

    const refreshApp = () => {
        setRefreshKey(prevKey => prevKey + 1);
    };

    return (
        <AppContext.Provider value={{ refreshApp }}>
            <div key={refreshKey}>{children}</div>
        </AppContext.Provider>
    );
};
