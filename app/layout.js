'use client';

import { Montserrat, Roboto } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "./AuthContext"; // Importando o AuthProvider

const montserrat = Montserrat({ subsets: ["latin"], variable: '--font-montserrat' });
const roboto = Roboto({ subsets: ["latin"], weight: ["400", "500", "700"], variable: '--font-roboto' });

// A metadata foi movida para um nível superior ou gerenciada de outra forma,
// já que 'use client' e metadata não podem estar no mesmo arquivo.
// Para este exemplo, vamos focar na funcionalidade.

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className={`${montserrat.variable} ${roboto.variable} font-sans`}>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
