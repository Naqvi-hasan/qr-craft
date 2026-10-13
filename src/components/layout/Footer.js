import Icon from "../Icon";

const BADGES = [
  { icon: "checkCircle", text: "No sign-up required" },
  { icon: "checkCircle", text: "100% free" },
  { icon: "lock", text: "Data stays in your browser" },
  { icon: "device", text: "Works on all devices" },
];

export default function Footer() {
  return (
    <footer className="mt-2 flex flex-col gap-3 border-t border-line pt-5 pb-2 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
      <ul className="flex flex-wrap gap-x-5 gap-y-2">
        {BADGES.map((b) => (
          <li key={b.text} className="flex items-center gap-1.5">
            <Icon name={b.icon} size={15} className="text-success" />
            {b.text}
          </li>
        ))}
      </ul>
      <p className="flex items-center gap-1">
        Made with <Icon name="heart" size={14} className="text-danger" /> for a simpler web
      </p>
    </footer>
  );
}
