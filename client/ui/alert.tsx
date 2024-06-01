import { AlertCircle } from "lucide-react"

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"

export function AlertDestructive() {
  return (
    <div style={{ position: 'absolute', top: '8px', right: '16px', zIndex: 1000 }}>
      <Alert style={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }} variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Wallet connection failed.
        </AlertDescription>
      </Alert>
    </div>
  );
}
