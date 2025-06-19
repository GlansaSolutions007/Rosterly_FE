import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoutes = ({ element, allowedRoles, userRole }) => {
    const location = useLocation();

    if (!allowedRoles.includes(userRole)) {
        return <Navigate to="/forbidden" state={{ from: location }} replace />;
    }
    console.log("UserRole:", userRole, "AllowedRoles:", allowedRoles);
    return element;
};

export default ProtectedRoutes;
