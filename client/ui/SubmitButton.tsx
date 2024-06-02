export const SubmitButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <div>
      <button
        onClick={onClick}
        className="mt-4 bg-black text-white font-bold py-2 px-4 rounded transition transform hover:bg-gray-700 hover:scale-105 active:bg-gray-600 active:scale-95"
      >
        Submit
      </button>
    </div>
  );
};
