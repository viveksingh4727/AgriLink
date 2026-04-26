import AnimatedCounter from "./AnimatedCounter";

const MarketplaceStats = ({ totalCrops, totalFarmers, totalStates, totalQuantity, avgPrice }) => {
  const stats = [
    { icon: "🌾", label: "Crop Types", value: totalCrops || 0, bg: "bg-brand-50", iconBg: "bg-brand-100" },
    { icon: "👨‍🌾", label: "Active Farmers", value: totalFarmers || 0, bg: "bg-blue-50", iconBg: "bg-blue-100" },
    { icon: "🗺️", label: "States", value: totalStates || 0, bg: "bg-amber-50", iconBg: "bg-amber-100" },
    { icon: "📦", label: "Total Stock", value: totalQuantity || 0, suffix: " kg", bg: "bg-purple-50", iconBg: "bg-purple-100" },
    { icon: "💰", label: "Avg Price", value: avgPrice || 0, prefix: "₹", suffix: "/kg", bg: "bg-rose-50", iconBg: "bg-rose-100" },
  ];

  return (
    <div className="grid gap-3 grid-cols-2 md:grid-cols-5 mt-6 stagger-children">
      {stats.map((stat) => (
        <div key={stat.label} className={`${stat.bg} rounded-xl p-4 border border-white/50`}>
          <div className="flex items-center gap-3">
            <div className={`${stat.iconBg} h-10 w-10 flex items-center justify-center rounded-lg text-xl`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-xs font-medium text-surface-500">{stat.label}</p>
              <p className="text-xl font-bold text-surface-900">
                <AnimatedCounter target={stat.value} prefix={stat.prefix || ""} suffix={stat.suffix || ""} />
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MarketplaceStats;
