import { useNavigate } from "react-router-dom";

export default function SecuritySettings() {
  const navigate = useNavigate();

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
      <h2 className="text-lg font-semibold text-white mb-6">
        Security Settings
      </h2>

      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-slate-300 mb-3">
            Change Password
          </h3>
          <button
            onClick={() => navigate("/reset-password")}
            className="text-sm text-amber-400 hover:text-amber-300 transition-colors"
          >
            Update your password →
          </button>
        </div>

        <div className="flex items-center justify-between py-3 border-t border-slate-800">
          <div>
            <p className="font-medium text-white">Two-Factor Authentication</p>
            <p className="text-sm text-slate-400">
              Add an extra layer of security
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" />
            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
          </label>
        </div>

        <div>
          <h3 className="text-sm font-medium text-slate-300 mb-3">
            Active Sessions
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
              <div>
                <p className="text-sm text-white">Current Device</p>
                <p className="text-xs text-slate-400">
                  Chrome on macOS • Active now
                </p>
              </div>
              <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded">
                Active
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
