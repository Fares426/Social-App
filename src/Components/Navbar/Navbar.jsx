import React, { useContext, useState, useRef, useEffect } from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  DropdownItem,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  Avatar,
} from "@heroui/react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { FaHome } from "react-icons/fa";
import { FiBell } from "react-icons/fi";
import { AuthContext } from "../../Contexts/AuthContextProvider";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const BASE = "https://route-posts.routemisr.com";

function getNotifText(notif) {
  const name = notif.actor?.name || "Someone";
  switch (notif.type) {
    case "comment_post":  return `${name} commented on your post`;
    case "like_post":     return `${name} liked your post`;
    case "like_comment":  return `${name} liked your comment`;
    case "follow":        return `${name} started following you`;
    case "share_post":    return `${name} shared your post`;
    default:              return `${name} interacted with your content`;
  }
}

export const AcmeLogo = () => (
  <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#1877F2]">
    <svg fill="none" height="20" viewBox="0 0 32 32" width="20">
      <path
        clipRule="evenodd"
        d="M17.6482 10.1305L15.8785 7.02583L7.02979 22.5499H10.5278L17.6482 10.1305ZM19.8798 14.0457L18.11 17.1983L19.394 19.4511H16.8453L15.1056 22.5499H24.7272L19.8798 14.0457Z"
        fill="white"
        fillRule="evenodd"
      />
    </svg>
  </div>
);

export default function MyNavbar() {
  const { token, clearUserToken } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const menuItems = token
    ? ["Profile", "Home", "Change Password", "Log Out"]
    : ["Register", "Login"];

  const authHeaders = { Authorization: `Bearer ${token}` };

  // ── User profile ─────────────────────────────────────────────────
  const { data: userData } = useQuery({
    queryKey: ["UserNavbarInfo"],
    queryFn: () => axios.get(`${BASE}/users/profile-data`, { headers: authHeaders }),
    enabled: !!token,
  });
  const userPhoto = userData?.data.data.user.photo;
  const userEmail = userData?.data.data.user.email;

  // ── Unread count (polls every 30s) ───────────────────────────────
  const { data: unreadData } = useQuery({
    queryKey: ["notifUnreadCount"],
    queryFn: () => axios.get(`${BASE}/notifications/unread-count`, { headers: authHeaders }),
    enabled: !!token,
    refetchInterval: 30_000,
  });
  const unreadCount = unreadData?.data?.data?.unreadCount ?? 0;

  // ── Notifications list (lazy — only when panel open) ─────────────
  const { data: notifData, isLoading: isNotifLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () =>
      axios.get(`${BASE}/notifications?page=1&limit=20`, { headers: authHeaders }),
    enabled: !!token && isNotifOpen,
  });
  const notifications = notifData?.data?.data?.notifications ?? [];

  // ── Mark one as read ─────────────────────────────────────────────
  const { mutate: markOneRead } = useMutation({
    mutationFn: (id) =>
      axios.patch(`${BASE}/notifications/${id}/read`, {}, { headers: authHeaders }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifUnreadCount"] });
    },
  });

  // ── Mark all as read ─────────────────────────────────────────────
  const { mutate: markAllRead, isPending: isMarkingAll } = useMutation({
    mutationFn: () =>
      axios.patch(`${BASE}/notifications/read-all`, {}, { headers: authHeaders }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifUnreadCount"] });
    },
  });

  // ── Close on outside click ───────────────────────────────────────
  useEffect(() => {
    function onOutsideClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target))
        setIsNotifOpen(false);
    }
    if (isNotifOpen) document.addEventListener("mousedown", onOutsideClick);
    return () => document.removeEventListener("mousedown", onOutsideClick);
  }, [isNotifOpen]);

  function handleLogout() {
    localStorage.removeItem("token");
    clearUserToken();
    navigate("/login");
  }

  const desktopLinkClass = ({ isActive }) =>
    `flex items-center justify-center gap-2 px-5 py-2 text-sm font-semibold rounded-md transition-all duration-150 ${
      isActive
        ? "text-[#1877F2] bg-[#1877F2]/10"
        : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
    }`;

  const mobileLinkClass = ({ isActive }) =>
    `flex items-center w-full px-4 py-3 text-[15px] font-medium rounded-lg transition-all duration-150 ${
      isActive
        ? "text-[#1877F2] bg-[#1877F2]/8 border-l-[3px] border-[#1877F2]"
        : "text-gray-700 hover:bg-gray-100"
    }`;
