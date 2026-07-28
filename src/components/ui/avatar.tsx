import { cn } from "@/lib/utils";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

function getInitials(name?: string | null) {
  if (!name) return "U";
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function getColorFromName(name?: string | null) {
  const colors = [
    "from-blue-500 to-blue-700",
    "from-purple-500 to-purple-700",
    "from-emerald-500 to-emerald-700",
    "from-amber-500 to-amber-700",
    "from-red-500 to-red-700",
    "from-cyan-500 to-cyan-700",
  ];
  if (!name) return colors[0];
  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx];
}

const sizes = {
  xs: "h-6 w-6 text-xs",
  sm: "h-8 w-8 text-sm",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-xl",
};

export function Avatar({ src, alt, name, size = "md", className }: AvatarProps) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt ?? name ?? "User avatar"}
        className={cn("rounded-full object-cover ring-2 ring-slate-700", sizes[size], className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-bold text-white bg-gradient-to-br ring-2 ring-slate-700",
        getColorFromName(name),
        sizes[size],
        className
      )}
    >
      {getInitials(name)}
    </div>
  );
}
