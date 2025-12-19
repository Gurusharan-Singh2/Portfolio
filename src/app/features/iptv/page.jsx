"use client";

import { useEffect, useState } from "react";
import parser from "iptv-playlist-parser";
import IPTVPlayer from "@/components/IPTVPlayer";
import { PLAYLISTS } from "@/utils/playlists";
import { motion, AnimatePresence } from "framer-motion";
import { FaList, FaChevronLeft, FaSearch, FaTv } from "react-icons/fa";

const Page = () => {
  const [playlistUrl, setPlaylistUrl] = useState(PLAYLISTS.languages.Punjabi);
  const [channels, setChannels] = useState([]);
  const [filteredChannels, setFilteredChannels] = useState([]);
  const [current, setCurrent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch(playlistUrl)
      .then((res) => res.text())
      .then((data) => {
        const parsed = parser.parse(data);
        const items = parsed.items.filter((i) => i.url);
        setChannels(items.slice(0, 300));
        setFilteredChannels(items.slice(0, 300));
        setCurrent(items[0]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [playlistUrl]);

  useEffect(() => {
    const filtered = channels.filter((ch) =>
      ch.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredChannels(filtered);
  }, [searchTerm, channels]);

  return (
    <div className="flex h-screen bg-zinc-950 text-white overflow-hidden relative">
      {/* Sidebar Toggle Button (Mobile) */}
      <button
        onClick={() => setShowSidebar(!showSidebar)}
        className="lg:hidden absolute top-4 left-4 z-50 p-3 bg-violet-600 rounded-full shadow-lg"
      >
        <FaList />
      </button>

      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {showSidebar && (
          <motion.div
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute lg:relative z-40 w-80 h-full bg-zinc-900 border-r border-zinc-800 flex flex-col shadow-2xl"
          >
            <div className="p-6 border-b border-zinc-800">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <FaTv className="text-violet-500" /> Live Tv Player
                </h2>
                <button 
                  onClick={() => setShowSidebar(false)}
                  className="p-2 hover:bg-zinc-800 rounded-lg lg:hidden"
                >
                  <FaChevronLeft />
                </button>
              </div>

              {/* Playlist Selector */}
              <select
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-violet-500 outline-none mb-4"
                onChange={(e) => setPlaylistUrl(e.target.value)}
              >
                <optgroup label="Languages">
                  {Object.entries(PLAYLISTS.languages).map(([n, u]) => (
                    <option key={n} value={u}>{n}</option>
                  ))}
                </optgroup>
                <optgroup label="Categories">
                  {Object.entries(PLAYLISTS.categories).map(([n, u]) => (
                    <option key={n} value={u}>{n}</option>
                  ))}
                </optgroup>
                <optgroup label="Countries">
                  {Object.entries(PLAYLISTS.countries).map(([n, u]) => (
                    <option key={n} value={u}>{n}</option>
                  ))}
                </optgroup>
                <optgroup label="All">
                  <option value={PLAYLISTS.all.All}>All Channels</option>
                </optgroup>
              </select>

              {/* Search Bar */}
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm" />
                <input
                  type="text"
                  placeholder="Search channels..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-2 pl-9 pr-4 text-sm focus:ring-2 focus:ring-violet-500 outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-40 gap-3">
                  <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-zinc-500 text-sm">Loading channels...</p>
                </div>
              ) : (
                <div className="p-2">
                  {filteredChannels.map((ch, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setCurrent(ch);
                        // On mobile, close sidebar after selecting
                        if (window.innerWidth < 1024) setShowSidebar(false);
                      }}
                      className={`w-full text-left p-3 rounded-xl transition-all duration-200 mb-1 flex items-center gap-3 group ${
                        current?.url === ch.url
                          ? "bg-violet-600 text-white shadow-lg shadow-violet-900/20"
                          : "hover:bg-zinc-800 text-zinc-400 hover:text-white"
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full ${current?.url === ch.url ? "bg-white animate-pulse" : "bg-zinc-700 group-hover:bg-violet-500"}`} />
                      <span className="truncate text-sm font-medium">
                        {ch.name || "Unnamed Channel"}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content / Player Area */}
      <div className="flex-1 flex flex-col relative">
        {!showSidebar && (
           <button
           onClick={() => setShowSidebar(true)}
           className="absolute top-4 left-4 z-30 p-3 bg-zinc-800 hover:bg-zinc-700 rounded-full shadow-lg transition-all"
         >
           <FaList />
         </button>
        )}
        
        <div className="flex-1 bg-black flex items-center justify-center">
          {current ? (
            <div className="w-full h-full max-h-[calc(100vh-4rem)]">
              <IPTVPlayer url={current.url} />
            </div>
          ) : (
            <div className="text-center p-10">
              <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl text-violet-500">
                 <FaTv />
              </div>
              <h3 className="text-2xl font-bold mb-2">No Channel Selected</h3>
              <p className="text-zinc-500">Pick something from the list to start watching.</p>
            </div>
          )}
        </div>

        {/* Info Bar */}
        {current && (
           <div className="h-16 bg-zinc-900 border-t border-zinc-800 px-6 flex items-center justify-between">
              <div className="flex items-center gap-4 truncate">
                 <div className="w-10 h-10 bg-violet-600/20 rounded-lg flex items-center justify-center text-violet-500 font-bold shrink-0">
                    {current.name?.charAt(0) || "?"}
                 </div>
                 <div className="truncate">
                    <h4 className="font-bold truncate">{current.name || "Unknown Channel"}</h4>
                    <p className="text-xs text-zinc-500">Live Streaming</p>
                 </div>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                 <span className="px-3 py-1 bg-green-500/10 text-green-500 text-[10px] font-bold uppercase tracking-wider rounded-full border border-green-500/20">
                    Live
                 </span>
              </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default Page;

