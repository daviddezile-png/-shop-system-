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
import Loader from '@/components/Loader';
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
  createdAt:string;
};

// Reusable component for the update loan button and dialog
const UpdateLoanButton = ({ loan, onUpdate }:{loan: Loan, onUpdate: () => void}) => {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [paymentStatus, setPaymentStatus] = React.useState(loan.paymentStatus);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleUpdateLoan = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/loans/${loan.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update loan status');
      }

      toast.success('Loan updated successfully!');
      setIsDialogOpen(false);
      onUpdate();
    } catch (error) {
      toast.error('Failed to update loan.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <Button onClick={() => setIsDialogOpen(true)} variant="outline">
        Update
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Loan Details</DialogTitle>
          <DialogDescription>
            Update the payment status of the loan for {loan.customerName}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="paymentStatus" className="text-right">Payment Status</Label>
            <Select onValueChange={(value) => setPaymentStatus(value as "PAID" | "NOT_PAID")} defaultValue={paymentStatus}>
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
            {isLoading ? 'Updating...' : 'Update Status'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Main component that serves as the Next.js page
export default function LoansPage() {
  // Table state management
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  // Data state
  const [loans, setLoans] = React.useState<Loan[]>([]);
  const [products, setProducts] = React.useState<Product[]>([]);
  
  // Dialog and Form state
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [newLoan, setNewLoan] = React.useState({
    quantity: '',
    paymentType: '',
    customerName: '',
    phone: '',
  });

  // Combobox state
  const [open, setOpen] = React.useState(false);
  const [selectedProductId, setSelectedProductId] = React.useState<string>("");
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
   const [loading,setLoading] = React.useState(true);
  // Get the user ID from the session
  const { data: session } = useSession();
  const createdById = session?.user?.id;

  const fetchLoansAndProducts = async () => {
    try {
      const loansResponse = await fetch('/api/loans/list');
      const productsResponse = await fetch('/api/products/list');

      if (loansResponse.ok && productsResponse.ok) {
        const loansData = await loansResponse.json();
        const productsData = await productsResponse.json();
        setLoans(loansData);
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
        const color = status === 'PAID' ? 'bg-green-500' : 'bg-red-500';
        return (
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-white ${color}`}>
            {status}
          </span>
        );
      },
    },
     {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => {
        const date = new Date(row.original.createdAt);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
      }
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const loan = row.original;
        return (
          <UpdateLoanButton loan={loan} onUpdate={fetchLoansAndProducts} />
        );
      },
    },
  ];

  const table = useReactTable({
    data: loans,
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
      toast.error('Please select a product.');
      return;
    }
    
    // Check if the user is authenticated before creating a loan
    if (!createdById) {
      toast.error('You must be logged in to create a loan.');
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

      const response = await fetch('/api/loans/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loanData),
      });

      if (response.ok) {
        toast.success('Loan recorded successfully');
        setIsDialogOpen(false);
        fetchLoansAndProducts(); // Refresh loan data
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to record loan');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to record loan');
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
  
  const totalLoan = selectedProduct && newLoan.quantity
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
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter customer name..."
          value={(table.getColumn("customerName")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("customerName")?.setFilterValue(event.target.value)
          }
          className="max-w-sm p-2"
        />

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="m-5">
              <PlusCircle className="text-lime-300" />
              New Loan
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] lg:min-w-[50%]">
            <form onSubmit={handleCreateLoan}>
              <DialogHeader>
                <DialogTitle>Add New Loan</DialogTitle>
                <DialogDescription>
                  Enter the loan details below!
                </DialogDescription>
              </DialogHeader>

              <div className="flex gap-4 flex-wrap">
                <div className="grid gap-3 flex-1">
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input
                    id="customerName"
                    name="customerName"
                    value={newLoan.customerName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-3 flex-1">
                  <Label htmlFor="phone">Customer Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={newLoan.phone}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-3 flex-1">
                  <Label htmlFor="productId">Product</Label>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="justify-between"
                      >
                        {selectedProduct ? selectedProduct.name : "Select a product..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0">
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
                    onValueChange={(value) => setNewLoan({ ...newLoan, paymentType: value as "CASH" | "ONLINE" })}
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
                  <Button type="button" variant="outline">Cancel</Button>
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
