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
  Pencil,
  Trash2,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import Loader from "@/components/Loader";
import { useSession } from "next-auth/react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
// Data types
export type Product = {
  id: string;
  name: string;
  buyingPrice: number;
  sellingPrice: number;
  category: string;
  scale: string;
};

export type Sale = {
  id: string;
  productName: string;
  quantity: number;
  totalPrice: number;
  paymentType: "CASH" | "ONLINE";
  soldBy: string;
  createdAt: string;
};

// Delete Sale Button Component
const DeleteSaleButton = ({
  saleId,
  onDelete,
}: {
  saleId: string;
  onDelete: () => void;
}) => {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/sales/${saleId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete sale");
      }

      toast.success("Sale deleted successfully!");
      setIsDialogOpen(false);
      onDelete();
    } catch (error) {
      toast.error("Failed to delete sale.");
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
          <DialogTitle>Delete Sale</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this sale? This action cannot be
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

// Update Sale Button Component
const UpdateSaleButton = ({
  sale,
  products,
  onUpdate,
}: {
  sale: Sale;
  products: Product[];
  onUpdate: () => void;
}) => {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [quantity, setQuantity] = React.useState(sale.quantity.toString());
  const [paymentType, setPaymentType] = React.useState(sale.paymentType);
  const [selectedProductId, setSelectedProductId] = React.useState<string>("");
  const [openProduct, setOpenProduct] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const totalPrice =
    selectedProduct && quantity
      ? (parseFloat(quantity) * selectedProduct.sellingPrice).toFixed(2)
      : sale.totalPrice.toString();

  const handleUpdateSale = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/sales/${sale.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProductId || undefined,
          quantity: parseInt(quantity),
          paymentType,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update sale");
      }

      toast.success("Sale updated successfully!");
      setIsDialogOpen(false);
      onUpdate();
    } catch (error) {
      toast.error("Failed to update sale.");
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
        className="text-blue-500 hover:text-blue-700"
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Update Sale</DialogTitle>
          <DialogDescription>
            Update the sale details for {sale.productName}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="editProduct">Product</Label>
            <Popover open={openProduct} onOpenChange={setOpenProduct}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openProduct}
                  className="w-full justify-between"
                >
                  {selectedProduct ? selectedProduct.name : sale.productName}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0">
                <Command>
                  <CommandInput placeholder="Search product..." />
                  <CommandEmpty>No product found.</CommandEmpty>
                  <CommandGroup>
                    {products.map((product) => (
                      <CommandItem
                        key={product.id}
                        value={product.name}
                        onSelect={() => {
                          setSelectedProductId(product.id);
                          setOpenProduct(false);
                        }}
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
          <div className="grid gap-2">
            <Label htmlFor="editQuantity">Quantity</Label>
            <Input
              id="editQuantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="editTotalPrice">Total Price</Label>
            <Input id="editTotalPrice" readOnly value={totalPrice} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="editPaymentType">Payment Type</Label>
            <Select
              onValueChange={(value) =>
                setPaymentType(value as "CASH" | "ONLINE")
              }
              defaultValue={paymentType}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CASH">CASH</SelectItem>
                <SelectItem value="ONLINE">ONLINE</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleUpdateSale} disabled={isLoading}>
            {isLoading ? "Updating..." : "Update Sale"}
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

// Columns definition
// Columns definition - function to get columns with products and refresh callback
const getColumns = (
  products: Product[],
  onRefresh: () => void,
): ColumnDef<Sale>[] => [
  {
    id: "sn",
    header: "S/N",
    cell: ({ row }) => row.index + 1,
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
    accessorKey: "totalPrice",
    header: "Total Price",
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("totalPrice"));
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
    accessorKey: "soldBy",
    header: "Recorded By",
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => {
      try {
        const date = new Date(row.original.createdAt);
        // Check if the date is valid
        if (isNaN(date.getTime())) {
          // For invalid dates, show the raw string or a fallback
          return <div>{row.original.createdAt || "No Date"}</div>;
        } else {
          return <div>{format(date, "MMM dd, yyyy 'at' h:mm a")}</div>;
        }
      } catch (error) {
        return <div>{row.original.createdAt || "No Date"}</div>;
      }
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const sale = row.original;
      return (
        <div className="flex items-center gap-2">
          <UpdateSaleButton
            sale={sale}
            products={products}
            onUpdate={onRefresh}
          />
          <DeleteSaleButton saleId={sale.id} onDelete={onRefresh} />
        </div>
      );
    },
  },
];

export default function SalesDataTable() {
  // Table state management
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  // Data state
  const [sales, setSales] = React.useState<Sale[]>([]);
  const [products, setProducts] = React.useState<Product[]>([]);

  // Dialog and Form state
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [newSale, setNewSale] = React.useState({
    quantity: "",
    paymentType: "",
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
  // Call the hook to get the session data
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  // Refresh function
  const refreshSales = async () => {
    const res = await fetch("/api/sales/list");
    if (res.ok) {
      const data = await res.json();
      setSales(data);
    }
  };

  // Filter sales by date
  const filteredSales = React.useMemo(() => {
    if (!startDate || !endDate) return sales;
    return sales.filter((sale) => {
      const saleDate = new Date(sale.createdAt);
      return saleDate >= startDate && saleDate <= endDate;
    });
  }, [sales, startDate, endDate]);

  React.useEffect(() => {
    // Fetches sales and products on component mount
    const fetchSalesAndProducts = async () => {
      try {
        const salesResponse = await fetch("/api/sales/list");
        const productsResponse = await fetch("/api/products/list");

        if (salesResponse.ok && productsResponse.ok) {
          const salesData = await salesResponse.json();
          const productsData = await productsResponse.json();
          setSales(salesData);
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
    fetchSalesAndProducts();
  }, []);

  const table = useReactTable({
    data: filteredSales,
    columns: getColumns(products, refreshSales),
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

  const handleCreateSale = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedProduct) {
      toast.error("Please select a product.");
      return;
    }

    try {
      const saleData = {
        productId: selectedProductId,
        quantity: parseInt(newSale.quantity, 10),
        paymentType: newSale.paymentType,
        totalPrice: parseFloat(newSale.quantity) * selectedProduct.sellingPrice,
        soldById: currentUserId, // Replace with dynamic user ID
      };

      const response = await fetch("/api/sales/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(saleData),
      });

      if (response.ok) {
        toast.success("Sale recorded successfully");
        setIsDialogOpen(false);
        // Refresh sales data
        const salesResponse = await fetch("/api/sales/list");
        if (salesResponse.ok) {
          const updatedSales = await salesResponse.json();
          setSales(updatedSales);
        }
      } else {
        const errorData = await response.json();
        toast.info(errorData.error || "Failed to delete product");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to record sale");
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setNewSale({
      ...newSale,
      [name]: value,
    });
  };

  const handleSelectProduct = (value: string) => {
    setSelectedProductId(value === selectedProductId ? "" : value);
    setOpen(false);
    const product = products.find((p) => p.id === value);
    setSelectedProduct(product || null);
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
      <h2 className="font-extrabold p-2 text-xl font-mono">Sales</h2>

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
          placeholder="Filter product names..."
          value={
            (table.getColumn("productName")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("productName")?.setFilterValue(event.target.value)
          }
          className="max-w-sm p-2 flex-1 min-w-[150px]"
        />

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="m-2 sm:m-5">
              <PlusCircle className="mr-2 h-4 w-4" />
              <span className="">New Sale</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleCreateSale}>
              <DialogHeader>
                <DialogTitle>Add new Sale</DialogTitle>
                <DialogDescription>
                  Enter the sale details below!
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
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

                <div className="grid gap-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    value={newSale.quantity}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="totalPrice">Total Price</Label>
                  <Input
                    id="totalPrice"
                    name="totalPrice"
                    readOnly
                    value={
                      selectedProduct && newSale.quantity
                        ? (
                            parseFloat(newSale.quantity) *
                            selectedProduct.sellingPrice
                          ).toFixed(2)
                        : "0.00"
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="paymentType">Payment Type</Label>
                  <Select
                    name="paymentType"
                    onValueChange={(value) =>
                      setNewSale({ ...newSale, paymentType: value })
                    }
                    value={newSale.paymentType}
                  >
                    <SelectTrigger className="w-full">
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
                <Button type="submit">Add Sale</Button>
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
