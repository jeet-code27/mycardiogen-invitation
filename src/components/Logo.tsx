/* eslint-disable @next/next/no-img-element -- SVG logo, no optimisation needed */

export default function Logo({
  variant = "light",
  className = "h-10 w-auto",
}: {
  variant?: "light" | "dark";
  className?: string;
}) {
  return (
    <img
      src={variant === "light" ? "/brand/logo-light.svg" : "/brand/logo.svg"}
      alt="MyCardioGen"
      width={78}
      height={57}
      className={className}
    />
  );
}
