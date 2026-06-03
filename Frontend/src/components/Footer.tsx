import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer
      className="bg-slate-950 border-t border-slate-800"
      aria-label="Site footer"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link
              to="/"
              className="inline-block text-2xl font-extrabold tracking-tight text-white hover:text-amber-400/80 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-950 rounded-sm"
            >
              Cine<span className="text-amber-400">Flow</span>
            </Link>
            <p className="mt-3 text-sm text-slate-400 leading-relaxed">
              Seamless movie booking, exclusive screenings, and a premium
              cinematic experience tailored for you.
            </p>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Company
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/about"
                  className="text-slate-400 hover:text-amber-400 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 rounded-sm px-1 -ml-1 py-1"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-slate-400 hover:text-amber-400 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 rounded-sm px-1 -ml-1 py-1"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Support
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/support"
                  className="group flex items-center gap-2 text-slate-400 hover:text-amber-400 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 rounded-sm px-1 -ml-1 py-1"
                >
                  <svg
                    className="w-4 h-4 transition-transform group-hover:scale-110"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  24/7 Customer Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Legal
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/terms"
                  className="text-slate-400 hover:text-amber-400 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 rounded-sm px-1 -ml-1 py-1"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-slate-400 hover:text-amber-400 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 rounded-sm px-1 -ml-1 py-1"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider & Copyright */}
        <div className="border-t border-slate-800 pt-8">
          <p className="text-center text-sm text-slate-500">
            © 2026 Shravastee Thakur. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
