import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import Image from "next/image";

export const Tokendropdown = ({ selectedToken, onSelect }: any) => {
  const handleSelect = (src: any, alt: any) => {
    onSelect(src, alt);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        style={{
          userSelect: "none",
          width: "50px",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          height: "40px",
        }}
      >
        {selectedToken.src ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              userSelect: "none",
            }}
          >
            {"TEST"}
          </div>
        ) : (
          "TEST"
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        style={{
          border: "1px solid #ccc",
          borderRadius: "5px",
          padding: "10px",
        }}
      >
        <DropdownMenuLabel>Tokens</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => handleSelect("Ethereum.svg", "Ethereum")}
        >
          <div style={{ paddingRight: "7px" }}>
            {/* <Image
              src="Ethereum.svg"
              alt={selectedToken.alt}
              className="dark:invert"
              width={20}
              height={20}
            /> */}
          </div>
          TEST
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
