"use client";
import * as React from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  VisibilityState,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDown, PlusCircle, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Loader from "@/components/Loader";

// Edit User Button Component
const EditUserButton = ({
  user,
  onUpdate,
}: {
  user: user;
  onUpdate: () => void;
}) => {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editedUser, setEditedUser] = React.useState({
    username: user.username,
    role: user.role,
    name: user.name,
    email: user.email,
    phone: user.phone,
  });
  const [isLoading, setIsLoading] = React.useState(false);

  const handleUpdateUser = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedUser),
      });

      if (response.ok) {
        toast.success("User updated successfully!");
        setIsDialogOpen(false);
        onUpdate();
      } else {
        toast.error("Failed to update user");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update user");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setEditedUser({
      ...editedUser,
      [name]: value,
    });
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <Button
        onClick={() => setIsDialogOpen(true)}
        variant="outline"
        size="icon"
        className="text-blue-500 hover:text-blue-700"
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update the user details for {user.name}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="editName">Name</Label>
            <Input
              id="editName"
              name="name"
              value={editedUser.name}
              onChange={handleInputChange}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="editUsername">Username</Label>
            <Input
              id="editUsername"
              name="username"
              value={editedUser.username}
              onChange={handleInputChange}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="editEmail">Email</Label>
            <Input
              id="editEmail"
              name="email"
              type="email"
              value={editedUser.email}
              onChange={handleInputChange}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="editPhone">Phone</Label>
            <Input
              id="editPhone"
              name="phone"
              value={editedUser.phone}
              onChange={handleInputChange}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="editRole">Role</Label>
            <Select
              value={editedUser.role}
              onValueChange={(value) =>
                setEditedUser({ ...editedUser, role: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">ADMIN/OWNER</SelectItem>
                <SelectItem value="STAFF">STAFF/MANAGER</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleUpdateUser} disabled={isLoading}>
            {isLoading ? "Updating..." : "Update User"}
          </Button>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export type user = {
  id: string;
  username: string;
  password: string;
  role: string;
  name: string;
  email: string;
  phone: string;
};

// Columns definition - function to get columns with refresh callback
const getColumns = (
  onRefresh: () => void,
  onDeleteUser: (id: string) => void,
): ColumnDef<user>[] => [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "username",
    header: "Username",
  },
  {
    accessorKey: "role",
    header: "Role",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    id: "actions",
    header: "Actions",
    enableHiding: false,
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex items-center gap-2">
          <EditUserButton user={user} onUpdate={onRefresh} />
          <Button variant="outline" onClick={() => handleDeleteUser(user.id)}>
            <Trash2 className="text-red-700" />
          </Button>
        </div>
      );
    },
  },
];

export default function DataTableDemo() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [users, setUsers] = React.useState<user[]>([]);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [newUser, setNewUser] = React.useState({
    username: "",
    password: "",
    role: "",
    name: "",
    email: "",
    phone: "",
  });
  const [loading, setLoading] = React.useState(true);

  // Refresh function
  const refreshUsers = async () => {
    try {
      const response = await fetch("/api/users/list");
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
        toast.success("Users fetched successfully");
      } 
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch users");
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        toast.success("User deleted successfully!");
        refreshUsers();
      } else {
        toast.error("Failed to delete user.");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user.");
    }
  };

  React.useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/users/list");
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        } else {
          toast.error("Failed to fetch users");
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [users.length]);

  const table = useReactTable({
    data: users,
    columns: getColumns(refreshUsers, handleDeleteUser),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const handleCreateUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      // The newUser state already holds the correct role value.
      const response = await fetch("/api/users/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        toast.success("User created successfully");
        setIsDialogOpen(false);
        const fetchUsers = async () => {
          try {
            const response = await fetch("/api/users/list");
            if (response.ok) {
              const data = await response.json();
              setUsers(data);
            } else {
              toast.error("Failed to fetch users");
            }
          } catch (error) {
            console.error(error);
            toast.error("Failed to fetch users");
          }
        };
        fetchUsers();
      } else {
        toast.error("Failed to create user");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to create user");
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setNewUser({
      ...newUser,
      [name]: value,
    });
  };
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader />
      </div>
    );
  }
  return (
    <div className="w-full">
      <h2 className="font-extrabold p-2 text-xl font-mono">Users</h2>
      <div className="flex  flex-wrap items-center pb-4">
        <div className="flex flex-row">
          <Input
            placeholder="Filter names..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className="max-w-sm p-2"
          />
          <Input
            placeholder="Filter Username..."
            value={
              (table.getColumn("username")?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn("username")?.setFilterValue(event.target.value)
            }
            className="max-w-sm ml-2"
          />
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="m-5 ">
              <PlusCircle className="text-lime-800" />
              New User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] lg:min-w-[50%]">
            <form onSubmit={handleCreateUser}>
              <DialogHeader>
                <DialogTitle>Add new User</DialogTitle>
                <DialogDescription>
                  Enter the User details below!
                </DialogDescription>
              </DialogHeader>
              <div className="flex gap-4 flex-wrap">
                <div className="grid gap-3">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    value={newUser.username}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={newUser.name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-4 ">
                  <Label htmlFor="role">Role</Label>
                  {/* The corrected Select component with id and name */}
                  <Select
                    name="role"
                    onValueChange={(value) =>
                      setNewUser({ ...newUser, role: value })
                    }
                  >
                    <SelectTrigger id="role" className="w-[190px]">
                      <SelectValue placeholder="select User Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Roles</SelectLabel>
                        <SelectItem value="ADMIN">ADMIN/OWNER</SelectItem>
                        <SelectItem value="STAFF">STAFF/MANAGER</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="password">User Password</Label>
                  <Input
                    id="password"
                    name="password"
                    value={newUser.password}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="email">User Email</Label>
                  <Input
                    id="email"
                    name="email"
                    value={newUser.email}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-3 mb-3">
                  <Label htmlFor="phone">User Phone number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={newUser.phone}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Add</Button>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={table.getAllColumns().length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-muted-foreground flex-1 text-sm">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
