import { useState } from "react";

import { useStore } from "@nanostores/react";

import { account } from "@store";

import { Wallet } from "./Wallet";

import { WagmiLayout } from "@layouts";

import "./header.css";

const Header = (): JSX.Element => {
  const pathname = window.location.pathname;
  const currentPath = pathname.slice(1); // remove the first "/"

  const $account = useStore(account);

  const platformPaths = [
    "platform",
    "strategies",
    "chains",
    "integrations",
    "assets",
    "factory",
    "network",
  ];

  const [menu, setMenu] = useState(false);

  const isPlatform =
    platformPaths.some((path) => path === currentPath) ||
    platformPaths.some((path) => currentPath.includes(path));

  const isVaults = currentPath.includes("vault");

  return (
    <WagmiLayout>
      <header className="font-manrope bg-accent-950 md:bg-transparent rounded-b-[16px] relative px-5">
        <a data-testid="hashkey-logo" href="/" title="hashkey">
          <img
            className="w-[105px] h-[48px] md:w-[140px] md:h-[60px] ml-[15px]"
            src="/logo.svg"
            alt="hashkey logo"
          />
        </a>
        <div className="menu absolute left-1/2 transform -translate-x-1/2 text-[16px]">
          <a
            data-testid="vaults-link"
            className={isVaults ? "active" : ""}
            href="/vaults"
          >
            Vaults
          </a>
          <a
            className={
              currentPath === "assets" || currentPath.includes("contests")
                ? "active"
                : ""
            }
            href="/assets"
          >
            Assets
          </a>
          <a className={currentPath === "strategies" ? "active" : ""} href="/strategies">
            Strategies
          </a>
          {/* <a className={currentPath === "ai" ? "active" : ""} href="/ai">
            Lend/Borrow
          </a> */}
          <a className={currentPath === "platform" ? "active" : ""} href="/platform">
            Platform
          </a>
        </div>
        <div className="flex justify-end mr-[15px] gap-3">
          <Wallet />
          <div className="burger-menu" onClick={() => setMenu((prev) => !prev)}>
            {menu ? (
              <img className="w-4 h-4" src="/close.svg" alt="close" />
            ) : (
              <img className="w-4 h-4" src="/menu.svg" alt="menu" />
            )}
          </div>
        </div>
        <nav className={`menu-nav text-center gap-3 ${menu && "active"}`}>
          <a
            className={`px-4 py-[10Sonic Assetspx] font-semibold ${isVaults ? "bg-accent-800 rounded-[16px]" : ""}`}
            href="/vaults"
          >
            Vaults
          </a>
          <a
            className={`px-4 py-[10px] font-semibold ${currentPath === "assets" || currentPath.includes("contests") ? "bg-accent-800 rounded-[16px]" : ""}`}
            href="/assets"
          >
            Assets
          </a>

          <a
            className={`px-4 py-[10px] font-semibold ${currentPath === "strategies" ? "bg-accent-800 rounded-[16px]" : ""}`}
            href="/strategies"
          >
            Strategies
          </a>
          {/* <a
            className={`px-4 py-[10px] font-semibold ${currentPath === "ai" ? "bg-accent-800 rounded-[16px]" : ""}`}
            href="/ai"
          >
            Lend
          </a> */}
          {/* <a href="https://stability.market/">Lend</a> */}
          <a
            className={`px-4 py-[10px] font-semibold ${currentPath === "platform" ? "bg-accent-800 rounded-[16px]" : ""}`}
            href="/platform"
          >
            Platform
          </a>
        </nav>
      </header>
    </WagmiLayout>
  );
};

export { Header };
