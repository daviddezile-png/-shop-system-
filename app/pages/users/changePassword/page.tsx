"use client";

import { Eye, EyeOff } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";

export default function ChangePasswordPage() {
  const { data: session, status } = useSession();
  const userId = session?.user?.id;

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const res = await fetch("/api/users/change-password", {
      method: "POST",
      body: JSON.stringify({
        userId: userId,
        currentPassword,
        newPassword,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      toast.success("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
    } else {
      setError(data.error);
      toast.error(data.error);
    }
  };

  return (
    <div className="h-[90%] flex items-center justify-center">
      <div className="max-w-md w-full   grid grid-cols-1 gap-5 p-8 border rounded-md">
        <h1 className="text-xl font-bold text-center font-mono mb-4">
          Change Password
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Password */}
          <div>
            <label className="block mb-1">Current Password</label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                className="w-full border p-2 rounded pr-10"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block mb-1">New Password</label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                className="w-full border p-2 rounded pr-10"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white p-2 rounded cursor-pointer hover:bg-gray-800 transition"
          >
            Change Password
          </button>
        </form>
      </div>
    </div>
  );
}
