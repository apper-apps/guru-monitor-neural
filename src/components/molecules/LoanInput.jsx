import React from 'react';
import Label from '@/components/atoms/Label';
import Input from '@/components/atoms/Input';

const LoanInput = ({ label, value, onChange, type = 'number', min, max, step, prefix = '', unit = '', description = '' }) => {
  return (
    <div className="mb-6">
      <Label>{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={onChange}
        prefix={prefix}
      />
      {type === 'number' && (
        <Input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={onChange}
          className="w-full mt-2 h-2 bg-surface-200 dark:bg-surface-600 rounded-lg appearance-none cursor-pointer"
        />
      )}
      {description && <div className="text-sm text-surface-500 mt-1">{description}</div>}
    </div>
  );
};

export default LoanInput;