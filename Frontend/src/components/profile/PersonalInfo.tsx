import { useState } from "react";

interface PersonalInfoProps {
  userInfo: any;
  profile: any;
  onSave: (data: any) => Promise<boolean>;
}

export default function PersonalInfo({
  userInfo,
  profile,
  onSave,
}: PersonalInfoProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<any>({});

  const handleEdit = () => {
    setForm({
      username: userInfo?.username || "",
      email: userInfo?.email || "",
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    const success = await onSave(form);
    if (success) setIsEditing(false);
  };

  const fields = [
    { label: "Full Name", key: "username", type: "text", disabled: false },
    { label: "Email", key: "email", type: "email", disabled: true },
  ];

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-white">
          Personal Information
        </h2>
        {!isEditing ? (
          <button
            onClick={handleEdit}
            className="text-sm text-amber-400 hover:text-amber-300 transition-colors"
          >
            Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="text-sm text-amber-400 hover:text-amber-300 transition-colors font-medium"
            >
              Save
            </button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.key}>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              {field.label}
            </label>
            {isEditing ? (
              <input
                type={field.type}
                value={form[field.key] || ""}
                onChange={(e) =>
                  setForm({ ...form, [field.key]: e.target.value })
                }
                disabled={field.disabled}
                className={`w-full bg-slate-800 text-white rounded-xl px-4 py-2.5 border transition-all focus:outline-none ${
                  field.disabled
                    ? "border-slate-700 text-slate-500 cursor-not-allowed"
                    : "border-slate-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                }`}
              />
            ) : (
              <p className="text-slate-200 py-2.5">
                {userInfo?.[field.key] || "Not set"}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
