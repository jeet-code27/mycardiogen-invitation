import Logo from "@/components/Logo";
import Ecg from "@/components/Ecg";

export default function NotFound() {
  return (
    <main className="grain flex min-h-svh flex-col items-center justify-center px-6 text-center">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(93,0,0,0.45),transparent_60%)]" />
      <Logo className="relative h-14 w-auto" />
      <h1 className="relative mt-10 font-serif text-4xl sm:text-5xl">Invitation not found</h1>
      <Ecg className="relative my-6 h-10 w-72" />
      <p className="relative max-w-sm text-cream/60">
        Please check that the link was copied in full, or contact the person who shared it with you.
      </p>
    </main>
  );
}
