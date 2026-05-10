"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ThemeToggler from "./ThemeToggler";
import menuData from "./menuData";
import { useAuth } from "@/context/AuthContext";
import { logout } from "../../../backend/auth";

const Header = () => {
  const { user, loading } = useAuth();

  // Navbar toggle
  const [navbarOpen, setNavbarOpen] = useState(false);
  const navbarToggleHandler = () => {
    setNavbarOpen(!navbarOpen);
  };

  // Profile Modal
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Sticky Navbar
  const [sticky, setSticky] = useState(false);
  const handleStickyNavbar = () => {
    if (window.scrollY >= 80) {
      setSticky(true);
    } else {
      setSticky(false);
    }
  };
  useEffect(() => {
    window.addEventListener("scroll", handleStickyNavbar);
    return () => window.removeEventListener("scroll", handleStickyNavbar);
  }, []);

  // submenu handler
  const [openIndex, setOpenIndex] = useState(-1);
  const handleSubmenu = (index: number) => {
    if (openIndex === index) {
      setOpenIndex(-1);
    } else {
      setOpenIndex(index);
    }
  };

  const usePathName = usePathname();

  const menuList = (!loading && user && user.role === 'admin')
    ? [{ id: 99, title: "Admin", path: "/admin", newTab: false }, ...menuData]
    : menuData;

  return (
    <>
      <header
        className={`header top-6 left-1/2 -translate-x-1/2 z-50 flex w-[92%] max-w-[1200px] items-center transition-all duration-500 ease-in-out fixed rounded-[2rem] ${sticky
          ? "py-3 bg-white/80 dark:bg-[#0A0F2D]/80 backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/30 dark:border-white/10"
          : "py-5 bg-transparent"
          }`}
      >
        <div className="container px-4 sm:px-8">
          <div className="relative flex items-center justify-between">
            <div className="w-60 max-w-full">
              <Link
                href="/"
                className="header-logo block w-full group"
              >
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform duration-500">
                    <span className="text-white font-black text-xl">T</span>
                  </div>
                  <span className="text-2xl font-black text-black dark:text-white tracking-tighter group-hover:text-primary transition-all duration-500">
                    TRL <span className="text-primary group-hover:text-black dark:group-hover:text-white">&amp; CLR</span>
                  </span>
                </div>
              </Link>
            </div>
            <div className="flex items-center justify-end flex-1 gap-2 sm:gap-6">
              <button
                onClick={navbarToggleHandler}
                id="navbarToggler"
                aria-label="Mobile Menu"
                className="ring-primary block rounded-lg px-3 py-[6px] focus:ring-2 lg:hidden"
              >
                <span
                  className={`relative my-1.5 block h-0.5 w-[30px] bg-black transition-all duration-300 dark:bg-white ${navbarOpen ? "top-[7px] rotate-45" : " "
                    }`}
                />
                <span
                  className={`relative my-1.5 block h-0.5 w-[30px] bg-black transition-all duration-300 dark:bg-white ${navbarOpen ? "opacity-0" : " "
                    }`}
                />
                <span
                  className={`relative my-1.5 block h-0.5 w-[30px] bg-black transition-all duration-300 dark:bg-white ${navbarOpen ? "top-[-8px] -rotate-45" : " "
                    }`}
                />
              </button>
              <nav
                id="navbarCollapse"
                className={`navbar border-body-color/50 dark:border-body-color/20 dark:bg-dark absolute right-0 z-30 w-[250px] rounded-2xl border-[.5px] bg-white px-6 py-4 duration-300 lg:visible lg:static lg:w-auto lg:border-none lg:!bg-transparent lg:p-0 lg:opacity-100 ${navbarOpen
                  ? "visibility top-full mt-4 opacity-100 shadow-xl"
                  : "invisible top-[120%] opacity-0"
                  }`}
              >
                <ul className="block lg:flex lg:space-x-8">
                  {menuList.map((menuItem, index) => (
                    <li key={index} className="group relative">
                      {menuItem.path ? (
                        <Link
                          href={menuItem.path}
                          className={`relative flex py-2 text-[13px] font-black uppercase tracking-[0.15em] lg:mr-0 lg:inline-flex lg:px-0 lg:py-6 transition-all duration-500 ease-in-out group ${usePathName === menuItem.path
                            ? "text-primary"
                            : "text-dark/70 hover:text-primary dark:text-white/60 dark:hover:text-white"
                            }`}
                        >
                          {menuItem.title}
                          {/* Animated Underline */}
                          <span className={`absolute bottom-4 left-0 h-[3px] bg-primary rounded-full transition-all duration-500 ease-in-out ${usePathName === menuItem.path ? "w-full" : "w-0 group-hover:w-full"}`}></span>
                        </Link>
                      ) : (
                        <div className="relative group/submenu">
                          <p
                            onClick={() => handleSubmenu(index)}
                            className="text-dark/70 hover:text-primary dark:text-white/60 dark:hover:text-white flex cursor-pointer items-center justify-between py-2 text-[13px] font-black uppercase tracking-[0.15em] lg:mr-0 lg:inline-flex lg:px-0 lg:py-6"
                          >
                            {menuItem.title}
                            <span className="pl-1 transition-transform group-hover/submenu:rotate-180 duration-300">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                            </span>
                          </p>
                          <div
                            className={`submenu dark:bg-[#0A0F2D] relative top-full left-0 rounded-2xl bg-white transition-all duration-300 lg:invisible lg:absolute lg:top-[110%] lg:block lg:w-[220px] lg:p-3 lg:opacity-0 lg:shadow-[0_15px_40px_rgba(0,0,0,0.15)] lg:group-hover:visible lg:group-hover:top-full border border-black/5 dark:border-white/10 ${openIndex === index ? "block" : "hidden"
                              }`}
                          >
                            {menuItem.submenu.map((submenuItem, index) => (
                              <Link
                                href={submenuItem.path}
                                key={index}
                                className="text-dark/70 hover:text-primary block rounded-xl py-2.5 px-4 text-xs font-bold uppercase tracking-wider transition-all hover:bg-primary/5 dark:text-white/60 dark:hover:text-white"
                              >
                                {submenuItem.title}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="flex items-center gap-3 sm:gap-4">
                {!loading && (
                  <>
                    {user ? (
                      <div className="relative">
                        <button
                          onClick={() => setProfileModalOpen(!profileModalOpen)}
                          className="flex items-center gap-3 p-1 pr-3 sm:p-1.5 sm:pr-4 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all duration-300 group border border-transparent hover:border-primary/20"
                        >
                          <div className="relative h-9 w-9 sm:h-10 sm:w-10 overflow-hidden rounded-xl border-2 border-primary/20 group-hover:border-primary transition-all duration-300 shadow-sm">
                            <Image
                              src={user.photoURL || "/images/blog/author-02.png"}
                              alt="User"
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex flex-col items-start hidden sm:flex">
                            <span className="text-[12px] font-black text-black dark:text-white line-clamp-1 max-w-[80px] leading-none mb-1">
                              {user.displayName?.split(' ')[0] || "Usuario"}
                            </span>
                            <div className="flex items-center gap-1 opacity-50">
                              <span className="text-[8px] uppercase font-black tracking-widest">
                                {user.role === 'admin' ? 'Admin' : 'Pro'}
                              </span>
                            </div>
                          </div>
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className={`text-primary transition-transform duration-300 hidden sm:block ${profileModalOpen ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6"/></svg>
                        </button>

                        {/* Profile Dropdown - Modern Design */}
                        {profileModalOpen && (
                          <>
                            <div
                              className="fixed inset-0 z-40"
                              onClick={() => setProfileModalOpen(false)}
                            ></div>
                            <div className="absolute right-0 mt-3 z-50 w-64 origin-top-right rounded-[20px] bg-white dark:bg-dark shadow-[0_15px_40px_rgba(0,0,0,0.12)] dark:shadow-[0_15px_40px_rgba(0,0,0,0.25)] ring-1 ring-black/5 dark:ring-white/10 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                              {/* Header Section */}
                              <div className="p-4 pb-3 bg-gradient-to-br from-primary/5 to-transparent border-b border-stroke dark:border-white/5">
                                <div className="flex items-center gap-3 mb-3">
                                  <div className="relative h-10 w-10 rounded-xl overflow-hidden border border-white dark:border-white/10 shadow-sm">
                                    <Image
                                      src={user.photoURL || "/images/blog/author-02.png"}
                                      alt="User"
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-sm font-black text-black dark:text-white line-clamp-1">
                                      {user.displayName || user.name || "Usuario"}
                                    </span>
                                    <span className="text-[10px] text-body-color dark:text-body-color-dark font-medium truncate max-w-[140px]">
                                      {user.email}
                                    </span>
                                  </div>
                                </div>
                                <div className="inline-flex items-center px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                                  {user.role === 'admin' ? 'Administrador' : 'Miembro'}
                                </div>
                              </div>

                              {/* Menu Links */}
                              <div className="p-1.5">
                                <Link
                                  href="/profile"
                                  onClick={() => setProfileModalOpen(false)}
                                  className="flex items-center gap-2.5 px-3 py-2 text-[13px] font-bold text-dark hover:text-primary dark:text-white/80 dark:hover:text-white hover:bg-primary/5 rounded-xl transition-all duration-200 group"
                                >
                                  <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                  </div>
                                  Mi Perfil
                                </Link>

                                {user.role === 'admin' && (
                                  <Link
                                    href="/admin"
                                    onClick={() => setProfileModalOpen(false)}
                                    className="flex items-center gap-2.5 px-3 py-2 text-[13px] font-bold text-dark hover:text-primary dark:text-white/80 dark:hover:text-white hover:bg-primary/5 rounded-xl transition-all duration-200 group"
                                  >
                                    <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                                    </div>
                                    Panel Admin
                                  </Link>
                                )}
                              </div>

                              {/* Footer Section */}
                              <div className="p-1.5 bg-gray-50/50 dark:bg-white/5 border-t border-stroke dark:border-white/10">
                                <button
                                  onClick={() => {
                                    setProfileModalOpen(false);
                                    logout();
                                  }}
                                  className="flex w-full items-center gap-2.5 px-3 py-2 text-[13px] font-black text-red-500 hover:bg-red-50/10 rounded-xl transition-all duration-200 group"
                                >
                                  <div className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                                  </div>
                                  Cerrar Sesión
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Link
                          href="/signin"
                          className="text-dark hidden px-4 py-3 text-sm font-bold hover:text-primary md:block dark:text-white transition-colors"
                        >
                          Iniciar Sesión
                        </Link>
                        <Link
                          href="/signup"
                          className="ease-in-up shadow-btn hover:shadow-btn-hover bg-primary hover:bg-primary/90 hidden rounded-full px-6 py-2.5 text-sm font-bold text-white transition duration-300 md:block"
                        >
                          Registrarse
                        </Link>
                      </div>
                    )}
                  </>
                )}
                <div>
                  <ThemeToggler />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
