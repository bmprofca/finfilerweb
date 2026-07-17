import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const pad = (value) => String(value).padStart(2, '0');

const toIsoDate = (year, month, day) => `${year}-${pad(month + 1)}-${pad(day)}`;

const parseIsoDate = (value) => {
  if (!value) return null;
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
};

const formatDisplayDate = (value) => {
  const date = parseIsoDate(value);
  if (!date) return '';
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const isSameDay = (a, b) =>
  a &&
  b &&
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const buildCalendarDays = (viewDate) => {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const days = [];

  for (let index = firstDay - 1; index >= 0; index -= 1) {
    const day = daysInPrevMonth - index;
    const prevMonthDate = new Date(year, month, 0);
    days.push({
      day,
      month: prevMonthDate.getMonth(),
      year: prevMonthDate.getFullYear(),
      outside: true,
    });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    days.push({ day, month, year, outside: false });
  }

  let nextDay = 1;
  while (days.length % 7 !== 0) {
    const nextMonthDate = new Date(year, month + 1, nextDay);
    days.push({
      day: nextDay,
      month: nextMonthDate.getMonth(),
      year: nextMonthDate.getFullYear(),
      outside: true,
    });
    nextDay += 1;
  }

  return days;
};

const selectClass =
  'h-8 min-w-0 flex-1 cursor-pointer rounded-md border border-border bg-secondary px-2 text-xs font-medium text-primary-foreground outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20';

const DatePickerField = ({
  value,
  onChange,
  label,
  placeholder = 'Select date of birth',
  maxDate = new Date(),
  minYear = 1920,
  variant = 'default',
}) => {
  const containerRef = useRef(null);
  const [open, setOpen] = useState(false);
  const selectedDate = parseIsoDate(value);
  const [viewDate, setViewDate] = useState(selectedDate || new Date(1995, 0, 1));

  const maxYear = maxDate.getFullYear();
  const calendarDays = useMemo(() => buildCalendarDays(viewDate), [viewDate]);

  const yearOptions = useMemo(
    () => Array.from({ length: maxYear - minYear + 1 }, (_, index) => maxYear - index),
    [maxYear, minYear],
  );

  useEffect(() => {
    if (selectedDate) {
      setViewDate(selectedDate);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleSelectDay = (cell) => {
    const date = new Date(cell.year, cell.month, cell.day);
    if (date > maxDate) return;
    if (date.getFullYear() < minYear) return;

    onChange(toIsoDate(cell.year, cell.month, cell.day));
    setOpen(false);
  };

  const shiftMonth = (offset) => {
    setViewDate((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  };

  const handleMonthChange = (event) => {
    const month = Number(event.target.value);
    setViewDate((current) => new Date(current.getFullYear(), month, 1));
  };

  const handleYearChange = (event) => {
    const year = Number(event.target.value);
    setViewDate((current) => new Date(year, current.getMonth(), 1));
  };

  const canShiftForward = useMemo(() => {
    const viewIndex = viewDate.getFullYear() * 12 + viewDate.getMonth();
    const maxIndex = maxDate.getFullYear() * 12 + maxDate.getMonth();
    return viewIndex < maxIndex;
  }, [viewDate, maxDate]);

  const canShiftBackward = useMemo(() => {
    const viewIndex = viewDate.getFullYear() * 12 + viewDate.getMonth();
    const minIndex = minYear * 12;
    return viewIndex > minIndex;
  }, [viewDate, minYear]);

  const today = new Date();

  const handlePrevDay = (e) => {
    e.stopPropagation();
    const current = value ? parseIsoDate(value) : new Date();
    if (!value) {
       onChange(toIsoDate(current.getFullYear(), current.getMonth(), current.getDate()));
       return;
    }
    current.setDate(current.getDate() - 1);
    if (current.getFullYear() >= minYear) {
      onChange(toIsoDate(current.getFullYear(), current.getMonth(), current.getDate()));
    }
  };

  const handleNextDay = (e) => {
    e.stopPropagation();
    const current = value ? parseIsoDate(value) : new Date();
    if (!value) {
       onChange(toIsoDate(current.getFullYear(), current.getMonth(), current.getDate()));
       return;
    }
    current.setDate(current.getDate() + 1);
    if (current <= maxDate) {
      onChange(toIsoDate(current.getFullYear(), current.getMonth(), current.getDate()));
    }
  };

  const isAtMax = value ? (parseIsoDate(value) >= maxDate || isSameDay(parseIsoDate(value), maxDate)) : false;

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label className="mb-1 block text-sm font-medium text-secondary-foreground">{label}</label>
      )}

      {variant === 'navigator' ? (
        <div className="flex items-center rounded-xl border border-border bg-primary h-10 w-fit">
          <button
            type="button"
            onClick={handlePrevDay}
            className="flex h-full w-10 items-center justify-center border-r border-border text-indigo-600 bg-secondary hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors rounded-l-xl"
            aria-label="Previous day"
          >
            <ChevronLeft size={16} />
          </button>
          
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            className="flex h-full items-center gap-2 bg-secondary px-4 text-gray-100 dark:text-white outline-none transition-colors"
          >
            <Calendar size={15} className="text-indigo-600" />
            <span className={`text-sm font-medium ${value ? 'text-primary-foreground' : 'text-secondary-foreground'}`}>
              {value ? formatDisplayDate(value) : placeholder}
            </span>
          </button>

          <button
            type="button"
            onClick={handleNextDay}
            disabled={isAtMax && !!value}
            className="flex h-full w-10 items-center justify-center border-l bg-secondary border-border text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors rounded-r-xl disabled:opacity-30 disabled:hover:bg-transparent"
            aria-label="Next day"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className={`group flex w-full items-center gap-2.5 rounded-lg border bg-secondary px-3 py-2 text-left transition-all
            ${open
              ? 'border-indigo-500 ring-2 ring-indigo-500/20'
              : 'border-border hover:border-indigo-400/60'
            }`}
        >
          <span
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors
              ${open ? 'bg-indigo-500 text-white' : 'bg-indigo-500/10 text-indigo-500 dark:text-indigo-400'}`}
          >
            <Calendar size={15} />
          </span>
          <span className={`min-w-0 flex-1 truncate text-sm ${value ? 'font-medium text-primary-foreground' : 'text-secondary-foreground'}`}>
            {value ? formatDisplayDate(value) : placeholder}
          </span>
          {value && (
            <span
              role="button"
              tabIndex={0}
              onClick={(event) => {
                event.stopPropagation();
                onChange('');
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  event.stopPropagation();
                  onChange('');
                }
              }}
              className="shrink-0 rounded p-0.5 text-secondary-foreground transition-colors hover:bg-red-500/10 hover:text-red-400"
              aria-label="Clear date"
            >
              <X size={14} />
            </span>
          )}
        </button>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute z-50 mt-1.5 w-[min(100vw-2rem,17.5rem)] rounded-xl border border-border bg-primary p-3 shadow-xl"
          >
            <div className="mb-2 flex items-center gap-1">
              <button
                type="button"
                onClick={() => shiftMonth(-1)}
                disabled={!canShiftBackward}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border text-secondary-foreground transition hover:border-indigo-500/40 hover:bg-indigo-500/5 hover:text-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Previous month"
              >
                <ChevronLeft size={15} />
              </button>

              <select
                value={viewDate.getMonth()}
                onChange={handleMonthChange}
                className={selectClass}
                aria-label="Select month"
              >
                {MONTHS_FULL.map((month, index) => (
                  <option key={month} value={index}>
                    {month}
                  </option>
                ))}
              </select>

              <select
                value={viewDate.getFullYear()}
                onChange={handleYearChange}
                className={`${selectClass} max-w-[5.5rem]`}
                aria-label="Select year"
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => shiftMonth(1)}
                disabled={!canShiftForward}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border text-secondary-foreground transition hover:border-indigo-500/40 hover:bg-indigo-500/5 hover:text-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Next month"
              >
                <ChevronRight size={15} />
              </button>
            </div>

            <div className="mb-1 grid grid-cols-7 gap-0.5">
              {WEEKDAYS.map((day) => (
                <div
                  key={day}
                  className="py-0.5 text-center text-[10px] font-semibold uppercase text-secondary-foreground/70"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-0.5">
              {calendarDays.map((cell, index) => {
                const date = new Date(cell.year, cell.month, cell.day);
                const disabled = date > maxDate || date.getFullYear() < minYear;
                const selected = isSameDay(date, selectedDate);
                const isToday = isSameDay(date, today);

                return (
                  <button
                    key={`${cell.year}-${cell.month}-${cell.day}-${index}`}
                    type="button"
                    disabled={disabled}
                    onClick={() => handleSelectDay(cell)}
                    className={`flex h-7 w-full items-center justify-center rounded-md text-xs font-medium transition
                      ${disabled ? 'cursor-not-allowed text-secondary-foreground/25' : 'hover:bg-indigo-500/10'}
                      ${cell.outside && !selected ? 'text-secondary-foreground/35' : ''}
                      ${selected
                        ? 'bg-indigo-600 text-white hover:bg-indigo-600'
                        : !disabled && !cell.outside
                          ? 'text-primary-foreground'
                          : ''
                      }
                      ${isToday && !selected ? 'ring-1 ring-indigo-400/50' : ''}
                    `}
                  >
                    {cell.day}
                  </button>
                );
              })}
            </div>

            <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
              <span className="text-[10px] text-secondary-foreground">
                {value ? formatDisplayDate(value) : 'No date selected'}
              </span>
              <button
                type="button"
                onClick={() => {
                  onChange('');
                  setOpen(false);
                }}
                className="text-[11px] font-medium text-secondary-foreground transition hover:text-red-400"
              >
                Clear
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DatePickerField;
