import Image from "next/image";
import React, { useState } from 'react';
import { Inter } from "next/font/google";
import { Dropdown } from "@/ui/Dropdown";
import TextBox from "@/ui/textbox";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {

  const [textBoxValue, setTextBoxValue] = useState(''); // State initialization inside the component

  const handleTextBoxChange = (newValue: string) => {
    setTextBoxValue(newValue); // Update the state with the new value
  };

  return (
    <main className={`flex min-h-screen flex-col items-center bg-slate-500 ${inter.className}`}>
      <div className="flex flex-col items-center  min-w-80 min-h-80 m-52 bg-slate-400 rounded-3xl">
        
        <div className="flex my-5">
          <Dropdown/>
        </div>
        
        <div className="flex">
          <TextBox value={textBoxValue} onChange={handleTextBoxChange} />
        
        </div>
      </div>
      
    </main>
  );
}
