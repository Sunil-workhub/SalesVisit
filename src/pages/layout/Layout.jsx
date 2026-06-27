import { useState, useEffect } from "react";
import { NavLink, useLocation, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  UserPlus,
  ShoppingCart,
  Wrench,
  Zap,
  ChevronDown,
  Users,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  X,
  Menu,
  ShoppingCartIcon,
} from "lucide-react";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import IndefLog from "../../assets/images/swift-logo.svg";

// ─── Nav config ──────────────────────────────────────────────
const NAV = [
  {
    id: "customer",
    label: "Customer",
    icon: Users,
    children: [
      {
        label: "Dashboard",
        path: "/customer-dashboard",
        icon: LayoutDashboard,
      },
      {
        label: "Create Customer",
        path: "/customer-create",
        icon: UserPlus,
      },
    ],
  },
  {
    id: "orders",
    label: "Order Details",
    icon: ShoppingCart,
    children: [
      {
        label: "Dashboard",
        path: "/order-details-dashboard",
        icon: LayoutDashboard,
      },
      {
        label: "Create Order",
        path: "/order-entry",
        icon: ShoppingCartIcon,
      },
    ],
  },
  {
    id: "complaints",
    label: "Complaints",
    icon: Wrench,
    children: [
      { label: "Dashboard", path: "/complaint-dashboard", icon: Zap },
      {
        label: "Create Complaint",
        path: "/complaint-page",
        icon: Wrench,
      },
    ],
  },
];

// ─── Shell tokens ─────────────────────────────────────────────
const SHELL_GRAD =
  "linear-gradient(160deg, #243F96 0%, #243F96 45%, rgb(0,0,0) 100%)";
const HOVER = "rgba(255,255,255,0.09)";
const ACTIVE = "rgba(255,255,255,0.15)";
const MUTED = "rgba(220,237,248,0.75)";
const DIVIDER = "rgba(255,255,255,0.10)";
const SUBLINE = "rgba(255,255,255,0.18)";
const CONTENT = "#f0f4f8";
const GAP = 12;
const SIDEBAR_W = 228;
const SIDEBAR_C = 62;
const HEADER_H = 58;
const FOOTER_H = 36;
const CORNER_R = 18;

// ─── Desktop collapsed tooltip ───────────────────────────────
function SideTooltip({ label, show, children }) {
  const [v, setV] = useState(false);
  if (!show) return children;
  return (
    <div
      style={{ position: "relative" }}
      onMouseEnter={() => setV(true)}
      onMouseLeave={() => setV(false)}
    >
      {children}
      {v && (
        <div
          style={{
            position: "absolute",
            left: "calc(100% + 10px)",
            top: "50%",
            transform: "translateY(-50%)",
            background: "rgba(30,58,74,0.95)",
            color: "#fff",
            fontSize: 12,
            fontWeight: 500,
            borderRadius: 8,
            padding: "5px 10px",
            whiteSpace: "nowrap",
            zIndex: 9999,
            boxShadow: "0 4px 14px rgba(0,0,0,0.3)",
            border: "1px solid rgba(255,255,255,0.12)",
            pointerEvents: "none",
          }}
        >
          {label}
          <span
            style={{
              position: "absolute",
              right: "100%",
              top: "50%",
              transform: "translateY(-50%)",
              border: "5px solid transparent",
              borderRightColor: "rgba(30,58,74,0.95)",
            }}
          />
        </div>
      )}
    </div>
  );
}

