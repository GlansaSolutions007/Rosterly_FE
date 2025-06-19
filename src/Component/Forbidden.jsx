import { useNavigate } from "react-router-dom";
import { LockClosedIcon } from "@heroicons/react/24/outline";

const Forbidden = () => {
    const navigate = useNavigate();

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
            <div className="bg-white p-8 rounded-2xl shadow-md max-w-md text-center">
                <div className="flex justify-center mb-4">
                    <LockClosedIcon className="h-16 w-16 text-red-500" />
                </div>
                <h1 className="text-4xl font-bold text-gray-800 mb-2">403</h1>
                <p className="text-lg text-gray-600 mb-4">Access Denied</p>
                <p className="text-gray-500 mb-6">
                    You don't have permission to view this page.
                </p>
                <button
                    onClick={() => navigate("/")}
                    className="buttonSuccess text-white font-semibold py-2 px-6 rounded-lg transition"
                >
                    Go to Home
                </button>
            </div>
        </div>
    );
};

export default Forbidden;
