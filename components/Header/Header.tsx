import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { ArrowUpRight, Compass, Menu, X } from "lucide-react";
import { useApp } from "../AppProvider";
export default function Header() {
  const { pathname, asPath } = useRouter();
  const [openPath, setOpenPath] = useState<string | null>(null);
  const open = openPath === asPath;
  const { user, logout } = useApp();
  const links = [
    { label: "Discover", href: "/" },
    { label: "Explore map", href: "/map" },
    { label: "Our story", href: "/about-us" },
    { label: "Get in touch", href: "/contact-us" },
  ];
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand" aria-label="DiscoverHub home">
          <span className="brand-mark">
            <Compass size={25} strokeWidth={1.8} />
          </span>
          <span>
            discover<span className="brand-light">hub</span>
            <span className="brand-dot">.</span>
          </span>
        </Link>
        <button
          className="menu-toggle"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          aria-controls="main-navigation"
          onClick={() => setOpenPath(open ? null : asPath)}
        >
          {open ? <X /> : <Menu />}
        </button>
        <nav
          id="main-navigation"
          aria-label="Main navigation"
          className={`main-nav ${open ? "open" : ""}`}
        >
          {links.map((link) => (
            <Link
              href={link.href}
              key={link.href}
              onClick={() => setOpenPath(null)}
              aria-current={pathname === link.href ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
          <div className="mobile-account">
            {user ? (
              <button onClick={logout}>Sign out</button>
            ) : (
              <Link href="/login">Sign in</Link>
            )}
          </div>
        </nav>
        <div className="header-account">
          {user ? (
            <>
              <span className="user-greeting">
                Hi, {user.name.split(" ")[0]}
              </span>
              <button className="button small secondary" onClick={logout}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="signin">
                Sign in
              </Link>
              <Link href="/map" className="button small">
                Let’s explore <ArrowUpRight size={16} />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
