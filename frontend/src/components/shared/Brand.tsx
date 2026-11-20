import { Braces } from "lucide-react";
import { Link } from "react-router-dom";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link className={`brand${compact ? " brand--compact" : ""}`} to="/">
      <span className="brand__mark" aria-hidden="true">
        <Braces size={18} strokeWidth={2.2} />
      </span>
      <span>syncode</span>
    </Link>
  );
}
