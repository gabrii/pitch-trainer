import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileTopBar from './MobileTopBar';

export default function Layout({ children }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const closeDrawer = () => setDrawerOpen(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 h-screen border-r border-zinc-200 bg-white overflow-y-auto">
        <Sidebar onClose={closeDrawer} />
      </aside>

      {/* Mobile/tablet drawer */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={closeDrawer}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-zinc-200 transform transition-transform duration-200 lg:hidden overflow-y-auto ${
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex justify-end px-3 pt-3 lg:hidden">
          <button
            onClick={closeDrawer}
            className="text-xs font-semibold text-zinc-400 hover:text-zinc-700 px-2 py-1 rounded hover:bg-zinc-100 transition-colors"
          >
            Done
          </button>
        </div>
        <Sidebar onClose={closeDrawer} />
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 flex flex-col overflow-y-auto">
        <MobileTopBar onMenuClick={() => setDrawerOpen(true)} />
        <div className="flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
