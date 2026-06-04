interface PaymentMethod {
  _id: string;
  type: "card" | "upi";
  last4?: string;
  upiId?: string;
  isDefault: boolean;
  expiry?: string;
}

interface PaymentMethodsProps {
  methods: PaymentMethod[];
  onSetDefault: (id: string) => Promise<boolean>;
}

export default function PaymentMethods({
  methods,
  onSetDefault,
}: PaymentMethodsProps) {
  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-white">Payment Methods</h2>
        <button className="text-sm text-amber-400 hover:text-amber-300 transition-colors">
          Add New →
        </button>
      </div>

      <div className="space-y-3">
        {methods.map((method) => (
          <div
            key={method._id}
            className={`p-4 rounded-xl border transition-colors ${method.isDefault ? "bg-amber-500/5 border-amber-500/30" : "bg-slate-800/50 border-slate-700"}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-6 bg-slate-700 rounded flex items-center justify-center text-xs text-slate-300">
                  {method.type.toUpperCase()}
                </div>
                <div>
                  <p className="text-sm text-white">
                    {method.type === "card"
                      ? `•••• ${method.last4}`
                      : method.upiId}
                  </p>
                  {method.expiry && (
                    <p className="text-xs text-slate-400">
                      Expires {method.expiry}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {method.isDefault ? (
                  <span className="text-xs text-amber-400 bg-amber-400/10 px-2 py-1 rounded">
                    Default
                  </span>
                ) : (
                  <button
                    onClick={() => onSetDefault(method._id)}
                    className="text-xs text-slate-400 hover:text-amber-400 transition-colors"
                  >
                    Set Default
                  </button>
                )}
                <button className="text-xs text-red-400 hover:text-red-300 transition-colors">
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
