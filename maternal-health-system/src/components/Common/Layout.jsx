import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const Layout = ({ children, role }) => {
  const [isMobileVisible, setIsMobileVisible] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleMenuClick = (width) => {
    if (width < 1024) {
      setIsMobileVisible((prev) => !prev);
    } else {
      setIsCollapsed((prev) => !prev);
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar
        isMobileVisible={isMobileVisible}
        isCollapsed={isCollapsed}
        role={role}
      />
      <div className="flex flex-col flex-1">
        <Topbar
          onMenuClick={handleMenuClick}
          isSidebarCollapsed={isCollapsed}
        />
        <main className="p-4">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
