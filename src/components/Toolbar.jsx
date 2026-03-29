export default function Toolbar({ setMode }) {
  return (
    <div className="flex justify-center mt-4">
      <div className="flex gap-3">

        <button
          onClick={() => setMode("canvas")}
          className="px-4 py-2 bg-[#f4a261] text-white rounded-lg shadow hover:opacity-80"
        >
          Canvas
        </button>

        <button
          onClick={() => setMode("text")}
          className="px-4 py-2 bg-[#8ecae6] text-white rounded-lg shadow hover:opacity-80"
        >
          Text
        </button>

        <button
          onClick={() => setMode("split")}
          className="px-4 py-2 bg-[#e5989b] text-white rounded-lg shadow hover:opacity-80"
        >
          Split
        </button>

      </div>
    </div>
  );
}