import * as React from "react";
import { useMediaQuery } from "@react-hook/media-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import Image from "next/image";

export function CogDrawer({
  walletConnected,
  setWalletError,
  setWalletAddress,
}: {
  walletConnected: boolean;
  setWalletError: any;
  setWalletAddress: React.Dispatch<React.SetStateAction<string>>;
}) {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  React.useEffect(() => {
    setOpen(!walletConnected);
  }, [walletConnected]);

  const handleConnectWallet = async () => {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        console.log(accounts[0]);
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      setWalletError(true);
      return;
    }

    setOpen(false);
  };

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px] flex flex-col">
          <DialogHeader>
            <DialogTitle>Connect Wallet</DialogTitle>
            <DialogDescription>
              Connect your MetaMask wallet to the bridge.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center">
            <div className="flex">
              <div className="flex justify-center">
                <Image
                  src="MetaMask_Fox.svg"
                  alt="MetaMask"
                  className="dark:invert"
                  width={20}
                  height={25}
                />
              </div>

              <div>
                <Button
                  onClick={handleConnectWallet}
                  style={{
                    color: "rgba(255, 255, 255, 1)",
                    backgroundColor: "rgba(25, 30, 35, 1)",
                    width: "200px",
                    transition: "background-color 0.3s ease",
                  }}
                >
                  Connect Metamask
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Connect Wallet</DrawerTitle>
          <DrawerDescription>
            Make changes to your profile here. Click save when you're done.
          </DrawerDescription>
        </DrawerHeader>
      </DrawerContent>
    </Drawer>
  );
}
