import { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components -- hook must live alongside its provider
export const useAuth = () => {
    return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
    // Read synchronously so the very first render already knows whether
    // there's a session — avoids a flash of logged-out UI before an effect
    // would otherwise fire.
    const [currentUser, setCurrentUser] = useState(() => localStorage.getItem('userId'));

    const value = {
        currentUser, setCurrentUser
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
