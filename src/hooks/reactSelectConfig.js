export const reactSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: 'var(--bg-secondary, #ffffff)',
    borderColor: state.isFocused ? '#6366f1' : 'var(--border-color, #e2e8f0)',
    borderRadius: '0.5rem',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(99, 102, 241, 0.2)' : 'none',
    '&:hover': {
      borderColor: state.isFocused ? '#6366f1' : '#94a3b8',
    },
    minHeight: '40px',
    height: '40px',
    fontSize: '0.875rem',
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? '#6366f1'
      : state.isFocused
        ? 'rgba(99, 102, 241, 0.12)'
        : 'var(--bg-secondary, #ffffff)',
    color: state.isSelected ? '#ffffff' : 'var(--text-primary, #0f172a)',
    cursor: 'pointer',
    fontSize: '0.875rem',
    '&:active': {
      backgroundColor: state.isSelected ? '#4f46e5' : 'rgba(99, 102, 241, 0.2)',
    },
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: 'var(--bg-secondary, #ffffff)',
    borderRadius: '0.5rem',
    border: '1px solid var(--border-color, #e2e8f0)',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    overflow: 'hidden',
    zIndex: 9999,
  }),
  menuList: (provided) => ({
    ...provided,
    borderRadius: '0.5rem',
    padding: '4px',
  }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  singleValue: (provided) => ({
    ...provided,
    color: 'var(--text-primary, #0f172a)',
    fontSize: '0.875rem',
  }),
  placeholder: (provided) => ({
    ...provided,
    color: 'var(--text-secondary, #64748b)',
    fontSize: '0.875rem',
  }),
  valueContainer: (provided) => ({
    ...provided,
    padding: '0 8px',
    height: '40px',
    flexWrap: 'nowrap',
  }),
  indicatorSeparator: () => ({
    display: 'none',
  }),
  dropdownIndicator: (provided, state) => ({
    ...provided,
    color: state.isFocused ? '#6366f1' : '#94a3b8',
    padding: '4px 8px',
    '&:hover': {
      color: '#6366f1',
    },
  }),
};

export const getReactSelectMenuProps = () => ({
  menuPortalTarget: typeof document !== 'undefined' ? document.body : null,
  menuPosition: "fixed",
  menuPlacement: "auto",
});

export const profileSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: 'var(--bg-secondary, #ffffff)',
    borderColor: state.isFocused ? '#6366f1' : 'var(--border-color, #e2e8f0)',
    borderRadius: '0.375rem',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(99, 102, 241, 0.25)' : 'none',
    minHeight: '42px',
    fontSize: '0.875rem',
    cursor: 'pointer',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    '&:hover': {
      borderColor: state.isFocused ? '#6366f1' : '#94a3b8',
    },
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? '#6366f1'
      : state.isFocused
        ? 'rgba(99, 102, 241, 0.12)'
        : 'var(--bg-secondary, #ffffff)',
    color: state.isSelected ? '#ffffff' : 'var(--text-primary, #0f172a)',
    cursor: 'pointer',
    fontSize: '0.875rem',
    padding: '10px 12px',
    '&:active': {
      backgroundColor: state.isSelected ? '#4f46e5' : 'rgba(99, 102, 241, 0.2)',
    },
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: 'var(--bg-secondary, #ffffff)',
    borderRadius: '0.5rem',
    border: '1px solid var(--border-color, #e2e8f0)',
    boxShadow: '0 20px 40px -12px rgba(15, 23, 42, 0.25)',
    overflow: 'hidden',
    zIndex: 9999,
  }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  singleValue: (provided) => ({
    ...provided,
    color: 'var(--text-primary, #0f172a)',
    fontSize: '0.875rem',
  }),
  placeholder: (provided) => ({
    ...provided,
    color: 'var(--text-secondary, #64748b)',
    fontSize: '0.875rem',
  }),
  valueContainer: (provided) => ({
    ...provided,
    padding: '2px 12px',
  }),
  indicatorSeparator: () => ({ display: 'none' }),
  dropdownIndicator: (provided, state) => ({
    ...provided,
    color: state.isFocused ? '#6366f1' : '#94a3b8',
    padding: '4px 10px',
    transition: 'color 0.2s ease, transform 0.2s ease',
    transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
    '&:hover': { color: '#6366f1' },
  }),
};
