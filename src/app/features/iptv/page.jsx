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

        const playable = parsed.items
          .filter((ch) => ch.url)
          .slice(0, 300);

        setChannels(playable);
        setFilteredChannels(playable);
        setCurrent(playable[0] || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [playlistUrl]);

  /* =========================
     Search filter
  ========================= */
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
              </select>

              {/* Search */}
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
                <div className="flex items-center justify-center h-40">
                  Loading…
                </div>
              ) : (
                <div className="p-2">
                  {filteredChannels.map((ch, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setCurrent(ch);
                        if (window.innerWidth < 1024) setShowSidebar(false);
                      }}
                      className={`w-full text-left p-3 rounded-xl mb-1 ${
                        current?.url === ch.url
                          ? "bg-violet-600"
                          : "hover:bg-zinc-800 text-zinc-400 hover:text-white"
                      }`}
                    >
                      {ch.name || "Unnamed Channel"}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Player */}
      <div className="flex-1 bg-black flex items-center justify-center">
        {current ? (
          <IPTVPlayer
            url={current.url}
            
          />
        ) : (
          <p>No playable channel selected</p>
        )}
      </div>
    </div>
  );
};

export default Page;
