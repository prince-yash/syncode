export function Separator({ className = "" }: { className?: string }) {
  return <hr className={`separator ${className}`.trim()} />;
}
