import React, { useState, useEffect } from "react";
import tipsData from "../../data/healthTips.json";
import Sidebar from "../../components/Common/Sidebar";
import Topbar from "../../components/Common/Topbar";
import { IoLanguageOutline, IoSearchOutline } from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";

const MotherHealthTips = () => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [language, setLanguage] = useState("en");
  const [search, setSearch] = useState("");
  const [filteredTips, setFilteredTips] = useState(tipsData);
  const [openTip, setOpenTip] = useState(null);

  // Close sidebar on outside click (mobile)
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        isSidebarVisible &&
        !e.target.closest(".sidebar") &&
        !e.target.closest(".menu-btn")
      ) {
        setIsSidebarVisible(false);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [isSidebarVisible]);

  // Language toggle
  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "yo" : "en"));
  };

  // Filter tips based on search
  useEffect(() => {
    const query = search.toLowerCase();
    const filtered = tipsData.filter(
      (tip) =>
        tip.title[language].toLowerCase().includes(query) ||
        (tip.description?.[language] &&
          tip.description[language].toLowerCase().includes(query)) ||
        tip.content[language].some((point) =>
          point.toLowerCase().includes(query)
        )
    );
    setFilteredTips(filtered);
  }, [search, language]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        isMobileVisible={isSidebarVisible}
        isCollapsed={isSidebarCollapsed}
        role="mother"
      />

      {/* Main Section */}
      <div
        className={`flex-1 transition-all duration-300 ${
          isSidebarCollapsed ? "lg:ml-20" : "lg:ml-60"
        }`}
      >
        <Topbar
          onMenuClick={(width) => {
            if (width < 1024) {
              setIsSidebarVisible((prev) => !prev);
            } else {
              setIsSidebarCollapsed((prev) => !prev);
            }
          }}
          isCollapsed={isSidebarCollapsed}
        />

        {/* Page Content */}
        <div className="p-4 md:p-6 lg:p-8 font-pop max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">
              Health Tips
            </h1>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={`Search tips (${
                    language === "en" ? "English" : "Yorùbá"
                  })...`}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 w-64"
                />
              </div>

              {/* Language toggle */}
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-md text-sm transition"
              >
                <IoLanguageOutline className="w-5 h-5" />
                {language === "en" ? "Yorùbá" : "English"}
              </button>
            </div>
          </div>

          {/* Tips List */}
          <div className="space-y-4">
            {filteredTips.length > 0 ? (
              filteredTips.map((tip) => (
                <div
                  key={tip.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200"
                >
                  {/* Accordion Header */}
                  <button
                    className="flex justify-between items-center w-full p-4 text-left"
                    onClick={() =>
                      setOpenTip(openTip === tip.id ? null : tip.id)
                    }
                  >
                    <h2 className="text-lg font-medium text-purple-700">
                      {tip.title[language]}
                    </h2>
                    {openTip === tip.id ? (
                      <ChevronUp className="w-5 h-5 text-purple-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-purple-600" />
                    )}
                  </button>

                  {/* Accordion Content */}
                  <AnimatePresence>
                    {openTip === tip.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="px-5 pb-5"
                      >
                        {/* Description */}
                        {tip.description?.[language] && (
                          <p className="text-gray-600 text-sm mb-3">
                            {tip.description[language]}
                          </p>
                        )}

                        {/* Content */}
                        <ul className="space-y-2 text-gray-700 text-sm md:text-base leading-relaxed">
                          {tip.content[language].map((point, i) => (
                            <li key={i} className="pl-2">
                              {point}
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No tips found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MotherHealthTips;
