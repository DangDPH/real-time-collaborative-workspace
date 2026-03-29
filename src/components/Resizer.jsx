export default function Resizer({ onMouseDown }) {
  return (
    <div
      onMouseDown={onMouseDown}
      className="w-1 bg-gray-300 hover:bg-blue-400 cursor-col-resize"
    />
  );
}