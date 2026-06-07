import React, { useState } from 'react';
import { LucideIcon } from 'lucide-react';

interface FloatingInputProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  icon?: LucideIcon;
  placeholder?: string;
  required?: boolean;
}

export function FloatingInput({
  id,
  label,
  type = 'text',
  value,
  onChange,
  icon: Icon,
  placeholder = '',
  required,
}: FloatingInputProps) {
  const [focused, setFocused] = useState(false);
  const isDate = type === 'date';
  // Date inputs always show browser placeholder text (mm/dd/yyyy) — keep label floated
  const active = focused || value.length > 0 || isDate;
  const showIcon = Icon && !isDate;

  return (
    <div className="relative group">
      <div
        className={`relative rounded-2xl border transition-all duration-200 ${
          focused
            ? 'border-[#FF5722]/40 bg-white shadow-[0_0_0_3px_rgba(255,87,34,0.08)]'
            : 'border-gray-200/80 bg-gray-50/80 hover:border-gray-300'
        }`}
      >
        {showIcon && (
          <Icon
            aria-hidden="true"
            className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 shrink-0 z-10 transition-colors duration-200 ${
              focused ? 'text-[#FF5722]' : 'text-gray-400'
            }`}
          />
        )}
        <input
          id={id}
          type={type}
          value={value}
          required={required}
          placeholder={isDate ? undefined : active ? placeholder : ''}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`w-full pt-6 pb-3 bg-transparent text-sm font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none rounded-2xl ${
            showIcon ? 'pl-11' : 'pl-4'
          } ${isDate ? 'pr-3 date-input-field' : 'pr-4'}`}
        />
        <label
          htmlFor={id}
          className={`absolute transition-all duration-200 pointer-events-none font-mono uppercase tracking-wider ${
            showIcon ? 'left-11' : 'left-4'
          } ${
            active
              ? 'top-2 text-[9px] text-[#FF5722] font-bold'
              : 'top-1/2 -translate-y-1/2 text-[11px] text-gray-400 font-semibold'
          }`}
        >
          {label}
        </label>
      </div>
    </div>
  );
}

interface FloatingSelectProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}

export function FloatingSelect({ id, label, value, onChange, children }: FloatingSelectProps) {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;

  return (
    <div className="relative">
      <div
        className={`relative rounded-2xl border transition-all duration-200 ${
          focused
            ? 'border-[#FF5722]/40 bg-white shadow-[0_0_0_3px_rgba(255,87,34,0.08)]'
            : 'border-gray-200/80 bg-gray-50/80 hover:border-gray-300'
        }`}
      >
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full pt-6 pb-3 pl-4 pr-8 bg-transparent text-sm font-semibold text-gray-900 focus:outline-none rounded-2xl appearance-none cursor-pointer"
        >
          {children}
        </select>
        <label
          htmlFor={id}
          className={`absolute left-4 transition-all duration-200 pointer-events-none font-mono uppercase tracking-wider ${
            active
              ? 'top-2 text-[9px] text-[#FF5722] font-bold'
              : 'top-1/2 -translate-y-1/2 text-[11px] text-gray-400 font-semibold'
          }`}
        >
          {label}
        </label>
      </div>
    </div>
  );
}
