"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import {
  Menu,
  Home,
  Package,
  ShoppingCart,
  Barcode,
  AlertTriangle,
  HelpCircle,
  User2,
  ChevronUp,
  UserCircle,
  LogOut,
  Users2,
  Wallet,
  DockIcon,
  Key,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { DropdownMenuContent } from "@/components/ui/dropdown-menu";
import { usePathname } from "next/navigation";

export function AppSidebar() {
  const { data: session, status } = useSession();
  const userRole = session?.user?.role;
  const name = session?.user?.name;
  const pathname = usePathname();

  let sidebarItems;

  if (userRole === "ADMIN") {
    sidebarItems = [
      { name: "Dashboard", url: "/pages/dashboard", icon: Home },
      { name: "Products", url: "/pages/products", icon: Package },
      { name: "Sales", url: "/pages/sales", icon: ShoppingCart },
      { name: "Inventory", url: "/pages/inventory", icon: Barcode },
      { name: "Loans", url: "/pages/loans", icon: Wallet },
      { name: "Manage users", url: "/pages/users", icon: Users2 },
      { name: "Report", url: "/pages/report", icon: DockIcon },
      { name: "Help", url: "/pages/helpPage", icon: HelpCircle },
    ];
  } else {
    sidebarItems = [
      { name: "Sales", url: "/pages/sales", icon: ShoppingCart },
      { name: "Inventory", url: "/pages/inventory", icon: Barcode },
      { name: "Loans", url: "/pages/loans", icon: Wallet },
      { name: "Help", url: "/pages/helpPage", icon: HelpCircle },
    ];
  }
  const renderSidebarItems = () =>
    sidebarItems.map((item) => {
      const isActive = pathname === item.url;
      return (
        <SidebarMenuItem
          key={item.name}
          className={`my-5 ${isActive ? "bg-black text-white rounded-md  " : ""}`}
        >
          <SidebarMenuButton asChild>
            <a href={item.url} className="flex items-center gap-2">
              <item.icon
                className={`mr-2 h-4 w-4 ${isActive ? "text-lime-500" : "text-red-950"}`}
              />
              <span>{item.name}</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      );
    });
  return (
    <Sidebar variant="floating" collapsible="icon">
      <SidebarContent>
        <SidebarGroup className="h-full">
          <SidebarGroupLabel>
            <Menu className="font-bold " />{" "}
            <h4 className="p-2 font-bold text-lg">Menu</h4>
          </SidebarGroupLabel>
          <SidebarGroupContent className="h-full">
            <SidebarMenu className="h-full font-semibold cursor-pointer ">
              {renderSidebarItems()}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton>
              <User2 /> <h3 className="font-semibold">{name}</h3>
              <ChevronUp className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="left"
            className="w-[--radix-popper-anchor-width] m-3 text-center font-semibold cursor-pointer "
          >
            <DropdownMenuItem>
              <div className="flex gap-1 p-1 hover:bg-gray-300 rounded">
                <Key />
                <span onClick={() => window.location.href = "/pages/users/changePassword"}> Change Password</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <div
                className="flex gap-1 p-1 hover:bg-gray-300 rounded"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                <LogOut />
                <span> Sign out</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
