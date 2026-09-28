export default function MetricCard({
  title,
  value,
  unit,
  description,
}) {
  return (
    <div className="bg-white border border-slate-200 p-5">
      <p className="text-sm text-slate-500">
        {title}
      </p>

      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-slate-900">
          {value}
        </span>

        {unit && (
          <span className="text-sm text-slate-500">
            {unit}
          </span>
        )}
      </div>

      {description && (
        <p className="mt-2 text-xs text-slate-400">
          {description}
        </p>
      )}
    </div>
  );
}