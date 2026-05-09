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

  const menuList = user && user.role === 'admin' 
    ? [{ id: 99, title: "Dashboard", path: "/admin", newTab: false }, ...menuData]
    : menuData;

  return (
    <>
      <header
        className={`header top-0 left-0 z-40 flex w-full items-center transition-all duration-500 ease-in-out ${sticky
          ? "dark:bg-gray-dark/80 dark:shadow-sticky-dark shadow-sticky fixed z-9999 bg-white/80 backdrop-blur-md py-2"
          : "absolute bg-transparent py-4"
          }`}
      >
        <div className="container">
          <div className="relative -mx-4 flex items-center justify-between">
            <div className="w-60 max-w-full px-4 xl:mr-12">
              <Link
                href="/"
                className="header-logo block w-full group"
              >
                <span className="text-2xl font-black text-black dark:text-white tracking-tighter group-hover:text-primary transition-all duration-500">
                  TRL <span className="text-primary group-hover:text-black dark:group-hover:text-white">&amp; CLR</span>
                </span>
              </Link>
            </div>
            <div className="flex w-full items-center justify-between px-4">
              <div>
                <button
                  onClick={navbarToggleHandler}
                  id="navbarToggler"
                  aria-label="Mobile Menu"
                  className="ring-primary absolute top-1/2 right-4 block translate-y-[-50%] rounded-lg px-3 py-[6px] focus:ring-2 lg:hidden"
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
                  className={`navbar border-body-color/50 dark:border-body-color/20 dark:bg-dark absolute right-0 z-30 w-[250px] rounded border-[.5px] bg-white px-6 py-4 duration-300 lg:visible lg:static lg:w-auto lg:border-none lg:!bg-transparent lg:p-0 lg:opacity-100 ${navbarOpen
                    ? "visibility top-full opacity-100"
                    : "invisible top-[120%] opacity-0"
                    }`}
                >
                  <ul className="block lg:flex lg:space-x-10">
                    {menuList.map((menuItem, index) => (
                      <li key={index} className="group relative">
                        {menuItem.path ? (
                          <Link
                            href={menuItem.path}
                            className={`relative flex py-2 text-sm font-bold uppercase tracking-widest lg:mr-0 lg:inline-flex lg:px-0 lg:py-6 transition-all duration-500 ease-in-out group ${usePathName === menuItem.path
                              ? "text-primary"
                              : "text-dark hover:text-primary dark:text-white/80 dark:hover:text-white"
                              }`}
                          >
                            {menuItem.title}
                            {/* Animated Underline */}
                            <span className={`absolute bottom-4 left-0 h-0.5 bg-primary transition-all duration-500 ease-in-out ${usePathName === menuItem.path ? "w-full" : "w-0 group-hover:w-full"}`}></span>
                          </Link>
                        ) : (
                          <>
                            <p
                              onClick={() => handleSubmenu(index)}
                              className="text-dark group-hover:text-primary flex cursor-pointer items-center justify-between py-2 text-base lg:mr-0 lg:inline-flex lg:px-0 lg:py-6 dark:text-white/70 dark:group-hover:text-white"
                            >
                              {menuItem.title}
                              <span className="pl-3">
                                <svg width="25" height="24" viewBox="0 0 25 24">
                                  <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M6.29289 8.8427C6.68342 8.45217 7.31658 8.45217 7.70711 8.8427L12 13.1356L16.2929 8.8427C16.6834 8.45217 17.3166 8.45217 17.7071 8.8427C18.0976 9.23322 18.0976 9.86639 17.7071 10.2569L12 15.964L6.29289 10.2569C5.90237 9.86639 5.90237 9.23322 6.29289 8.8427Z"
                                    fill="currentColor"
                                  />
                                </svg>
                              </span>
                            </p>
                            <div
                              className={`submenu dark:bg-dark relative top-full left-0 rounded-sm bg-white transition-[top] duration-300 group-hover:opacity-100 lg:invisible lg:absolute lg:top-[110%] lg:block lg:w-[250px] lg:p-4 lg:opacity-0 lg:shadow-lg lg:group-hover:visible lg:group-hover:top-full ${openIndex === index ? "block" : "hidden"
                                }`}
                            >
                              {menuItem.submenu.map((submenuItem, index) => (
                                <Link
                                  href={submenuItem.path}
                                  key={index}
                                  className="text-dark hover:text-primary block rounded-sm py-2.5 text-sm lg:px-3 dark:text-white/70 dark:hover:text-white"
                                >
                                  {submenuItem.title}
                                </Link>
                              ))}
                            </div>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
              <div className="flex items-center justify-end pr-16 lg:pr-0 gap-4">
                {!loading && (
                  <>
                    {user ? (
                      <div className="relative">
                        <button
                          onClick={() => setProfileModalOpen(!profileModalOpen)}
                          className="flex items-center gap-2.5 cursor-pointer group transition-all duration-300"
                        >
                          <div className="relative h-11 w-11 overflow-hidden rounded-xl border-2 border-primary/10 group-hover:border-primary/40 transition-all duration-300 shadow-sm group-hover:shadow-md group-hover:scale-105">
                            <Image
                              src={user.photoURL || "/images/blog/author-02.png"}
                              alt="User"
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex flex-col items-start hidden sm:flex">
                            <span className="text-[13px] font-black text-black dark:text-white line-clamp-1 max-w-[100px] leading-tight">
                              {user.displayName || user.name || "Usuario"}
                            </span>
                            <div className="flex items-center gap-1 opacity-60">
                              <span className="text-[9px] uppercase font-bold tracking-tighter">
                                {user.role === 'admin' ? 'Admin' : 'User'}
                              </span>
                              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-300 ${profileModalOpen ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6"/></svg>
                            </div>
                          </div>
                        </button>

                        {/* Profile Dropdown - Modern Design */}
                        {profileModalOpen && (
                          <>
                            <div
                              className="fixed inset-0 z-40"
                              onClick={() => setProfileModalOpen(false)}
                            ></div>
                            <div className="absolute right-0 mt-3 z-50 w-64 origin-top-right rounded-[20px] bg-white/95 dark:bg-dark/95 backdrop-blur-xl shadow-[0_15px_40px_rgba(0,0,0,0.12)] dark:shadow-[0_15px_40px_rgba(0,0,0,0.25)] ring-1 ring-black/5 dark:ring-white/10 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
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
                                  className="flex w-full items-center gap-2.5 px-3 py-2 text-[13px] font-black text-red-500 hover:bg-red-500/10 rounded-xl transition-all duration-200 group"
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
