import { OrderBook, MarketTreemap, RiskHUD } from '@/components/command/CommandCenter';
export default function CommandCenter() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
      <div className="lg:col-span-4"><OrderBook /></div>
      <div className="lg:col-span-8"><MarketTreemap /></div>
      <div className="lg:col-span-12"><RiskHUD /></div>
    </div>
  );
}
