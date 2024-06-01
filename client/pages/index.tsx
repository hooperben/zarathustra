import Image from "next/image";
import React, { useState } from 'react';
import { Inter } from "next/font/google";
import { Dropdown } from "@/ui/Dropdown";
import { Tokendropdown } from "@/ui/Tokendropdown";
import TextBox from "@/ui/textbox";
import { SubmitButton } from "@/ui/SubmitButton";
import SettingsButton from "@/ui/SettingsButton";
import { CogDrawer } from "@/ui/CogDrawer";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {

  const [textBoxValue, setTextBoxValue] = useState(''); // State initialization inside the component

  const handleTextBoxChange = (newValue: string) => {
    setTextBoxValue(newValue); // Update the state with the new value
  };

  // Am I hallucinating or is there a shwarma in front of me??? - Thomas

  return (
    <main className={`flex min-h-screen flex-col items-center ${inter.className}`} style={{ background: 'linear-gradient(to right, rgb(49, 229, 232), rgb(46, 209, 132))' }}>

      <div className="flex flex-col items-center min-w-96 min-h-80 m-52 rounded-3xl shadow-xl" style={{ backgroundColor: 'rgba(200, 200, 200, 0.35)', border: '0.5px solid white', paddingLeft: '20px', paddingRight: '20px'}}>
        
      <div className="flex flex-row ml-80 mt-3">

        <SettingsButton></SettingsButton>
      </div>

        <div className="flex flex-row my-5 px-5 py-1 items-center space-x-3 bg-white rounded-xl shadow-lg">
          <div className="flex">
            <Dropdown/>
          </div>
          <div className="flex" >
            <TextBox value={textBoxValue} onChange={handleTextBoxChange} />
          </div>
          <div>
            <Tokendropdown/>
          </div>
        </div>

        <div className="flex flex-row px-5 py-1 items-center space-x-3 bg-white rounded-xl shadow-lg">
          <div className="flex" >
            <Dropdown/>
          </div>
          <div className="flex">
            <TextBox value={textBoxValue} onChange={handleTextBoxChange} />
          </div>
          <div>
          <Tokendropdown/>
          </div>
        </div>

        <div className="flex my-12">
            <SubmitButton/>
        </div>
      </div>

      <div>
        <CogDrawer></CogDrawer>
      </div>
      
    </main>
  );
}
