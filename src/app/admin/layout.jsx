"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X as XIcon,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      router.push("/login"); // Redirect if not authenticated
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (!mounted) return null;

  const routes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/admin",
      color: "text-sky-500",
    },
    {
      label: "Chat",
      icon: MessageSquare,
      href: "/admin/chat",
      color: "text-violet-500",
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/admin/settings",
      color: "text-pink-700",
    },
  ];

  return (
    <div className="h-full relative">
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-gray-900">
        <div className="space-y-4 py-4 flex flex-col h-full text-white">
          <div className="px-3 py-2 flex-1">
            <Link href="/admin" className="flex items-center pl-3 mb-14">
              <h1 className="text-2xl font-bold">Admin Panel</h1>
            </Link>
            <div className="space-y-1">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                    pathname === route.href ? "bg-white/10 text-white" : "text-zinc-400"
                  )}
                >
                  <div className="flex items-center flex-1">
                    <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                    {route.label}
                  </div>
                </Link>
              ))}
            </div>
          </div>
          <div className="px-3 py-2">
            <div
              className="text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition text-zinc-400"
              onClick={handleLogout}
            >
              <div className="flex items-center flex-1">
                <LogOut className="h-5 w-5 mr-3 text-red-500" />
                Logout
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="md:pl-72">
        <div className="flex items-center p-4 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 bg-gray-900 text-white">
              <div className="space-y-4 py-4 flex flex-col h-full">
                <div className="px-3 py-2 flex-1">
                  <Link href="/admin" className="flex items-center pl-3 mb-14">
                     <h1 className="text-2xl font-bold">Admin Panel</h1>
                  </Link>
                  <div className="space-y-1">
                    {routes.map((route) => (
                      <Link
                        key={route.href}
                        href={route.href}
                        className={cn(
                          "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                          pathname === route.href ? "bg-white/10 text-white" : "text-zinc-400"
                        )}
                      >
                        <div className="flex items-center flex-1">
                          <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                          {route.label}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="px-3 py-2">
                   <div
                    className="text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition text-zinc-400"
                    onClick={handleLogout}
                  >
                    <div className="flex items-center flex-1">
                      <LogOut className="h-5 w-5 mr-3 text-red-500" />
                      Logout
                    </div>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
        <div className="p-8">
            {children}
        </div>
      </main>
    </div>
  );
}
