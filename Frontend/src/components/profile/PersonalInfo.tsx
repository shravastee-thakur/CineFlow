interface PersonalInfoProps {
  userInfo: any;
}

const PersonalInfo = ({ userInfo }: PersonalInfoProps) => {
  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-white">
          Personal Information
        </h2>
      </div>

      <div className="flex gap-4">
        <div className="text-slate-400 text-sm font-bold">
          <h3>Full name</h3>
          <h3 className="py-4">Email</h3>
        </div>
        <div className="text-white text-sm font-medium">
          <h3>{userInfo.username}</h3>
          <h3 className="py-4">{userInfo.email}</h3>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfo;
