import { createContext, useCallback, useContext, useRef, useState } from "react";
import "./toast.css";

const ToastContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components -- hook must live alongside its provider
export const useToast = () => useContext(ToastContext);

let idCounter = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismissToast = useCallback((id) => {
    setToasts((current) => current.filter((t) => t.id !== id));
    clearTimeout(timers.current[id]);
    delete timers.current[id];
  }, []);

  const showToast = useCallback((message, type = "info", duration = 4000) => {
    const id = ++idCounter;
    setToasts((current) => [...current, { id, message, type }]);
    timers.current[id] = setTimeout(() => dismissToast(id), duration);
    return id;
  }, [dismissToast]);

  const value = {
    showToast,
    showSuccess: (message) => showToast(message, "success"),
    showError: (message) => showToast(message, "error"),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-stack" role="status" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast-item toast-${toast.type}`}>
            <span>{toast.message}</span>
            <button
              className="toast-dismiss"
              aria-label="Dismiss notification"
              onClick={() => dismissToast(toast.id)}
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
