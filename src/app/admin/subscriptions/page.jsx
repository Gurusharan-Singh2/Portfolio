"use client";

import { useState, useEffect } from "react";
import { FaCrown, FaSearch, FaUser, FaCheck, FaTimes, FaRupeeSign } from "react-icons/fa";

export default function SubscriptionsAdmin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [price, setPrice] = useState(199);
  const [duration, setDuration] = useState(30);
  const [search, setSearch] = useState("");
  const [updatingPrice, setUpdatingPrice] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token") || document.cookie.split("token=")[1]?.split(";")[0];
      
      const [usersRes, settingsRes] = await Promise.all([
        fetch("/api/admin/subscriptions", {
            headers: { "Authorization": `Bearer ${token}` }
        }),
        fetch("/api/admin/settings", {
            headers: { "Authorization": `Bearer ${token}` }
        })
      ]);

      const usersData = await usersRes.json();
      const settingsData = await settingsRes.json();

      setUsers(usersData.users || []);
      setPrice(settingsData.subscription_price || 199);
      setDuration(settingsData.subscription_duration || 30);
    } catch (err) {
      console.error(err);
      alert("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handlePriceUpdate = async () => {
    setUpdatingPrice(true);
    try {
       const token = localStorage.getItem("token") || document.cookie.split("token=")[1]?.split(";")[0];
       await fetch("/api/admin/settings", {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
            subscription_price: Number(price),
            subscription_duration: Number(duration)
        })
      });
      alert("Settings updated successfully");
    } catch (err) {
      alert("Failed to update settings");
    } finally {
      setUpdatingPrice(false);
    }
  };

  const handleToggleSub = async (userId, currentStatus) => {
    try {
      const token = localStorage.getItem("token") || document.cookie.split("token=")[1]?.split(";")[0];
      await fetch("/api/admin/subscriptions", {
        method: "PUT",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ userId, isSubscribed: !currentStatus })
      });
      fetchData(); // Refresh list
    } catch (err) {
      alert("Failed to update user");
    }
  };

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <FaCrown className="text-yellow-500" /> Subscription Management
      </h1>

      {/* Price Management */}
      <div className="bg-zinc-800 p-6 rounded-xl mb-8 border border-zinc-700">
        <h2 className="text-xl font-semibold mb-4 text-violet-400">⚙️ Configuration</h2>
        <div className="flex items-end gap-4 flex-wrap">
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Subscription Price (INR)</label>
            <div className="relative">
              <FaRupeeSign className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input 
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="bg-zinc-900 border border-zinc-700 rounded-lg py-2 pl-8 pr-4 text-white focus:ring-2 focus:ring-violet-500 outline-none w-48"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Subscription Duration (Days)</label>
            <input 
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 rounded-lg py-2 px-4 text-white focus:ring-2 focus:ring-violet-500 outline-none w-32"
              min="1"
            />
          </div>
          <button 
            onClick={handlePriceUpdate}
            disabled={updatingPrice}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {updatingPrice ? "Updating..." : "Update Settings"}
          </button>
        </div>
      </div>

      {/* User Management */}
      <div className="bg-zinc-800 rounded-xl border border-zinc-700 overflow-hidden">
        <div className="p-4 border-b border-zinc-700 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-xl font-semibold">Users ({filteredUsers.length})</h2>
          <div className="relative w-full sm:w-64">
             <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
             <input 
                type="text"
                placeholder="Search email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg py-2 pl-9 pr-4 text-white focus:ring-2 focus:ring-violet-500 outline-none"
             />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-zinc-900 text-zinc-400 uppercase text-xs">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Role</th>
                <th className="p-4 text-center">Daily Usage</th>
                <th className="p-4 text-center">Sub Start</th>
                <th className="p-4 text-center">Sub End</th>
                <th className="p-4 text-center">Days Left</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-700">
              {loading ? (
                <tr>
                   <td colSpan="8" className="p-8 text-center text-zinc-500">Loading users...</td>
                </tr>
              ) : filteredUsers.map(user => {
                const daysLeft = user.subscriptionEndDate 
                  ? Math.ceil((new Date(user.subscriptionEndDate) - new Date()) / (1000 * 60 * 60 * 24)) 
                  : 0;
                  
                return (
                <tr key={user._id} className="hover:bg-zinc-750">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center">
                        <FaUser className="text-zinc-400 text-xs" />
                      </div>
                      <div className="flex flex-col">
                         <span className="font-medium">{user.email}</span>
                         <span className="text-xs text-zinc-500">ID: {user._id?.slice(-6)}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    {user.isAdmin ? (
                        <span className="px-2 py-1 rounded bg-purple-900/40 text-purple-400 text-xs font-bold border border-purple-800">ADMIN</span>
                    ) : (
                        <span className="px-2 py-1 rounded bg-zinc-700/40 text-zinc-400 text-xs border border-zinc-600">USER</span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <span className={`font-mono font-bold ${user.dailyQuizCount >= 3 ? 'text-red-400' : 'text-green-400'}`}>
                        {user.dailyQuizCount}/3
                    </span>
                  </td>
                  <td className="p-4 text-center text-xs text-zinc-400">
                    {user.subscriptionStartDate ? new Date(user.subscriptionStartDate).toLocaleDateString() : "-"}
                  </td>
                  <td className="p-4 text-center text-xs text-zinc-400">
                    {user.subscriptionEndDate ? new Date(user.subscriptionEndDate).toLocaleDateString() : "-"}
                  </td>
                   <td className="p-4 text-center">
                    {user.isSubscribed ? (
                        <span className={`text-xs font-bold ${daysLeft < 5 ? 'text-orange-400' : 'text-zinc-300'}`}>
                            {Math.max(0, daysLeft)} Days
                        </span>
                    ) : (
                        <span className="text-zinc-600 text-xs">-</span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    {user.isSubscribed ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-green-900/40 text-green-400 text-xs font-bold border border-green-800">
                            <FaCheck size={10} /> PREMIUM
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-zinc-700 text-zinc-400 text-xs border border-zinc-600">
                            FREE PLAN
                        </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <button
                        onClick={() => handleToggleSub(user._id, user.isSubscribed)}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                            user.isSubscribed
                             ? 'border-red-800 text-red-400 hover:bg-red-900/20'
                             : 'border-green-800 text-green-400 hover:bg-green-900/20'
                        }`}
                    >
                        {user.isSubscribed ? "Revoke" : "Grant"}
                    </button>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
          {!loading && filteredUsers.length === 0 && (
             <div className="p-8 text-center text-zinc-500">No users found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
