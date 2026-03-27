"use client";

import { UserButton } from "@clerk/nextjs";

export const Header = () => {
  return (
    <header className="fixed z-50 top-0 w-full h-14 flex items-center justify-between px-6 bg-white border-b border-gray-200 shadow-sm">
      <h1 className="text-lg font-bold text-gray-800">Quiz App</h1>

      <div className="flex items-center space-x-4">
        <UserButton
          appearance={{
            elements: {
              userButtonAvatarBox: "w-8 h-8 rounded-full",
              userButtonTrigger: "hover:bg-gray-100 transition-colors p-1 rounded-full",
            },
          }}
        />
      </div>
    </header>
  );
};