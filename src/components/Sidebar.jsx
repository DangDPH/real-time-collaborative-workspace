export default function Sidebar() {
  return (
    <div className="w-14 bg-white border-r flex flex-col items-center py-2 gap-3 shadow-sm">
      <button className="p-2 hover:bg-gray-200 rounded">✏️</button>
      <button className="p-2 hover:bg-gray-200 rounded">📝</button>
      <button className="p-2 hover:bg-gray-200 rounded">⬜</button>
      <button className="p-2 hover:bg-gray-200 rounded">🔺</button>
    </div>
  );
}