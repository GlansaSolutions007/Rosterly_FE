import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaUserSlash } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import FeedbackModal from "../Component/FeedbackModal";

const DeletedUser = () => {
    const baseURL = import.meta.env.VITE_BASE_URL;
    const profileBaseURL = import.meta.env.VITE_PROFILE_BASE_URL;

    const [deletedUsers, setDeletedUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [confirmRestoreId, setConfirmRestoreId] = useState(null);
    const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState("");
    const [showConfirmButtons, setShowConfirmButtons] = useState(false);

    useEffect(() => {
        fetchDeletedUsers();
    }, []);

    const fetchDeletedUsers = () => {
        const token = localStorage.getItem("token");
        axios
            .get(`${baseURL}/users/deleted`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            })
            .then((response) => {
                setDeletedUsers(response.data.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching deleted users:", error);
                setLoading(false);
            });
    };

    const handleRestoreClick = (id) => {
        setConfirmRestoreId(id);
        setFeedbackMessage("Are you sure you want to restore this user?");
        setShowConfirmButtons(true);
        setFeedbackModalOpen(true);
    };

    const confirmRestoreUser = async () => {
        const token = localStorage.getItem("token");

        try {
            await axios.post(`${baseURL}/users/restore/${confirmRestoreId}`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });

            setDeletedUsers((prev) =>
                prev.filter((user) => user.id !== confirmRestoreId)
            );

            setFeedbackMessage("User restored successfully!");
            setConfirmRestoreId(null);
            setShowConfirmButtons(false);
            setTimeout(() => setFeedbackMessage(""), 3000);
        } catch (error) {
            console.error("Restore failed:", error);
            setFeedbackMessage("Failed to restore user.");
        } finally {
            setFeedbackModalOpen(false);
        }
    };

    const handleCloseModal = () => {
        setConfirmRestoreId(null);
        setFeedbackModalOpen(false);
    };

    return (
        <div className="relative min-h-[60vh]">
            {loading && <p>Loading users...</p>}

            {!loading && deletedUsers.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <FaUserSlash className="text-gray-400 text-3xl mr-2" />
                    <p className="text-gray-500 text-lg text-center">
                        No deleted users found.
                    </p>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 mb-8">
                {deletedUsers.map((profile) => (
                    <div key={profile.id} className="w-full">
                        <div className="shadow-xl p-4 rounded-xl h-full flex flex-col justify-between mSideBarInactive">
                            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                                <div className="flex items-center gap-4 min-w-0">
                                    {profile.profileImage ? (
                                        <img
                                            alt="Profile"
                                            src={
                                                profile.profileImage.startsWith("http")
                                                    ? profile.profileImage
                                                    : `${profileBaseURL}/${profile.profileImage}`
                                            }
                                            className="h-20 w-20 rounded-full object-cover"
                                        />
                                    ) : (
                                        <CgProfile className="h-20 w-20 rounded-full bg-gray-200 p-2" />
                                    )}
                                    <div className="text-left w-full min-w-0 overflow-hidden">
                                        <h3 className="paragraphBold md:subheadingBold break-words">
                                            {profile.firstName} {profile.lastName}
                                        </h3>
                                        <p className="paragraphThin break-words">{profile.email}</p>
                                        <p className="paragraphThin break-words">
                                            {profile.mobileNumber}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-wrap justify-between w-full">
                                {/* Left content (if any) */}

                                <div className="ml-auto">
                                    <button
                                        className="buttonSuccess"
                                        title="Restore"
                                        onClick={() => handleRestoreClick(profile.id)}
                                    >
                                        Restore
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <FeedbackModal
                isOpen={feedbackModalOpen}
                onClose={handleCloseModal}
                message={feedbackMessage}
                onConfirm={confirmRestoreUser}
                showConfirmButtons={showConfirmButtons}
            />
        </div>
    );
};

export default DeletedUser;
