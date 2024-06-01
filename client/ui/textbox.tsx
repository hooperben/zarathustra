import React, { useState } from 'react';

interface TextBoxProps {
  value: number;
  onChange: (value: number) => void;
}

const TextBox: React.FC<TextBoxProps> = ({ value, onChange }) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {

    const newValue = event.target.value;

    // Check if the newValue is a valid number or empty
    if (newValue === '' || (!isNaN(parseFloat(newValue)) && parseFloat(newValue) >= 0)) {
      onChange(parseFloat(newValue));
    }
  };

  return (
    <input
      type="number"
      value={value.toString()} // Convert the number value to string
      onChange={handleChange}
      placeholder="Amount"
      step="0.0010" // Allow for small decimal inputs
      style={{
        width: '200px',
        padding: '8px',
        outline: 'none',
      }}
    />
  );
};

export default TextBox;
