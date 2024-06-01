import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import Image from 'next/image'

export const Tokendropdown = () => {
  const [selectedImage, setSelectedImage] = useState({
    src: null,
    alt: "Token",
  });

  const handleSelect = (src, alt) => {
    setSelectedImage({ src, alt });
  };

  return (
    <DropdownMenu style={{ userSelect: 'none' }}>
      <DropdownMenuTrigger style={{ userSelect: 'none', width: '50px', justifyContent: 'center', alignItems: 'center', textAlign: 'center', height: '40px'}}>
      {selectedImage.src ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center',  userSelect: 'none'}}>
          <Image
            src={selectedImage.src}
            alt={selectedImage.alt}
            width={30}
            height={30}
            style={{ outline: 'none', border: 'none' }}
          />
          </div>
        ) : (
          "Token"
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent style={{ border: '1px solid #ccc', borderRadius: '5px', padding: '10px' }}>
        <DropdownMenuLabel>Tokens</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => handleSelect('Ethereum.svg', 'Ethereum')}>
          
        <div style={{ paddingRight: '7px' }}>
          <Image 
            src="Ethereum.svg"
            alt={selectedImage.alt}
            className="dark:invert"
            width={20}
            height={20}
            />
        </div>
            ETHER
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => handleSelect('Eigen.svg', 'Eigen')}>
          
        <div style={{ paddingRight: '7px' }}>
          <Image 
            src="Eigen.svg"
            alt={selectedImage.alt}
            className="dark:invert"
            width={20}
            height={20}
            />
        </div>
            EIGEN
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => handleSelect('Optimism.svg', 'Optimism')}>
          
        <div style={{ paddingRight: '7px' }}>
            <Image 
            src="Optimism.svg"
            alt={selectedImage.alt}
            className="dark:invert px-5;"
            width={20}
            height={20}
            padding-right={20}
            />
        </div>
            OP

        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => handleSelect('Polygon.svg', 'Polygon')}>
          
        <div style={{ paddingRight: '7px' }}>
          <Image 
            src="Polygon.svg"
            alt={selectedImage.alt}
            className="dark:invert"
            width={20}
            height={22}
            />
        </div>
            MATIC
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => handleSelect('Solana.svg', 'Solana')}>
          
        <div style={{ paddingRight: '7px' }}>
          <Image 
            src="Solana.svg"
            alt={selectedImage.alt}
            className="dark:invert"
            width={20}
            height={20}
            />
        </div>
            SOL
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => handleSelect('Schwarma.svg', 'Schwarma')}>
          
        <div style={{ paddingRight: '7px' }}>
          <Image 
            src="Schwarma.svg"
            alt={selectedImage.alt}
            className="dark:invert"
            width={20}
            height={20}
            />
        </div>
            SCWR
        </DropdownMenuItem>

      </DropdownMenuContent>
    </DropdownMenu>
  )
}