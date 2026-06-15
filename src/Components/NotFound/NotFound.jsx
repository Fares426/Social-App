import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col items-center justify-center px-4">

      {/* Brand */}
      <Link to="/home" className="text-4xl font-bold text-[#1877F2] tracking-tight mb-10">
        meetra
      </Link>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-md w-full max-w-[420px] p-8 flex flex-col items-center text-center">

        {/* Big 404 */}
        <p className="text-[96px] font-extrabold text-[#1877F2] leading-none select-none">
          404
        </p>

        {/* Divider */}
        <div className="w-12 h-1 bg-[#1877F2] rounded-full my-4" />

        <h1 className="text-xl font-bold text-[#050505] mb-2">
          Page not found
        </h1>
        <p className="text-sm text-[#65676B] mb-8 leading-relaxed">
          The link may be broken, or the page may have been removed.
          Check to make sure the URL is correct.
        </p>

        <Link
          to="/home"
          className="w-full bg-[#1877F2] hover:bg-[#166FE5] active:bg-[#1464D2] text-white font-semibold rounded-lg py-3 text-sm transition-colors"
        >
          Go to Home
        </Link>

        <Link
          to="/login"
          className="mt-3 text-sm text-[#1877F2] hover:underline font-medium"
        >
          Back to Login
        </Link>
      </div>

      <p className="mt-8 text-xs text-gray-400">
        © {new Date().getFullYear()} Meetra
      </p>
    </div>
  );
}