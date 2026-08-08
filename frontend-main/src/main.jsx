import ReactDOM from 'react-dom/client'
import './index.css'
import { AuthProvider } from './authContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'
import ProjectRoutes from './Routes.jsx';
import { BrowserRouter as Router } from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('root')).render(
  <ToastProvider>
    <AuthProvider>
      <Router>
        <ProjectRoutes />
      </Router>
    </AuthProvider>
  </ToastProvider>
);