// ─── Nav item ────────────────────────────────────────────────
function NavItem({ item, collapsed, openGroups, toggleGroup }) {
  const location = useLocation();
  const isGroupActive = item.children?.some(
    (c) => location.pathname === c.path,
  );
  const Icon = item.icon;

  const base = (extra = {}) => ({
    width: "100%",
    display: "flex",
    alignItems: "center",
    borderRadius: 11,
    border: "none",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "inherit",
    textDecoration: "none",
    transition: "background 0.15s, color 0.15s",
    whiteSpace: "nowrap",
    ...(collapsed
      ? { justifyContent: "center", padding: "10px 0", gap: 0 }
      : { gap: 10, padding: "9px 11px" }),
    ...extra,
  });

  if (item.children) {
    const open = openGroups[item.id];
    return (
      <div>
        <SideTooltip label={item.label} show={collapsed}>
          <button
            onClick={() => toggleGroup(item.id)}
            style={base({
              background: isGroupActive ? ACTIVE : "transparent",
              color: isGroupActive ? "#fff" : MUTED,
            })}
            onMouseEnter={(e) => {
              if (!isGroupActive) e.currentTarget.style.background = HOVER;
            }}
            onMouseLeave={(e) => {
              if (!isGroupActive)
                e.currentTarget.style.background = "transparent";
            }}
          >
            <Icon
              size={16}
              style={{ color: isGroupActive ? "#fff" : MUTED, flexShrink: 0 }}
            />
            {!collapsed && (
              <>
                <span style={{ flex: 1, textAlign: "left" }}>{item.label}</span>
                <ChevronDown
                  size={13}
                  style={{
                    color: MUTED,
                    opacity: 0.7,
                    flexShrink: 0,
                    transform: open ? "rotate(0deg)" : "rotate(-90deg)",
                    transition: "transform 0.22s",
                  }}
                />
              </>
            )}
          </button>
        </SideTooltip>

        {!collapsed && (
          <div
            style={{
              marginLeft: 18,
              paddingLeft: 12,
              borderLeft: `1.5px solid ${SUBLINE}`,
              overflow: "hidden",
              maxHeight: open ? 200 : 0,
              opacity: open ? 1 : 0,
              transition: "max-height 0.24s ease, opacity 0.18s",
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
          >
            {item.children.map((child) => {
              const CIcon = child.icon;
              return (
                <NavLink
                  key={child.path}
                  to={child.path}
                  style={({ isActive }) => ({
                    display: "flex",
                    alignItems: "center",
                    gap: 9,
                    padding: "7px 10px",
                    borderRadius: 9,
                    fontSize: 12,
                    fontWeight: 500,
                    color: isActive ? "#fff" : MUTED,
                    background: isActive ? ACTIVE : "transparent",
                    textDecoration: "none",
                    transition: "background 0.15s, color 0.15s",
                  })}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = HOVER)
                  }
                  onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                >
                  <CIcon size={13} style={{ flexShrink: 0 }} />
                  <span>{child.label}</span>
                </NavLink>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <SideTooltip label={item.label} show={collapsed}>
      <NavLink
        to={item.path}
        style={({ isActive }) =>
          base({
            background: isActive ? ACTIVE : "transparent",
            color: isActive ? "#fff" : MUTED,
          })
        }
        onMouseEnter={(e) => (e.currentTarget.style.background = HOVER)}
        onMouseLeave={(e) => (e.currentTarget.style.background = "")}
      >
        {({ isActive }) => (
          <>
            <Icon
              size={16}
              style={{ color: isActive ? "#fff" : MUTED, flexShrink: 0 }}
            />
            {!collapsed && (
              <span style={{ whiteSpace: "nowrap" }}>{item.label}</span>
            )}
          </>
        )}
      </NavLink>
    </SideTooltip>
  );
}

// ─── Root Layout ─────────────────────────────────────────────
export default function Layout() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState({ customer: true });
  const [mobileOpen, setMobileOpen] = useState(false);

  const REDIRECT_Home_URL = window.APP_CONFIG?.REDIRECT_Home_URL;
  const REDIRECT_Logout_URL = window.APP_CONFIG?.REDIRECT_Logout_URL;
  const user = JSON.parse(sessionStorage.getItem("user")) || {};
  const userName = `${user.customer ?? ""}`.trim() || "User";
  const initials = userName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // close drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // lock body scroll when drawer is open on mobile
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const toggleGroup = (id) => {
    if (collapsed) {
      setCollapsed(false);
      setOpenGroups((p) => ({ ...p, [id]: true }));
      return;
    }
    setOpenGroups((p) => ({ ...p, [id]: !p[id] }));
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        background: SHELL_GRAD,
      }}
    >
      {/* ── Right column ────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          minWidth: 0,
          background: "transparent",
        }}
      >
        {/* Content wrapper */}
        <div
          style={{
            flex: 1,
            overflow: "hidden",
            paddingRight: GAP,
            display: "flex",
            flexDirection: "column",
            background: "transparent",
          }}
          className="content-wrapper"
        >
          <div
            style={{
              flex: 1,
              overflow: "hidden",
              background: CONTENT,
              borderRadius: CORNER_R,
              boxShadow:
                "0 8px 32px rgba(30,60,80,0.2), 0 2px 8px rgba(30,60,80,0.12)",
            }}
            className="content-panel"
          >
            <main
              style={{
                height: "100%",
                overflowY: "auto",
                background: CONTENT,
              }}
            >
              <Outlet />
            </main>
          </div>
        </div>
      </div>

      {/* ── Global responsive styles ─────────────────────────── */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to   { transform: translateX(0); }
        }

        * { box-sizing: border-box; }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb {
          background: rgba(74,122,146,0.3);
          border-radius: 4px;
        }

        /* ── Mobile ── */
        @media (max-width: 767px) {
          /* hide the desktop sidebar entirely — no mini sidebar on mobile */
          .desktop-sidebar {
            display: none !important;
          }

          /* show hamburger, hide desktop logo */
          .mobile-hamburger { display: flex !important; }
          .desktop-logo     { display: none !important; }

          /* hide user name text, keep avatar */
          .header-user-info { display: none !important; }

          /* remove right gap so content fills full width */
          .content-wrapper {
            padding-right: 0 !important;
          }

          /* remove rounded corners on content card — fills edge-to-edge */
          .content-panel {
            border-radius: 0 !important;
            box-shadow: none !important;
          }
        }

        /* ── Slightly larger phones / narrow tablets ── */
        @media (min-width: 480px) and (max-width: 767px) {
          .header-user-info { display: block !important; }
        }
      `}</style>
    </div>
  );
}
