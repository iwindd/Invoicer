"use client";
import { Button } from "@mui/material";
import { signOut } from "next-auth/react";

export default function Home() {
  const logout = async () => {
    await signOut()
  }

  return (
    <>
      <Button
        onClick={logout}
      > 
        Logout
      </Button>
    </>
  );
}
