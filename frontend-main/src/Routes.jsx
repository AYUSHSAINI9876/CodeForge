import { useRoutes } from 'react-router-dom'

// Pages List
import Dashboard from "./components/dashboard/Dashboard";
import Profile from "./components/user/Profile";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import CreateRepo from "./components/repo/CreateRepo";
import RepoDetail from "./components/repo/RepoDetail";
import { ProtectedRoute, PublicOnlyRoute } from "./components/common/ProtectedRoute";

const ProjectRoutes = () => {
    let element = useRoutes([
        {
            path: "/",
            element: <ProtectedRoute><Dashboard /></ProtectedRoute>
        },
        {
            path: "/create",
            element: <ProtectedRoute><CreateRepo /></ProtectedRoute>
        },
        {
            path: "/repo/:id",
            element: <ProtectedRoute><RepoDetail /></ProtectedRoute>
        },
        {
            path: "/auth",
            element: <PublicOnlyRoute><Login /></PublicOnlyRoute>
        },
        {
            path: "/signup",
            element: <PublicOnlyRoute><Signup /></PublicOnlyRoute>
        },
        {
            path: "/profile",
            element: <ProtectedRoute><Profile /></ProtectedRoute>
        },
        {
            path: "/profile/:id",
            element: <ProtectedRoute><Profile /></ProtectedRoute>
        }
    ]);

    return element;
}

export default ProjectRoutes;
