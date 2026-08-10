// components/mobile/Phase5Recap.jsx
export default function Phase5Recap({ roomState }) {
  const players = roomState?.players || [];

  return (
    <div className="min-h-screen bg-green-400 p-6 flex flex-col font-sans text-black">
      <div className="border-4 border-black bg-white p-6 mb-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center text-black">
        <div className="text-5xl mb-2">🏆</div>
        <h2 className="text-3xl font-black uppercase text-black mb-1">Round Results!</h2>
        <p className="text-md font-bold text-zinc-800">Check the TV for the full match reveal!</p>
      </div>

      <div className="flex-grow space-y-3 overflow-y-auto mb-6">
        <h3 className="text-xl font-black uppercase text-black">Current Standings</h3>
        {players.map((p) => (
          <div key={p.id} className="border-4 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between text-black">
            <span className="text-xl font-black text-black">{p.name}</span>
            <span className="bg-yellow-300 border-2 border-black px-3 py-1 font-black text-lg text-black">
              {p.score || 0} pts
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}