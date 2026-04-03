import { useLoader } from "../../hooks/useLoader";

const TopProgressBar = () => {
  const { visible, progress } = useLoader();

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-x-0 top-0 z-[120] transition-opacity duration-200 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className="h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 shadow-[0_0_18px_rgba(16,185,129,0.4)] transition-[width] duration-200 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default TopProgressBar;
