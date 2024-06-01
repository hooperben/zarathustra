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

export const Dropdown = () => {
  const [selectedImage, setSelectedImage] = useState({
    src: null,
    alt: "Source",
  });

  const handleSelect = (src, alt) => {
    setSelectedImage({ src, alt });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
      {selectedImage.src ? (
          <Image
            src={selectedImage.src}
            alt={selectedImage.alt}
            width={30}
            height={30}
          />
        ) : (
          "Source"
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Chains</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => handleSelect('Ethereum.svg', 'Ethereum')}>
          
          <Image 
            src="Ethereum.svg"
            alt={selectedImage.alt}
            className="dark:invert"
            width={30}
            height={30}
            />
            Ethereum
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => handleSelect('Optimism.svg', 'Optimism')}>
          
          
          
            <div className='px-5'>
            <Image 
            src="Optimism2.svg"
            alt={selectedImage.alt}
            className="dark:invert px-5;"
            width={20}
            height={20}
            padding-right={20}
            />
            </div>
            Optimism
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => handleSelect('Polygon.svg', 'Polygon')}>
          
          <Image 
            src="Polygon.svg"
            alt={selectedImage.alt}
            className="dark:invert"
            width={30}
            height={30}
            />
            Polygon
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => handleSelect('Solana.svg', 'Solana')}>
          
          <Image 
            src="Solana.svg"
            alt={selectedImage.alt}
            className="dark:invert"
            width={20}
            height={20}
            />
            Solana
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}