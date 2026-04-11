"use client"
import SalesByProduct from '@/components/SalesByProduct'
import SalesTrends from '@/components/SalesTrendLineChart'
import { Card, CardAction, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import { BadgeCheck, CreditCard, StoreIcon, Trash2, Wallet2 } from 'lucide-react'
import React from 'react'
import { toast } from 'sonner';
import { useState, useEffect } from 'react'
import Loader from '@/components/Loader'
const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0); // Ensure total is a number
  const [soldProducts, setSoldProducts] = useState<any[]>([]);
  useEffect(() => {
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

    const fetchLoans = async () => {
      try {
        const res = await fetch('/api/loans/list');
        const data = await res.json();
        setLoans(data);
      } catch (error) {
        console.error(error);
        toast.error('failed to fetch loans');
      }
    };

    const fetchTotalIncome = async () => {
      try {
        const res = await fetch('/api/totalIncome');
        if (res.ok) {
          const data = await res.json();
          setTotal(data.total); // Access the total property
        } else {
          toast.error('Failed to fetch total income');
        }
      } catch (error) {
        console.error(error);
        toast.error('failed to fetch total income');
      } finally {
        setLoading(false);
      }
    };

    const fetchProductsSold = async () => {
      try {
        const res = await fetch('/api/soldProduct');
        if (res.ok) {
          const data = await res.json();
          setSoldProducts(data.count);
        }
      } catch (error) {
        console.error(error);
        toast.error('Failed to fetch sold products');
      }
    }

    fetchProducts();
    fetchLoans();
    fetchTotalIncome();
    fetchProductsSold();
  }, []);

  const totalProduct = products.length;
  const totalLoans = loans.length;
 if (loading) {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <Loader />
    </div>
  );
}
  return (
    <div className='w-full'>
      <h2 className='font-extrabold p-2 text-xl font-mono'>Dashboard</h2>
      <div className='w-full flex flex-wrap '>
        <Card className='w-[25%] md:w-[50%] flex-1 bg-green-300  ' >
          <CardContent>
            <CardAction><StoreIcon /></CardAction>
            <CardTitle>{totalProduct}</CardTitle>
            <CardDescription>
            Registered Products
            </CardDescription>
          </CardContent>
        </Card>
        <Card className='w-[25%] md:w-[50%] flex-1 bg-lime-300'>
          <CardContent>
            <CardAction><BadgeCheck/></CardAction>
            <CardTitle>{soldProducts}</CardTitle>
            <CardDescription>
            Product Sold ToDay
            </CardDescription>
          </CardContent>
        </Card>
        <Card className='w-[25%] md:w-[50%] flex-1 bg-yellow-400'>
          <CardContent>
            <CardAction><CreditCard /></CardAction>
            <CardTitle>{totalLoans}</CardTitle>
            <CardDescription>
             All loans
            </CardDescription>
          </CardContent>
        </Card>
        <Card className='w-[25%] md:w-[50%]  flex-1 bg-orange-400'>
          <CardContent>
            <CardAction><Wallet2 /></CardAction>
            <CardTitle>{Number(total).toLocaleString()}<span className='text-lg'>.Tsh</span></CardTitle>
            <CardDescription>
              Day's income
            </CardDescription>
          </CardContent>
        </Card>
      </div>
      <div className="flex flex-col lg:flex-row gap-6 p-6">
        <div className="bg-white rounded-lg shadow p-4 w-full">
          <h2 className="font-bold mb-2">Sales vs Products (Filter by Date)</h2>
          <SalesByProduct />
        </div>
        <div className="bg-white rounded-lg shadow p-4 w-full">
          <h2 className="font-bold mb-2">Sales Trends</h2>
          <SalesTrends />
        </div>
      </div>
    </div>
  )
}


export default Dashboard