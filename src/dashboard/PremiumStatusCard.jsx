const PremiumStatusCard = ({ profile, minimumExperienceYears }) => {
  if (!profile) return null;

  const statusMap = {
    draft: "Draft",
    pending_payment: "Pending Payment",
    payment_submitted: "Payment Submitted",
    pending_review: "Pending Review",
    approved: "Approved",
    rejected: "Rejected",
    expired: "Expired"
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="text-lg font-semibold text-slate-900">Premium Status</h3>
      <p className="mt-2 text-sm text-slate-700">Current Status: {statusMap[profile.status] || profile.status}</p>
      <p className="mt-1 text-sm text-slate-700">Package: ৳{profile.packageAmount || 99} / {profile.packageDays || 30} days</p>
      <p className="mt-1 text-sm text-slate-700">Minimum experience required: {minimumExperienceYears}+ years</p>
      {profile.activeUntil ? (
        <p className="mt-1 text-sm text-slate-700">Active Until: {new Date(profile.activeUntil).toLocaleDateString()}</p>
      ) : null}
      {profile.reviewNote ? <p className="mt-2 text-sm text-amber-700">Note: {profile.reviewNote}</p> : null}
    </div>
  );
};

export default PremiumStatusCard;
