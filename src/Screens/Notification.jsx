import React, { useEffect, useState } from "react";
import axios from "axios";
import FeedbackModal from "../Component/FeedbackModal";

const NotificationPage = () => {
  const baseURL = import.meta.env.VITE_BASE_URL;
  const [notifications, setNotifications] = useState([]);
  const [notificationId, setNotificationId] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [showConfirmButtons, setShowConfirmButtons] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(`${baseURL}/notifications`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        });

        // here to
        // const fetchedNotification = response.data?.notifications || [];
        const fetchedNotification = response.data?.notifications || [];

        const sortedNotifications = [...fetchedNotification].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );

        setNotificationId(sortedNotifications.map((notID) => notID.id));
        setNotifications(sortedNotifications);
        // here

        const fetchId = fetchedNotification.map((notID) => notID.id);
        setNotificationId(fetchId);
        setNotifications(fetchedNotification);
        console.log("Fetched notifications:", fetchedNotification);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // every 10 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  const handleActions = (id, actionType) => {
    setNotificationId(id);
    setFeedbackMessage(
      `Are you sure you want to ${
        actionType == 1 ? "approve" : "deny"
      } this request?`
    );
    setShowConfirmButtons(true);
    setFeedbackModalOpen(true);
    setActionType(actionType);
  };

  const handleNotificationAction = async () => {
    // setConfirmDeleteId(id);
    if (!notificationId && !actionType) return;
    console.log("Notification ID:", notificationId);
    console.log("Action:", actionType);

    try {
      const response = await axios.post(
        `${baseURL}/notifications`,
        {
          notification_id: notificationId,
          action: actionType,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        setShowConfirmButtons(false);
        setFeedbackModalOpen(false);
        setRemovingId(notificationId);

        setTimeout(() => {
          setNotifications((prev) =>
            prev.filter((note) => note.id !== notificationId)
          );
          setRemovingId(null);
        }, 300);
      }
    } catch (error) {
      console.error("Error handling notification:", error);
    }
  };
  function formatDateTime(dateString) {
    const date = new Date(dateString);
    const time = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
    const day = date.toLocaleDateString("en-GB");
    return `${day}, ${time}`;
  }

  return (
    <div className="rounded-md  ">
      <div className="flex justify-between items-center mb-4">
        {/* <h2 className="heading">Notifications</h2> */}
        {/* <button className="buttonGrey">Clear All</button> */}
      </div>

      {notifications.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500 subHeading text-center">No notifications found.</p>
        </div>
      ) : (
        notifications.map((note) => {
          const { id, data } = note;
          const innerData = data;

          return (
            // <div
            //   key={id}
            //   className="bg-white shadow-sm border border-gray-200 rounded-lg p-4 mb-4 flex justify-between items-start"
            // >
            <div
              key={id}
              className={`bg-white shadow-sm border border-gray-200 rounded-lg p-4 mb-4 flex justify-between items-start transition-all duration-300 ease-in-out ${
                removingId === id
                  ? "opacity-0 scale-95"
                  : "opacity-100 scale-100"
              }`}
            >
              <div>
                <p className="paragraphBold">
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-bold text-indigo-900 mb-1">
                      {innerData.userName || "User"}{" "}
                    </p>
                    {innerData.message || "User"}{" "}
                    {innerData.fromDT ? (
                      <strong className="notClass">
                        {formatDateTime(innerData.fromDT)}
                      </strong>
                    ) : null}
                    {innerData.toDT ? (
                      <strong className="notClass">
                        to {formatDateTime(innerData.toDT)}
                      </strong>
                    ) : null}{" "}
                    {innerData.day ? (
                      // <strong className="notClass">{innerData.day}</strong>

                      <span className="bg-rosterGreen text-indigo-900 px-2 py-1 rounded-full">
                        Day: {innerData.day}
                      </span>
                    ) : null}{" "}
                  </div>
                </p>
                <p className="paragraphThin">
                  {innerData.reason ? (
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-indigo-900 mb-1">
                        Reason:
                      </p>
                      <p>{innerData.reason}</p>
                    </div>
                  ) : null}
                  {/* Reason: {innerData.reason || "No reason provided"} */}
                </p>
              </div>
              {innerData.status != null ? null : (
                <div className="flex gap-2 mt-2 sm:mt-0">
                  <button
                    className="buttonSuccess"
                    onClick={() => handleActions(id, 1)}
                  >
                    Approve
                  </button>
                  <button
                    className="buttonDanger"
                    onClick={() => handleActions(id, 2)}
                  >
                    Deny
                  </button>
                </div>
              )}
            </div>
          );
        })
      )}
      <FeedbackModal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        message={feedbackMessage}
        onConfirm={handleNotificationAction}
        showConfirmButtons={showConfirmButtons}
      />
    </div>
  );
};

export default NotificationPage;
