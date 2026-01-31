'use client'
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
import { ChevronDown, PlusCircle, Check, ChevronsUpDown } from "lucide-react";
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
import Loader from '@/components/Loader'
import { useSession } from "next-auth/react";
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
};

// Columns definition
export const columns: ColumnDef<Sale>[] = [
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
];

export default function SalesDataTable() {
  // Table state management
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  
  // Data state
  const [sales, setSales] = React.useState<Sale[]>([]);
  const [products, setProducts] = React.useState<Product[]>([]);
  
  // Dialog and Form state
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [newSale, setNewSale] = React.useState({
    quantity: '',
    paymentType: '',
  });

  // Combobox state
  const [open, setOpen] = React.useState(false);
  const [selectedProductId, setSelectedProductId] = React.useState<string>("");
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
   const [loading, setLoading] = React.useState(true);
  // Call the hook to get the session data
  const { data: session } = useSession();
   const currentUserId = session?.user?.id;
  React.useEffect(() => {
    // Fetches sales and products on component mount
    const fetchSalesAndProducts = async () => {
      try {
        const salesResponse = await fetch('/api/sales/list');
        const productsResponse = await fetch('/api/products/list');

        if (salesResponse.ok && productsResponse.ok) {
          const salesData = await salesResponse.json();
          const productsData = await productsResponse.json();
          setSales(salesData);
          setProducts(productsData);
        } else {
          toast.error('Failed to fetch data');
        }
      } catch (error) {
        console.error(error);
        toast.error('Failed to fetch data');
      }
      finally{
        setLoading(false);
      }
    };
    fetchSalesAndProducts();
  }, []);

  const table = useReactTable({
    data: sales,
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

  const handleCreateSale = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedProduct) {
      toast.error('Please select a product.');
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

      const response = await fetch('/api/sales/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saleData),
      });

      if (response.ok) {
        toast.success('Sale recorded successfully');
        setIsDialogOpen(false);
        // Refresh sales data
        const salesResponse = await fetch('/api/sales/list');
        if (salesResponse.ok) {
          const updatedSales = await salesResponse.json();
          setSales(updatedSales);
        }
      }else {
            
            const errorData = await response.json();
            toast.info(errorData.error || "Failed to delete product");
          }
    } catch (error) {
      console.error(error);
      toast.error('Failed to record sale');
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
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter product names..."
          value={(table.getColumn("productName")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("productName")?.setFilterValue(event.target.value)
          }
          className="max-w-sm p-2"
        />

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="m-5">
              <PlusCircle className="text-lime-300" />
              New Sale
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] lg:min-w-[50%]">
            <form onSubmit={handleCreateSale}>
              <DialogHeader>
                <DialogTitle>Add new Sale</DialogTitle>
                <DialogDescription>
                  Enter the sale details below!
                </DialogDescription>
              </DialogHeader>

              <div className="flex gap-4 flex-wrap">
                <div className="grid gap-3">
                  <Label htmlFor="productId">Product</Label>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-[200px] justify-between"
                      >
                        {selectedProduct ? selectedProduct.name : "Select a product..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
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
                                  selectedProductId === product.id ? "mr-2 h-4 w-4 opacity-100" : "mr-2 h-4 w-4 opacity-0"
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
                
                <div className="grid gap-3">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    value={newSale.quantity}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="totalPrice">Total Price</Label>
                  <Input
                    id="totalPrice"
                    name="totalPrice"
                    readOnly
                    value={
                      selectedProduct && newSale.quantity
                        ? (parseFloat(newSale.quantity) * selectedProduct.sellingPrice).toFixed(2)
                        : "0.00"
                    }
                  />
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="paymentType">Payment Type</Label>
                  <Select
                    name="paymentType"
                    onValueChange={(value) => setNewSale({ ...newSale, paymentType: value })}
                    value={newSale.paymentType}
                  >
                    <SelectTrigger className="w-[190px]">
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
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
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
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s) selected.
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