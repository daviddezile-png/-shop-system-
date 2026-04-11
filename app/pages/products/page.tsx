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
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"


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
import { ArrowUpDown, ChevronDown, MoreHorizontal, PlusCircle } from "lucide-react";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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

// Product type and data (as defined above)
export type Product = {
  id: string;
  name: string;
  buyingPrice: number;
  sellingPrice:number;
  category: string;
  scale:string;

  // Add other relevant properties
};



// Columns definition (as defined above)
export const columns: ColumnDef<Product>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Name",
  },
    {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "scale",
    header: "Scale",
  },
  {
    accessorKey: "buyingPrice",
    header: () => <div className="text-right">Buying Price</div>,
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("buyingPrice"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "TZS",
      }).format(price);
      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
    {
    accessorKey: "sellingPrice",
    header: () => <div className="text-right">Selling Price</div>,
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("sellingPrice"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "TZS",
      }).format(price);
      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
   {
    id: "profit",
    header: () => <div className="text-right">Possible Profit</div>,
    cell: ({ row }) => {
      const product = row.original;
      const profit = product.sellingPrice - product.buyingPrice;
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "TZS",
      }).format(profit);
      return <div className="text-right font-medium">{formatted}</div>;
    },
  },

  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const product = row.original;
      const [open, setOpen] = React.useState(false);
      const [products, setProducts] = React.useState<Product[]>([]);

     const handleDeleteProduct = async (id: string) => {
  try {
    const response = await fetch(`/api/products/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      //  Remove product from state instantly
      setProducts((prev) => prev.filter((p) => p.id !== id));

      toast.success("Product deleted successfully");
    } else {
      
      const errorData = await response.json();
      toast.info(errorData.error || "Failed to delete product");
    }
  } catch (error: any) {
    console.error(error);
    toast.error("Failed to delete product");
  }
};
      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(product.id)}
              >
                Copy product ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setOpen(true)}>
                Edit Product
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDeleteProduct(product.id)}>
                Delete Product
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Dialog is OUTSIDE the dropdown */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit product</DialogTitle>
                <DialogDescription>
                  Make changes to your product here. Click save when you're done.
                </DialogDescription>
              </DialogHeader>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const updatedProduct = {
                    id: product.id,
                    name: formData.get("name") as string,
                    buyingPrice: Number(formData.get("buyingPrice")),
                    sellingPrice: Number(formData.get("sellingPrice")),
                    scale:formData.get("scale") as string,
                    category:formData.get("scale") as string,
                  };

                  console.log("Updated Product:", updatedProduct);

                  try {
                    const response = await fetch(`/api/products/${product.id}`, {
                      method: "PUT",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify(updatedProduct),
                    });

                    if (response.ok) {
                      toast.success("Product updated successfully");
                                       setProducts(
                        products.map((product) =>
                                        product.id === updatedProduct.id ? updatedProduct : product
                        )
                      ); // Live update
                      setOpen(false);

                      // Refresh product list
                      const fetchProducts = async () => {
                        try {
                          const response = await fetch('/api/products/list');
                          if (response.ok) {
                            const data = await response.json();
                            setProducts(data);
                          } else {
                            toast.error('Failed to fetch products');
                          }
                        } catch (error) {
                          console.error(error);
                          toast.error('Failed to fetch products');
                        }
                      };
                      fetchProducts();
                    } else {
                      toast.error("Failed to update product");
                    }
                  } catch (error) {
                    console.error("Error updating product:", error);
                    toast.error("Failed to update product");
                  }
                }}
              >
                
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      defaultValue={product.name}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="buyingPrice" className="text-right">
                      Buying price
                    </Label>
                    <Input
                      id="buyingPrice"
                      name="buyingPrice"
                      defaultValue={product.buyingPrice}
                      className="col-span-3"
                    />
                  </div>
                   <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="sellingPrice" className="text-right">
                      Selling price
                    </Label>
                    <Input
                      id="sellingPrice"
                      name="sellingPrice"
                      defaultValue={product.sellingPrice}
                      className="col-span-3"
                    />
                  </div>
                   <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="scale" className="text-right">
                    Scale
                    </Label>
                    <Input
                      id="scale"
                      name="scale"
                      defaultValue={product.scale}
                      className="col-span-3"
                    />
                  </div>
                   <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="category" className="text-right">
                     category
                    </Label>
                    <Input
                      id="category"
                      name="category"
                      defaultValue={product.category}
                      className="col-span-3"
                    />
                  </div>
                  
                </div>
                <DialogFooter>
                  <Button type="submit">Save changes</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </>
      );
    },
  },
];

export default function DataTableDemo() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [products, setProducts] = React.useState<Product[]>([]);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
   const [loading, setLoading] = React.useState(true);
  const [newProduct, setNewProduct] = React.useState({
    name: '',
    buyingPrice: '',
    sellingPrice: '',
    category: '',
    scale: '',
  });

  React.useEffect(() => {
    // Fetch products from the API
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products/list');
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
          {products.length === 0 ? null:toast.error("No product available !") }
        } else {
          toast.error('Failed to fetch products');
        }
      } catch (error) {
        console.error(error);
        toast.error('Failed to fetch products');
      }
      finally{
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);
 
  const table = useReactTable({
    data: products, // Use productData here
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

  const handleCreateProduct = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await fetch('/api/products/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProduct),
      });

      if (response.ok) {
        toast.success('Product created successfully');
        setIsDialogOpen(false);
        // Refresh product list
        const fetchProducts = async () => {
          try {
            const response = await fetch('/api/products/list');
            if (response.ok) {
              const data = await response.json();
              setProducts(data);
          
            } else {
              toast.error('Failed to fetch products');
            }
          } catch (error) {
            console.error(error);
            toast.error('Failed to fetch products');
          }
        };
        fetchProducts();
      } else {
        toast.error('Failed to create product');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to create product');
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setNewProduct({
      ...newProduct,
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
      <h2 className='font-extrabold p-2 text-xl font-mono'>Products</h2>
      <div className="flex items-center pb-4">
        <Input
          placeholder="Filter names..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm p-2"
        />
        <Input
          placeholder="Filter category..."
          value={(table.getColumn("category")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("category")?.setFilterValue(event.target.value)
          }
          className="max-w-sm ml-2"
        />
       <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
  {/*  Trigger opens the dialog */}
  <DialogTrigger asChild>
    <Button className="m-5">
      <PlusCircle className="text-lime-300" />
      New product
    </Button>
  </DialogTrigger>

  {/*  Content contains the form */}
  <DialogContent className="sm:max-w-[425px] lg:min-w-[50%]">
    <form onSubmit={handleCreateProduct}>
      <DialogHeader>
        <DialogTitle>Add new product</DialogTitle>
        <DialogDescription>
          Enter the product details below!
        </DialogDescription>
      </DialogHeader>

      <div className="flex gap-4 flex-wrap">
        <div className="grid gap-3">
          <Label htmlFor="name">Product name</Label>
          <Input
            id="name"
            name="name"
            value={newProduct.name}
            onChange={handleInputChange}
          />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            name="category"
            placeholder="optional"
            value={newProduct.category}
            onChange={handleInputChange}
          />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="scale">Product scale</Label>
          <Input
            id="scale"
            name="scale"
            placeholder="optional"
            value={newProduct.scale}
            onChange={handleInputChange}
          />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="buyingPrice">Buying price</Label>
          <Input
            id="buyingPrice"
            name="buyingPrice"          
           value={newProduct.buyingPrice}
            onChange={handleInputChange}
          />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="sellingPrice">Selling price</Label>
          <Input
            id="sellingPrice"
            name="sellingPrice"
            value={newProduct.sellingPrice}
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
                            header.getContext()
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
                        cell.getContext()
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