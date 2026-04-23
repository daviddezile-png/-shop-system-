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
  ArrowUpDown,
  ChevronDown,
  MoreHorizontal,
  PlusCircle,
  Pencil,
  Trash2,
} from "lucide-react";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
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

// Edit Product Button Component
const EditProductButton = ({
  product,
  onUpdate,
}: {
  product: Product;
  onUpdate: () => void;
}) => {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editedProduct, setEditedProduct] = React.useState({
    name: product.name,
    buyingPrice: product.buyingPrice.toString(),
    sellingPrice: product.sellingPrice.toString(),
    category: product.category,
    scale: product.scale,
  });
  const [isLoading, setIsLoading] = React.useState(false);

  const handleUpdateProduct = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...editedProduct,
          buyingPrice: parseFloat(editedProduct.buyingPrice),
          sellingPrice: parseFloat(editedProduct.sellingPrice),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update product");
      }

      toast.success("Product updated successfully!");
      setIsDialogOpen(false);
      onUpdate();
    } catch (error) {
      toast.error("Failed to update product.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <Button onClick={() => setIsDialogOpen(true)} variant="outline" size="sm">
        <Pencil className="text-blue-400" /> Edit
      </Button>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>
            Make changes to your product here. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={editedProduct.name}
              onChange={(e) =>
                setEditedProduct({ ...editedProduct, name: e.target.value })
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="buyingPrice" className="text-right">
              Buying Price
            </Label>
            <Input
              id="buyingPrice"
              type="text"
              value={editedProduct.buyingPrice}
              onChange={(e) =>
                setEditedProduct({
                  ...editedProduct,
                  buyingPrice: e.target.value,
                })
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="sellingPrice" className="text-right">
              Selling Price
            </Label>
            <Input
              id="sellingPrice"
              type="text"
              value={editedProduct.sellingPrice}
              onChange={(e) =>
                setEditedProduct({
                  ...editedProduct,
                  sellingPrice: e.target.value,
                })
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Category
            </Label>
            <Input
              id="category"
              value={editedProduct.category}
              onChange={(e) =>
                setEditedProduct({ ...editedProduct, category: e.target.value })
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="scale" className="text-right">
              Scale
            </Label>
            <Input
              id="scale"
              value={editedProduct.scale}
              onChange={(e) =>
                setEditedProduct({ ...editedProduct, scale: e.target.value })
              }
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleUpdateProduct} disabled={isLoading}>
            {isLoading ? <Loader /> : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Product type and data (as defined above)
export type Product = {
  id: string;
  name: string;
  buyingPrice: number;
  sellingPrice: number;
  category: string;
  scale: string;
};

// Columns definition function
const getColumns = (
  onRefresh: () => void,
  handleDeleteProduct: (id: string) => void,
): ColumnDef<Product>[] => [
  {
    id: "select",
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
      return (
        <div className="flex items-center gap-2">
          <EditProductButton product={product} onUpdate={onRefresh} />
          <Button
            variant="outline"
            onClick={() => handleDeleteProduct(product.id)}
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
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
  const [products, setProducts] = React.useState<Product[]>([]);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [newProduct, setNewProduct] = React.useState({
    name: "",
    buyingPrice: "",
    sellingPrice: "",
    category: "",
    scale: "",
  });

  React.useEffect(() => {
    // Fetch products from the API
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products/list");
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
          {
            products.length === 0
              ? null
              : toast.error("No product available !");
          }
        } else {
          toast.error("Failed to fetch products");
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleDeleteProduct = async (id: string) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Product deleted successfully");
        fetchProducts();
      } else {
        toast.error("Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  const table = useReactTable({
    data: products,
    columns: getColumns(fetchProducts, handleDeleteProduct),
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

  const handleCreateProduct = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    try {
      const response = await fetch("/api/products/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newProduct),
      });

      if (response.ok) {
        toast.success("Product created successfully");
        setIsDialogOpen(false);
        // Refresh product list
        const fetchProducts = async () => {
          try {
            const response = await fetch("/api/products/list");
            if (response.ok) {
              const data = await response.json();
              setProducts(data);
            } else {
              toast.error("Failed to fetch products");
            }
          } catch (error) {
            console.error(error);
            toast.error("Failed to fetch products");
          }
        };
        fetchProducts();
      } else {
        toast.error("Failed to create product");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to create product");
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
      <h2 className="font-extrabold p-2 text-xl font-mono">Products</h2>
      <div className="flex  flex-wrap items-center pb-4">
        <div className=" flex flex-row">
          <Input
            placeholder="Filter names..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className=" p-2"
          />
          <Input
            placeholder="Filter category..."
            value={
              (table.getColumn("category")?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn("category")?.setFilterValue(event.target.value)
            }
            className="max-w-sm ml-2"
          />
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          {/*  Trigger opens the dialog */}
          <DialogTrigger asChild>
            <Button className="m-5">
              <PlusCircle className="text-blue-800" />
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
                <div className="grid gap-3 pb-4 ">
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
