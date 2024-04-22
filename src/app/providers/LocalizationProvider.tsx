"use client";
import { LocalizationProvider as LocalizationProvider_ } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

const LocalizationProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <LocalizationProvider_ dateAdapter={AdapterDayjs}>
      {children}
    </LocalizationProvider_>
  )
}

export default LocalizationProvider;