import React, { useEffect, useState } from "react";
import SideBar from "./SideBar";
import { useDispatch } from "react-redux";
import { getUser } from "../../store/userSlice";

const Dashboard = () => {
  const [username, setUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
const dispatch = useDispatch()


  const handleSave = () => {
    if (newPassword !== confirmPassword) {
      alert("New password and confirm password do not match!");
      return;
    }
    alert("Profile updated successfully!");
  };
  useEffect(()=>{
    const fetchUser=async ()=>{
      const action = await dispatch(getUser())
      if(getUser.fulfilled.match(action)){
      setUsername(action.payload.username)
        
      }
    }
    fetchUser();
  },[])

  return (
    <div>
      <SideBar/>
      <div className="flex justify-center    items-center min-h-screen ">
      <div className=" p-6 w-full sm:w-96">
      
            <div className="mb-4">
          <label className="block text-gray-700 text-sm font-semibold mb-2">Username</label>
          <input
            type="text"
            value={username}
            // onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-semibold mb-2">Current Password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-semibold mb-2">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-semibold mb-2">Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Save Changes
        </button>
      </div>
    </div>
    </div>
  );
};

export default Dashboard;