console.log(unreadData?.data)
console.log(notifications[0])
  return (
    <Navbar
      isBordered
      isBlurred={false}
      maxWidth="xl"
      className="bg-white py-8 border-b border-gray-200 h-14"
      classNames={{ wrapper: "px-4 sm:px-6 max-w-5xl mx-auto" }}
      onMenuOpenChange={setIsMenuOpen}
    >
      {/* Left — Hamburger + Logo */}
      <NavbarContent>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="sm:hidden text-gray-500 hover:text-[#1877F2] transition-colors"
        />
        <NavbarBrand className="gap-2.5">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#1A6BF5]">
            <svg
              fill="none"
              height="22"
              viewBox="0 0 100 80"
              width="22"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* M letter */}
              <path
                d="M10 70 L10 25 Q10 10 23 6 Q35 2 44 12 L50 25 L56 12 Q65 2 77 6 Q90 10 90 25 L90 70 L77 70 L77 30 Q77 20 70 18 Q63 16 59 24 L53 43 Q50 48 47 43 L41 24 Q37 16 30 18 Q23 20 23 30 L23 70 Z"
                fill="white"
              />
              {/* Green accent dot */}
              <circle cx="90" cy="8" r="10" fill="#4FFFB0" />
            </svg>
          </div>
          <Link
            to="/home"
            className="font-bold text-xl text-[#1877F2] tracking-tight"
          >
            meetra
          </Link>
        </NavbarBrand>
      </NavbarContent>

      {/* Center — Desktop Links */}
      <NavbarContent className="hidden sm:flex gap-1" justify="center">
        {token ? (
          <NavbarItem>
            <NavLink className={desktopLinkClass} to="/home" title="Home">
              <FaHome className="text-xl" />
            </NavLink>
          </NavbarItem>
        ) : (
          <>
            <NavbarItem>
              <NavLink className={desktopLinkClass} to="/register">
                Register
              </NavLink>
            </NavbarItem>
            <NavbarItem>
              <NavLink className={desktopLinkClass} to="/login">
                Login
              </NavLink>
            </NavbarItem>
          </>
        )}
      </NavbarContent>

      {/* Right — Bell + Avatar */}
      <NavbarContent as="div" justify="end" className="gap-2">
        {/* Notification Bell */}
        {token && (
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotifOpen((prev) => !prev)}
              className="relative w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              aria-label="Notifications"
            >
              <FiBell className="text-gray-600 text-lg cursor-pointer" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Panel */}
            {isNotifOpen && (
              <div className="absolute  right-0 top-11 w-[340px] sm:w-[380px] bg-white rounded-xl shadow-xl border border-gray-200 z-[999] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <h3 className="text-base font-bold text-[#050505]">
                    Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAllRead()}
                      disabled={isMarkingAll}
                      className="text-xs font-semibold text-[#1877F2] hover:underline disabled:opacity-50 transition-opacity"
                    >
                      {isMarkingAll ? "Marking..." : "Mark all as read"}
                    </button>
                  )}
                </div>

                {/* List */}
                <div className="max-h-[420px]  overflow-y-auto divide-y divide-gray-50">
                  {isNotifLoading ? (
                    <div className="flex justify-center py-10">
                      <div className="w-6 h-6 border-[3px] border-[#1877F2] border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-2 text-gray-400">
                      <FiBell size={28} className="text-gray-300" />
                      <p className="text-sm">You're all caught up</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <button
                        key={notif._id}
                        onClick={() => {
                          if (!notif.isRead) markOneRead(notif._id);
                          if (notif.entityType === "post" && notif.entityId) {
                            navigate(`/postDetails/${notif.entityId}`);
                          }
                          setIsNotifOpen(false);
                        }}
                        className={`w-full cursor-pointer text-left flex items-start gap-3 px-4 py-3 transition-colors hover:bg-gray-50 ${
                          !notif.isRead ? "bg-[#E7F0FD]" : "bg-white"
                        }`}
                      >
                        {/* Actor avatar */}
                        <img
                          src={
                            notif.actor?.photo ||
                            "https://avatars.githubusercontent.com/u/86160567?s=200&v=4"
                          }
                          alt={notif.actor?.name || "User"}
                          onError={(e) => {
                            e.target.src =
                              "https://avatars.githubusercontent.com/u/86160567?s=200&v=4";
                          }}
                          className="w-10 h-10 rounded-full object-cover shrink-0 mt-0.5"
                        />

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[#050505] leading-snug">
                            {getNotifText(notif)}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(notif.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </p>
                        </div>

                        {/* Unread dot */}
                        {!notif.isRead && (
                          <span className="shrink-0 w-2.5 h-2.5 bg-[#1877F2] rounded-full mt-1.5" />
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Avatar Dropdown */}
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            {token ? (
              <Avatar
                isBordered
                as="button"
                className="transition-transform duration-200 hover:scale-105 w-9 h-9"
                color="primary"
                size="sm"
                src={userPhoto}
              />
            ) : (
              ""
            )}
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Profile Actions"
            variant="flat"
            className="w-60 p-1.5"
            itemClasses={{ base: "rounded-md data-[hover=true]:bg-gray-50" }}
          >
            <DropdownItem
              key="profile-info"
              className="h-auto p-3 mb-1 bg-gray-50 rounded-lg cursor-default border border-gray-100"
              isReadOnly
            >
              <div className="flex flex-col gap-0.5">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                  Signed in as
                </p>
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {userEmail}
                </p>
              </div>
            </DropdownItem>

            <DropdownItem
              key="profile"
              className="py-2.5"
              onClick={() => navigate("/profile")}
            >
              <span className="text-sm font-medium text-gray-700">Profile</span>
            </DropdownItem>

            <DropdownItem
              key="changePassword"
              className="py-2.5"
              onClick={() => navigate("/changepassword")}
            >
              <span className="text-sm font-medium text-gray-700">
                Change Password
              </span>
            </DropdownItem>

            <DropdownItem
              key="logout"
              color="danger"
              className="py-2.5"
              onClick={handleLogout}
            >
              <span className="text-sm font-medium">Log Out</span>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </NavbarContent>

      {/* Mobile Menu */}
      <NavbarMenu className="bg-white pt-4 pb-8 gap-1 border-t border-gray-100 shadow-lg">
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item}-${index}`} className="px-2">
            <NavLink
              className={mobileLinkClass}
              to={`/${item.toLowerCase().replace(" ", "")}`}
            >
              {item}
            </NavLink>
          </NavbarMenuItem>
        ))}
      </NavbarMenu>
    </Navbar>
  );
}