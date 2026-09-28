export function CommunityStats({
  communities,
  countries,
  members,
}: {
  communities: number;
  countries: number;
  members: number;
}) {
  const stats = [
    { value: communities.toString(), label: "Communities" },
    { value: countries.toString(), label: "Countries" },
    { value: formatMembers(members), label: "Members" },
  ];

  return (
    <dl className="grid max-w-narrow grid-cols-3 gap-6">
      {stats.map((stat) => (
        <div key={stat.label}>
          <dd className="text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl">
            {stat.value}
          </dd>
          <dt className="foundation-eyebrow mt-2.5 text-muted-foreground">
            {stat.label}
          </dt>
        </div>
      ))}
    </dl>
  );
}

function formatMembers(value: number) {
  if (value < 1000) return value.toString();
  return `${Math.floor(value / 1000)}k+`;
}
