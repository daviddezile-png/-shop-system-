"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useRouter } from 'next/navigation';

export default function SignInPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await signIn("credentials", {
      username,
      password,
      redirect: false, // prevent auto redirect
    });

    if (result?.ok) {
      toast.success('login successfully');
      // Fetch session to know role
      const res = await fetch("/api/auth/session");
      const session = await res.json();

      if (session?.user?.role === "ADMIN") {
        router.push("/pages/dashboard");
      } else if (session?.user?.role === "STAFF") {
        router.push("/pages/sales");
      } else {
        router.push("/");
      }
    } else {
      // Display error message from signIn result
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.error("An error occurred during login.");
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow w-90 flex flex-col gap-3"
      >
        <h1 className="text-xl font-bold">Sign In</h1>

        <Input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border p-2 rounded"
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 rounded"
        />
        <Button
          type="submit" className="cursor-pointer" >
          Login
        </Button>
        <Separator />
        <p className=" text-sm text-center">Powered By<span className=" font-mono font-semibold"> Dav~Dav</span></p>
      </form>

    </div>
  );
}