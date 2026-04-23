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
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import {
  ChevronDown,
  PlusCircle,
  Check,
  ChevronsUpDown,
  Trash2,
  Calendar,
  PenBox,
} from "lucide-react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { useSession } from "next-auth/react";
import Loader from "@/components/Loader";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
// Data types
export type Product = {
  id: string;
  name: string;
  buyingPrice: number;
  sellingPrice: number;
};

export type Loan = {
  id: string;
  productName: string;
  quantity: number;
  loanQuantity: number;
  paymentType: "CASH" | "ONLINE";
  createdBy: string;
  customerName: string;
  phone: string;
  paymentStatus: "PAID" | "NOT_PAID";
  createdAt: string;
};

// Reusable component for the update loan button and dialog
const UpdateLoanButton = ({
  loan,
  onUpdate,
}: {
  loan: Loan;
  onUpdate: () => void;
}) => {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editedLoan, setEditedLoan] = React.useState({
    customerName: loan.customerName,
    phone: loan.phone,
    quantity: loan.quantity.toString(),
    paymentType: loan.paymentType,
    paymentStatus: loan.paymentStatus,
  });
  const [isLoading, setIsLoading] = React.useState(false);

  const handleUpdateLoan = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/loans/${loan.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editedLoan,
          quantity: parseInt(editedLoan.quantity),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update loan");
      }

      toast.success("Loan updated successfully!");
      setIsDialogOpen(false);
      onUpdate();
    } catch (error) {
      toast.error("Failed to update loan.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <Button onClick={() => setIsDialogOpen(true)} variant="outline">
        <PenBox className="text-green-500" />
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Loan Details</DialogTitle>
          <DialogDescription>
            Update all details for the loan of {loan.customerName}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="customerName" className="text-right">
              Customer Name
            </Label>
            <Input
              id="customerName"
              value={editedLoan.customerName}
              onChange={(e) =>
                setEditedLoan({ ...editedLoan, customerName: e.target.value })
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right">
              Phone
            </Label>
            <Input
              id="phone"
              value={editedLoan.phone}
              onChange={(e) =>
                setEditedLoan({ ...editedLoan, phone: e.target.value })
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="quantity" className="text-right">
              Quantity
            </Label>
            <Input
              id="quantity"
              type="number"
              value={editedLoan.quantity}
              onChange={(e) =>
                setEditedLoan({ ...editedLoan, quantity: e.target.value })
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="paymentType" className="text-right">
              Payment Type
            </Label>
            <Select
              value={editedLoan.paymentType}
              onValueChange={(value: "CASH" | "ONLINE") =>
                setEditedLoan({ ...editedLoan, paymentType: value })
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select payment type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CASH">Cash</SelectItem>
                <SelectItem value="ONLINE">Online/mobile money</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="paymentStatus" className="text-right">
              Payment Status
            </Label>
            <Select
              value={editedLoan.paymentStatus}
              onValueChange={(value) =>
                setEditedLoan({
                  ...editedLoan,
                  paymentStatus: value as "PAID" | "NOT_PAID",
                })
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PAID">PAID</SelectItem>
                <SelectItem value="NOT_PAID">NOT PAID</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleUpdateLoan} disabled={isLoading}>
            {isLoading ? "Updating..." : "Update Loan"}
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

// Delete Loan Button Component
const DeleteLoanButton = ({
  loanId,
  onDelete,
}: {
  loanId: string;
  onDelete: () => void;
}) => {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/loans/${loanId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete loan");
      }

      toast.success("Loan deleted successfully!");
      setIsDialogOpen(false);
      onDelete();
    } catch (error) {
      toast.error("Failed to delete loan.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <Button
        onClick={() => setIsDialogOpen(true)}
        variant="outline"
        size="icon"
        className="text-red-500 hover:text-red-700"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Loan</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this loan? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            onClick={handleDelete}
            disabled={isLoading}
            variant="destructive"
          >
            {isLoading ? "Deleting..." : "Delete"}
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

// Main component that serves as the Next.js page
export default function LoansPage() {
  // Table state management
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  // Data state
  const [loans, setLoans] = React.useState<Loan[]>([]);
  const [products, setProducts] = React.useState<Product[]>([]);

  // Dialog and Form state
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [newLoan, setNewLoan] = React.useState({
    quantity: "",
    paymentType: "",
    customerName: "",
    phone: "",
  });

  // Date filter state
  const [startDate, setStartDate] = React.useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = React.useState<Date | undefined>(undefined);
  const [dateFilterOpen, setDateFilterOpen] = React.useState(false);

  // Combobox state
  const [open, setOpen] = React.useState(false);
  const [selectedProductId, setSelectedProductId] = React.useState<string>("");
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(
    null,
  );
  const [loading, setLoading] = React.useState(true);
  // Get the user ID from the session
  const { data: session } = useSession();
  const createdById = session?.user?.id;

  // Refresh function
  const refreshLoans = async () => {
    const res = await fetch("/api/loans/list");
    if (res.ok) {
      const data = await res.json();
      setLoans(data);
    }
  };

  // Filter loans by date
  const filteredLoans = React.useMemo(() => {
    if (!startDate || !endDate) return loans;
    return loans.filter((loan) => {
      const loanDate = new Date(loan.createdAt);
      return loanDate >= startDate && loanDate <= endDate;
    });
  }, [loans, startDate, endDate]);

  const fetchLoansAndProducts = async () => {
    try {
      const loansResponse = await fetch("/api/loans/list");
      const productsResponse = await fetch("/api/products/list");

      if (loansResponse.ok && productsResponse.ok) {
        const loansData = await loansResponse.json();
        const productsData = await productsResponse.json();
        setLoans(loansData);
        setProducts(productsData);
      } else {
        toast.error("Failed to fetch data");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchLoansAndProducts();
  }, []);

  // Columns definition
  const columns: ColumnDef<Loan>[] = [
    {
      id: "sn",
      header: "S/N",
      cell: ({ row }) => row.index + 1,
    },
    {
      accessorKey: "customerName",
      header: "Customer Name",
    },
    {
      accessorKey: "phone",
      header: "Customer Phone",
    },
    {
      accessorKey: "productName",
      header: "Product Name",
    },
    {
      accessorKey: "quantity",
      header: "Quantity",
    },
    {
      accessorKey: "loanQuantity",
      header: "Total Loan",
      cell: ({ row }) => {
        const price = row.original.loanQuantity;
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "TZS",
        }).format(price);
        return <div className="font-medium">{formatted}</div>;
      },
    },
    {
      accessorKey: "paymentType",
      header: "Payment Type",
    },
    {
      accessorKey: "createdBy",
      header: "Created By",
    },
    {
      accessorKey: "paymentStatus",
      header: "Payment Status",
      cell: ({ row }) => {
        const status = row.original.paymentStatus;
        const color = status === "PAID" ? "bg-green-500" : "bg-red-500";
        return (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-white ${color}`}
          >
            {status}
          </span>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => {
        const [formattedDate, setFormattedDate] = React.useState("");
        const [isClient, setIsClient] = React.useState(false);

        React.useEffect(() => {
          setIsClient(true);
          try {
            const date = new Date(row.original.createdAt);
            // Check if the date is valid
            if (isNaN(date.getTime())) {
              // For invalid dates, show the raw string or a fallback
              setFormattedDate(row.original.createdAt || "No Date");
            } else {
              setFormattedDate(format(date, "MMM dd, yyyy 'at' h:mm a"));
            }
          } catch (error) {
            // For any errors, show the original string
            setFormattedDate(row.original.createdAt || "Date Unavailable");
          }
        }, [row.original.createdAt]);

        if (!isClient) {
          return <span>Loading...</span>;
        }

        return <span>{formattedDate}</span>;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const loan = row.original;
        return (
          <div className="flex items-center gap-2">
            <UpdateLoanButton loan={loan} onUpdate={refreshLoans} />
            <DeleteLoanButton loanId={loan.id} onDelete={refreshLoans} />
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: filteredLoans,
    columns,
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

  const handleCreateLoan = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedProduct) {
      toast.error("Please select a product.");
      return;
    }

    // Check if the user is authenticated before creating a loan
    if (!createdById) {
      toast.error("You must be logged in to create a loan.");
      return;
    }

    try {
      const loanData = {
        productId: selectedProductId, // Send the product ID
        quantity: parseInt(newLoan.quantity, 10),
        paymentType: newLoan.paymentType,
        customerName: newLoan.customerName,
        phone: newLoan.phone,
        createdById: createdById, // Send the user ID from the session
      };

      const response = await fetch("/api/loans/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loanData),
      });

      if (response.ok) {
        toast.success("Loan recorded successfully");
        setIsDialogOpen(false);
        fetchLoansAndProducts(); // Refresh loan data
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to record loan");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to record loan");
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setNewLoan({
      ...newLoan,
      [name]: value,
    });
  };

  const handleSelectProduct = (value: string) => {
    setSelectedProductId(value === selectedProductId ? "" : value);
    setOpen(false);
    const product = products.find((p) => p.id === value);
    setSelectedProduct(product || null);
  };

  const totalLoan =
    selectedProduct && newLoan.quantity
      ? (parseFloat(newLoan.quantity) * selectedProduct.sellingPrice).toFixed(2)
      : "0.00";
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader />
      </div>
    );
  }
  return (
    <div className="w-full">
      <h2 className="font-extrabold p-2 text-xl font-mono">Loans</h2>

      {/* Date Filter Section */}
      <div className="flex flex-wrap items-center gap-3 pb-4">
        <div className="flex items-center gap-2">
          <Popover open={dateFilterOpen} onOpenChange={setDateFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <Calendar className="mr-2 h-4 w-4" />
                {startDate && endDate
                  ? `${format(startDate, "MMM dd")} - ${format(endDate, "MMM dd")}`
                  : "Filter by Date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-4" align="start">
              <div className="grid gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Start Date
                  </label>
                  <CalendarComponent
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    className="rounded-md"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    End Date
                  </label>
                  <CalendarComponent
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    className="rounded-md"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setStartDate(undefined);
                      setEndDate(undefined);
                      setDateFilterOpen(false);
                    }}
                  >
                    Clear
                  </Button>
                  <Button size="sm" onClick={() => setDateFilterOpen(false)}>
                    Apply
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <Input
          placeholder="Filter customer name..."
          value={
            (table.getColumn("customerName")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("customerName")?.setFilterValue(event.target.value)
          }
          className="max-w-sm p-2 flex-1 min-w-[150px]"
        />

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="m-2 sm:m-5">
              <PlusCircle className="mr-2 h-4 w-4" />
              <span className=" sm:inline">New Loan</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleCreateLoan}>
              <DialogHeader>
                <DialogTitle>Add New Loan</DialogTitle>
                <DialogDescription>
                  Enter the loan details below!
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input
                    id="customerName"
                    name="customerName"
                    value={newLoan.customerName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Customer Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={newLoan.phone}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="productId">Product</Label>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between"
                      >
                        {selectedProduct
                          ? selectedProduct.name
                          : "Select a product..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search product..." />
                        <CommandEmpty>No product found.</CommandEmpty>
                        <CommandGroup>
                          {products.map((product) => (
                            <CommandItem
                              key={product.id}
                              value={product.name}
                              onSelect={() => handleSelectProduct(product.id)}
                            >
                              <Check
                                className={
                                  selectedProductId === product.id
                                    ? "mr-2 h-4 w-4 opacity-100"
                                    : "mr-2 h-4 w-4 opacity-0"
                                }
                              />
                              {product.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid gap-3 flex-1">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    value={newLoan.quantity}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-3 flex-1">
                  <Label htmlFor="loanQuantity">Total Loan</Label>
                  <Input
                    id="loanQuantity"
                    name="loanQuantity"
                    readOnly
                    value={totalLoan}
                  />
                </div>

                <div className="grid gap-3 flex-1">
                  <Label htmlFor="paymentType">Payment Type</Label>
                  <Select
                    name="paymentType"
                    onValueChange={(value) =>
                      setNewLoan({
                        ...newLoan,
                        paymentType: value as "CASH" | "ONLINE",
                      })
                    }
                    value={newLoan.paymentType}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Payment Type</SelectLabel>
                        <SelectItem value="CASH">CASH</SelectItem>
                        <SelectItem value="ONLINE">ONLINE</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button type="submit">Add Loan</Button>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
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
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
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
                  colSpan={columns.length}
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
        <div className="flex-1 text-sm text-muted-foreground">
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
