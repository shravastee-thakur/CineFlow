interface PreferencesProps {
  preferences?: {
    defaultLocation: string;
    emailNotifications: boolean;
    smsNotifications: boolean;
  };
  onSave: (prefs: any) => Promise<boolean>;
}

export default function Preferences({ preferences, onSave }: PreferencesProps) {
  const handleChange = async (field: string, value: any) => {
    if (!preferences) return;
    const newPrefs = { ...preferences, [field]: value };
    await onSave(newPrefs);
  };

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
      <h2 className="text-lg font-semibold text-white mb-6">Preferences</h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Default Location
          </label>
          <select
            value={preferences?.defaultLocation || ""}
            onChange={(e) => handleChange("defaultLocation", e.target.value)}
            className="w-full bg-slate-800 text-white rounded-xl px-4 py-2.5 border border-slate-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
          >
            <option value="">Select a city</option>
            <option value="mumbai">Mumbai</option>
            <option value="delhi">Delhi</option>
            <option value="bangalore">Bangalore</option>
            <option value="hyderabad">Hyderabad</option>
          </select>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium text-slate-300">Notifications</h3>
          {[
            {
              key: "emailNotifications",
              label: "Email notifications",
              desc: "Booking confirmations, offers",
            },
            {
              key: "smsNotifications",
              label: "SMS notifications",
              desc: "Show reminders, urgent updates",
            },
          ].map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between py-3 border-t border-slate-800"
            >
              <div>
                <p className="font-medium text-white">{item.label}</p>
                <p className="text-sm text-slate-400">{item.desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                //   checked={
                //     preferences?.[item.key as keyof typeof preferences] || false
                //   }
                  onChange={(e) => handleChange(item.key, e.target.checked)}
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
