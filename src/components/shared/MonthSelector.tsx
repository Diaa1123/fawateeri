import { getMonthName } from '@/lib/utils';

interface MonthSelectorProps {
  months: string[];
  selectedMonth: string | null;
  onSelectMonth: (month: string | null) => void;
}

export function MonthSelector({ months, selectedMonth, onSelectMonth }: MonthSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {/* All button */}
      <button
        onClick={() => onSelectMonth(null)}
        className={`
          px-4 py-2 rounded-lg font-medium text-sm
          transition-colors duration-150
          ${
            selectedMonth === null
              ? 'bg-accent-blue text-white'
              : 'bg-bg-card border border-border-default text-text-secondary hover:bg-bg-card-hover hover:text-text-primary'
          }
        `}
      >
        الكل
      </button>

      {/* Month buttons */}
      {months.map((month) => (
        <button
          key={month}
          onClick={() => onSelectMonth(month)}
          className={`
            px-4 py-2 rounded-lg font-medium text-sm
            transition-colors duration-150
            ${
              selectedMonth === month
                ? 'bg-accent-blue text-white'
                : 'bg-bg-card border border-border-default text-text-secondary hover:bg-bg-card-hover hover:text-text-primary'
            }
          `}
        >
          {getMonthName(month)}
        </button>
      ))}
    </div>
  );
}
