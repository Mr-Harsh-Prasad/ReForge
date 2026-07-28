export default function Loading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-40 bg-slate-800 rounded-xl" />
      <div className="h-10 w-32 bg-slate-800 rounded-xl ml-auto" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-16 rounded-xl bg-slate-800" />
      ))}
    </div>
  );
}
