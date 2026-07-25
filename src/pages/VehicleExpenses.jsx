import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { PiPlusBold } from 'react-icons/pi';
import { useSubcollection } from '../hooks/useSubcollection';
import StatTile from '../components/StatTile.jsx';
import MonthlyBarChart from '../components/charts/MonthlyBarChart.jsx';
import CategoryBreakdownChart from '../components/expenses/CategoryBreakdownChart.jsx';
import ExpenseList from '../components/expenses/ExpenseList.jsx';
import AddExpenseModal from '../components/expenses/AddExpenseModal.jsx';
import { formatCurrency } from '../utils/format';
import '../components/expenses/CategoryBreakdownChart.css';
import '../components/expenses/ExpenseList.css';

export default function VehicleExpenses() {
  const { vehicle, vehicleId } = useOutletContext();
  const [showAdd, setShowAdd] = useState(false);

  const { items: expenses, loading } = useSubcollection(vehicleId, 'expenseLogs', {
    orderByField: 'date',
    direction: 'desc',
  });

  const { lifetimeTotal, monthlyTotal, topCategory, monthlyBreakdown } = useMemo(() => {
    const lifetime = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    const now = new Date();
    const thisMonth = expenses.filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const monthly = thisMonth.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    const catTotals = {};
    expenses.forEach((e) => {
      catTotals[e.category] = (catTotals[e.category] || 0) + (Number(e.amount) || 0);
    });
    const top = Object.entries(catTotals).sort(([, a], [, b]) => b - a)[0];

    const buckets = {};
    expenses.forEach((e) => {
      const d = new Date(e.date);
      if (Number.isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      buckets[key] = (buckets[key] || 0) + (Number(e.amount) || 0);
    });
    const breakdown = Object.entries(buckets).sort(([a], [b]) => (a > b ? 1 : -1)).slice(-6);

    return { lifetimeTotal: lifetime, monthlyTotal: monthly, topCategory: top, monthlyBreakdown: breakdown };
  }, [expenses]);

  if (loading) return <p className="timeline-empty">Loading expenses…</p>;

  return (
    <>
      <div className="vd-stats">
        <StatTile label="Lifetime spend" value={formatCurrency(lifetimeTotal)} />
        <StatTile label="This month" value={formatCurrency(monthlyTotal)} />
        <StatTile
          label="Top category"
          value={topCategory ? topCategory[0] : '—'}
          sub={topCategory ? formatCurrency(topCategory[1]) : undefined}
        />
      </div>

      <section className="vd-panel glass-panel" style={{ marginBottom: 20 }}>
        <h2>Category breakdown</h2>
        <CategoryBreakdownChart expenses={expenses} />
      </section>

      <section className="vd-panel glass-panel" style={{ marginBottom: 20 }}>
        <h2>Monthly spend</h2>
        <MonthlyBarChart data={monthlyBreakdown} color="#f5b942" />
      </section>

      <section className="vd-panel glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2>All expenses</h2>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
            <PiPlusBold /> Log expense
          </button>
        </div>
        <ExpenseList expenses={expenses} />
      </section>

      {showAdd && (
        <AddExpenseModal vehicleId={vehicleId} vehicle={vehicle} onClose={() => setShowAdd(false)} />
      )}
    </>
  );
}
