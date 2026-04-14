/** §5.4 / tokenkey pattern — 150×132, top padding ~1.35rem */
export default function EscapeLogoBadge() {
  return (
    <div className="relative z-10 flex shrink-0 justify-center pt-[1.35rem]">
      <img
        src="/EscapeLogobadge.png"
        alt="Escape Room"
        width={150}
        height={132}
        className="h-[132px] w-[150px] object-contain drop-shadow-md"
      />
    </div>
  );
}
