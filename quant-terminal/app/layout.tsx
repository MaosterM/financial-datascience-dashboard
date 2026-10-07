import './globals.css';
import { TopBar, BottomBar } from '@/components/shell/Shell';
export const metadata = { title: 'QUANT/HUD' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en"><body className="min-h-screen pt-20 pb-14">
      <TopBar /><main className="px-3 md:px-5">{children}</main><BottomBar />
    </body></html>
  );
}
