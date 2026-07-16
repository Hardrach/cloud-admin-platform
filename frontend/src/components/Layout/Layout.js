import React, { useState } from 'react';
import Sidebar from './Sidebar/Sidebar';
import Navbar from './Navbar/Navbar';
import Footer from './Footer/Footer';
import ToastProvider from '../Toast/Toast';
import ConfirmDialogProvider from '../ConfirmDialog/ConfirmDialog';
import PageTransition from '../PageTransition/PageTransition';

const Layout = ({ children, activeItem, setActiveItem, isLightTheme, themePreference, setThemePreference, toggleGlobalTheme }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <ToastProvider>
      <ConfirmDialogProvider>
        <div className="app-container">
          {/* Background Overlay for mobile sidebar */}
          {isMobileOpen && (
            <div 
              className="position-fixed top-0 start-0 w-100 h-100 bg-dark opacity-50 z-3 d-md-none"
              onClick={() => setIsMobileOpen(false)}
            />
          )}

          {/* Sidebar Navigation */}
          <Sidebar 
            isCollapsed={isCollapsed} 
            setIsCollapsed={setIsCollapsed} 
            activeItem={activeItem}
            setActiveItem={setActiveItem}
            isMobileOpen={isMobileOpen}
            setIsMobileOpen={setIsMobileOpen}
          />

          {/* Main Content Area */}
          <div className="main-wrapper">
            <Navbar 
              activeItem={activeItem}
              isMobileOpen={isMobileOpen}
              setIsMobileOpen={setIsMobileOpen}
              isLightTheme={isLightTheme}
              themePreference={themePreference}
              setThemePreference={setThemePreference}
              toggleGlobalTheme={toggleGlobalTheme}
            />
            
            <main className="content-container">
              <PageTransition key={activeItem.id}>
                {children}
              </PageTransition>
            </main>

            <Footer />
          </div>
        </div>
      </ConfirmDialogProvider>
    </ToastProvider>
  );
};

export default Layout;
