import React, { useState } from 'react';

interface TextBoxProps {
    value: number;
  onChange: (value: number) => void;
}

const TextBox: React.FC<TextBoxProps> = ({ value, onChange }) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseFloat(event.target.value); // Parse the input value to a float
      onChange(newValue);
    };

    return (
        <input
          type="text"
          value={value.toString()} // Convert the number value to string
          onChange={handleChange}
          style={{
            border: '1px solid rgb(25, 30, 35)',
            padding: '8px',
          }}
        />
      );
    };

export default TextBox;
