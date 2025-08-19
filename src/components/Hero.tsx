import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="w-full bg-gray-100 py-24 text-gray-900">
      <div className="container mx-auto px-4 text-center max-w-2xl">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-6 text-indigo-600">
          Your icks, heard and honored
        </h1>
        <p className="text-lg sm:text-xl mb-8 text-gray-700">
          Submit your biggest icks.{" "}
          <span className="italic">The pettier, the better.</span>
        </p>
        <Button
          size="lg"
          className="bg-indigo-600 text-white hover:bg-indigo-700 font-semibold transition-colors"
        >
          Submit your ick
        </Button>
      </div>
    </section>
  );
}
