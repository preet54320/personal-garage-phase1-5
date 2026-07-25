import { useState } from 'react';
import { formatCurrency, formatDate } from '../../utils/format';
import { EXPENSE_CATEGORIES, CATEGORY_COLORS } from './expenseCategories';
import './ExpenseList.css';

export default function ExpenseList({ expenses }) {
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? expenses : expenses.filter((e) => e.category === filter);

  return (
    <div>
      <div className="expense-filter">
        <button
          className={`chip${filter === 'all' ? ' is-active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        {EXPENSE_CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`chip${filter === cat ? ' is-active' : ''}`}
            onClick={() => setFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="timeline-empty">No expenses in this category yet.</p>
      ) : (
        <div className="expense-list">
          {filtered.map((e) => (
            <div className="expense-row" key={e.id}>
              <span
                className="expense-row__dot"
                style={{ background: CATEGORY_COLORS[e.category] || '#8a8f98' }}
              />
              <div className="expense-row__main">
                <p className="expense-row__desc">{e.description || e.category}</p>
                <p className="expense-row__meta">{e.category} · {formatDate(e.date)}</p>
              </div>
              <strong className="expense-row__amount">{formatCurrency(e.amount)}</strong>
              {e.invoiceURL && (
                <a href={e.invoiceURL} target="_blank" rel="noreferrer" className="expense-row__invoice">
                  Invoice
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
