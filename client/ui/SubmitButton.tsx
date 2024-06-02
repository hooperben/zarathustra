import { Button } from "@/components/ui/button"


export const SubmitButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <div>
      <Button
        onClick={onClick}
        style={{ color: 'rgba(255, 255, 255, 1)', backgroundColor: 'rgba(25, 30, 35, 1)', width: '200px', transition: 'background-color 0.3s ease'}}
        hoverStyle={{ backgroundColor: 'rgba(25, 30, 35, 0.5)' }}
      >
        Submit
      </Button>
    </div>
  );
};

