import './globals.css';
import { TopBar, BottomBar } from '@/components/shell/Shell';
import { StoreProvider } from '@/lib/store';
export const metadata = { title: 'QUANT/HUD' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en"><body className="min-h-screen pt-20 pb-14"><StoreProvider>
      <TopBar /><main className="px-3 md:px-5">{children}</main><BottomBar />
    </StoreProvider></body></html>
  );
}
