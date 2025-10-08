// import {
//   Sidebar,
//   SidebarContent,
//   SidebarFooter,
//   SidebarGroup,
//   SidebarGroupContent,
//   SidebarGroupLabel,
//   SidebarHeader,
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
// } from "@/components/ui/sidebar"
// import { ShoppingCart , ChartBar , Package , Warehouse , Settings, Tags, Truck, Users } from "lucide-react"

// const items = [
//   {
//     title: "Dashboard",
//     url: "/Dashboard",
//     icon: ChartBar,
//   },
//   {
//     title: "Products",
//     url: "/Products",
//     icon: Package,
//   },
//   {
//     title: "Orders",
//     url: "/Orders",
//     icon: ShoppingCart,
//   },

//   {
//     title: "Customers",
//     url: "/Customers",
//     icon: Users,
//   },

//   {
//     title: "Shipping",
//     url: "/Shipping",
//     icon: Truck,
//   },

//   {
//     title: "Inventory",
//     url: "/Inventory",
//     icon: Warehouse ,
//   },
//   {
//     title: "Categories",
//     url: "/Categories",
//     icon: Tags,
//   },
//   {
//     title: "Settings",
//     url: "/settings",
//     icon: Settings,
//   },
// ]

// export function SideBar() {
//   return (
//     <Sidebar>
//       <SidebarContent>
//         <SidebarGroup>
//           <SidebarGroupLabel>Application</SidebarGroupLabel>
//           <SidebarGroupContent>
//             <SidebarMenu>
//               {items.map((item) => (
//                 <SidebarMenuItem key={item.title}>
//                   <SidebarMenuButton asChild>
//                     <a href={item.url} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
//                       <item.icon className="h-5 w-5" />
//                       <span className="font-medium">{item.title}</span>
//                     </a>
//                   </SidebarMenuButton>
//                 </SidebarMenuItem>
//               ))}
//             </SidebarMenu>
//           </SidebarGroupContent>
//         </SidebarGroup>
//       </SidebarContent>
//     </Sidebar>
//   )
// }

"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BrainCircuit,
  Calendar,
  Code,
  FilmIcon,
  GanttChartSquare,
  Library,
  ListChecks,
  Menu,
  PenBox,
  ShoppingCart,
  X,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NavItemProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  isActive?: boolean;
  isPending?: boolean;
  isDisabled?: boolean;
}

function NavItem({
  href,
  icon: Icon,
  title,
  isActive,
  isPending,
  isDisabled,
}: NavItemProps) {
  return (
    <Link
      href={href}
      aria-disabled={isDisabled}
      className={cn(
        "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-accent text-accent-foreground"
          : "hover:bg-accent/50 hover:text-accent-foreground",
        isDisabled && "pointer-events-none opacity-60"
      )}
    >
      <Icon className="h-4 w-4" />
      {title}
    </Link>
  );
}

export function Sidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className={cn(
          "fixed left-4 top-4 z-50 md:hidden bg-transparent",
          open && "hidden"
        )}
        onClick={() => setOpen(!open)}
      >
        <Menu className="h-4 w-4" />
        <span className="sr-only">Toggle Menu</span>
      </Button>

      <div
        className={cn(
          "fixed inset-0 z-40 bg-background/80 backdrop-blur-sm transition-opacity md:hidden",
          open ? "block opacity-100" : "hidden"
        )}
        onClick={() => setOpen(false)}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 border-r bg-background transition-transform md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex h-16 items-center gap-2 border-b px-4">
          <BrainCircuit className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold tracking-tight">
            Second Brain
          </span>
          <Button
            variant="outline"
            size="icon"
            className="ml-auto md:hidden bg-transparent"
            onClick={() => setOpen(false)}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close Sidebar</span>
          </Button>
        </div>
        <ScrollArea className="h-[calc(100vh-4rem)] p-4">
          <nav className="flex flex-col gap-1">
            <NavItem
              href="/Dashboard"
              icon={BarChart3}
              title="Dashboard"
              isActive={pathname === "/Dashboard"}
            />
            <NavItem
              href="/tasks"
              icon={ListChecks}
              title="Tasks & Habits"
              isActive={pathname === "/tasks"}
            />
            <NavItem
              href="/projects"
              icon={GanttChartSquare}
              title="Projects"
              isActive={pathname === "/projects"}
            />
            <NavItem
              href="/calender"
              icon={Calendar}
              title="Calender"
              isActive={pathname === "/calender"}
            />
            <NavItem
              href="/entertainment"
              icon={FilmIcon}
              title="Entertainment"
              isActive={pathname === "/entertainment"}
            />
            <NavItem
              href="/finance"
              icon={Wallet}
              title="Finance"
              isActive={pathname === "/finance"}
            />
            <NavItem
              href="/goals"
              icon={Calendar}
              title="Goals"
              isActive={pathname === "/goals"}
            />
            <NavItem
              href="/knowledge"
              icon={Library}
              title="Knowledge Base"
              isActive={pathname === "/knowledge"}
            />
            <NavItem
              href="/snippets"
              icon={Code}
              title="Code Snippets"
              isActive={pathname === "/snippets"}
            />
            <NavItem
              href="/wishlist"
              icon={ShoppingCart}
              title="Wishlist"
              isActive={pathname === "/wishlist"}
            />
          </nav>
        </ScrollArea>
      </aside>
    </>
  );
}
