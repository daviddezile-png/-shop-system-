"use client";
import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
  ColumnFiltersState,
  SortingState,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Loader from "@/components/Loader";
import { MinusCircle, PenBox, PlusCircle } from "lucide-react";

// Define the Product type with `availableQuantity`
export type Product = {
  id: string;
  name: string;
  buyingPrice: number;
  sellingPrice: number;
  category: string;
  scale: string;
  availableQuantity: number;
};

// Reusable component for the update stock button and dialog
const UpdateStockButton = ({
  productId,
  currentQuantity,
  onUpdate,
}: {
  productId: string;
  currentQuantity: number;
  onUpdate: () => void;
}) => {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [quantityToAdd, setQuantityToAdd] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleUpdateStock = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/inventory/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantityToAdd }),
      });

      if (!response.ok) {
        throw new Error("Failed to update inventory");
      }

      toast.success("Inventory updated successfully!");
      setIsDialogOpen(false);
      onUpdate(); // Call the callback to trigger a data re-fetch
    } catch (error) {
      toast.error("Failed to update inventory.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <Button onClick={() => setIsDialogOpen(true)} size="sm">
        <PlusCircle className="text-lime-800" /> Add Stock
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Inventory</DialogTitle>
          <DialogDescription>
            Enter the number of products you want to add to the stock.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Label htmlFor="quantityToAdd">Quantity to Add</Label>
          <Input
            id="quantityToAdd"
            type="number"
            value={quantityToAdd}
            onChange={(e) => setQuantityToAdd(parseInt(e.target.value))}
          />
        </div>
        <DialogFooter>
          <Button onClick={handleUpdateStock} disabled={isLoading}>
            {isLoading ? <Loader /> : "Add to Stock"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Reusable component for the edit product button and dialog
const EditInventoryButton = ({
  product,
  onUpdate,
}: {
  product: Product;
  onUpdate: () => void;
}) => {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [newQuantity, setNewQuantity] = React.useState(
    product.availableQuantity,
  );
  const [isLoading, setIsLoading] = React.useState(false);

  const handleEditProduct = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/inventory/${product.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quantity: parseInt(newQuantity.toString()),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update inventory quantity.");
      }

      toast.success("Inventory quantity updated successfully!");
      setIsDialogOpen(false);
      setNewQuantity(product.availableQuantity);
      onUpdate(); // Call the callback to trigger a data re-fetch
    } catch (error) {
      toast.error("Failed to update inventory quantity.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <Button onClick={() => setIsDialogOpen(true)} variant="outline" size="sm">
        <PenBox className="text-blue-400" /> Edit
      </Button>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Inventory</DialogTitle>
          <DialogDescription>
            Set the new quantity for this product. Current quantity:{" "}
            {product.availableQuantity}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="newQuantity" className="text-right">
              New Quantity
            </Label>
            <Input
              id="newQuantity"
              type="number"
              placeholder="Enter new quantity"
              value={newQuantity}
              onChange={(e) => setNewQuantity(parseInt(e.target.value) || 0)}
              className="col-span-3"
              min="0"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleEditProduct}
            disabled={isLoading || newQuantity < 0}
          >
            {isLoading ? <Loader /> : "Update Quantity"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Main Inventory Data Table component
export default function InventoryDataTable() {
  const [data, setData] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/inventory/list");
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const products: Product[] = await response.json();
      setData(products);
    } catch (error) {
      toast.error("Failed to fetch inventory data.");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const columns: ColumnDef<Product>[] = React.useMemo(
    () => [
      {
        accessorKey: "sn",
        header: "S/N",
        cell: ({ row }) => row.index + 1,
      },
      {
        accessorKey: "name",
        header: "Product Name",
      },
      {
        accessorKey: "availableQuantity",
        header: "Available Quantity",
        cell: ({ row }) => {
          const product = row.original;
          return `${product.availableQuantity} ${product.scale}`;
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const product = row.original;
          return (
            <div className="flex items-center gap-2">
              <EditInventoryButton product={product} onUpdate={fetchData} />
              <UpdateStockButton
                productId={product.id}
                currentQuantity={product.availableQuantity}
                onUpdate={fetchData} // Pass the re-fetch function as a prop
              />
            </div>
          );
        },
      },
    ],
    [fetchData],
  );

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="font-extrabold py-3 p-1 text-xl font-mono">Inventory</h2>
      <Input
        placeholder="Filter products..."
        value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
        onChange={(event) =>
          table.getColumn("name")?.setFilterValue(event.target.value)
        }
        className="max-w-sm p-2"
      />
      <div className="rounded-md border mt-4">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(
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
                  No inventory data available.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
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
  );
}
