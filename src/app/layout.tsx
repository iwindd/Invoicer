import type { Metadata } from "next";
import { getServerSession } from "@/libs/session";

// providers
import ThemeRegistry from "@/styles/ThemeRegistry";
import { InterfaceProvider } from "./providers/InterfaceProvider";
import LocalizationProvider from "./providers/LocalizationProvider";
import SessionProvider from './providers/SessionProvider';
import QueryProvider from "./providers/QueryProvider";

// styles
import '@/styles/global.css';

export const metadata: Metadata = {
  title: "Invoicer",
  description: "",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession();
  return (
    <html lang="en">
      <body>
        <LocalizationProvider >
          <InterfaceProvider>
            <ThemeRegistry>
              <SessionProvider session={session} >
                <QueryProvider> {children}</QueryProvider>
              </SessionProvider>
            </ThemeRegistry>
          </InterfaceProvider>
        </LocalizationProvider>
      </body>
    </html>
  );
}
