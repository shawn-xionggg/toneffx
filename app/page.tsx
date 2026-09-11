import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#080808] text-white">

      {/* Navbar */}
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white font-bold text-black">
              T
            </div>

            <div>
              <p className="font-semibold leading-none">
                Toneffx
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-neutral-500">
                Guitar Tone Matching
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-neutral-400 transition hover:text-white"
            >
              Log in
            </Link>

            <Link
              href="/signup"
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-neutral-200"
            >
              Create account
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto flex min-h-screen max-w-6xl items-center px-6 pt-20">
        <div className="max-w-4xl">

          <div className="mb-6 inline-flex rounded-full border border-neutral-800 bg-neutral-900 px-4 py-2 text-xs uppercase tracking-[0.2em] text-neutral-400">
            Audio analysis + adaptive tone matching
          </div>

          <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
            Get closer to the
            <span className="block text-neutral-500">
              guitar tone you want.
            </span>
          </h1>

          <p className="mt-7 max-w-2xl text-lg leading-8 text-neutral-400">
            Upload a reference tone, record your own guitar, and Toneffx
            analyzes the difference between them. It aligns your performances,
            compares their audio characteristics, and recommends which available
            controls to adjust.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/tone"
              className="rounded-xl bg-white px-6 py-3 font-semibold text-black transition hover:bg-neutral-200"
            >
              Try it without an account
            </Link>

            <a
              href="#how-it-works"
              className="rounded-xl border border-neutral-700 px-6 py-3 font-semibold text-neutral-300 transition hover:border-neutral-500 hover:text-white"
            >
              How it works
            </a>
          </div>

          <p className="mt-4 text-sm text-neutral-600">
            No account required to test the tone-matching workflow.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="border-t border-neutral-900 bg-[#0b0b0b]"
      >
        <div className="mx-auto max-w-6xl px-6 py-28">

          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">
              How it works
            </p>

            <h2 className="mt-4 text-4xl font-semibold tracking-tight">
              From recording to recommendation.
            </h2>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <Step
              number="01"
              title="Choose your controls"
              description="Tell Toneffx which knobs or parameters are actually available on your rig."
            />

            <Step
              number="02"
              title="Add a reference"
              description="Upload the guitar tone or recording you want to get closer to."
            />

            <Step
              number="03"
              title="Record your tone"
              description="Play the same passage. Timing does not need to be exact."
            />

            <Step
              number="04"
              title="Adjust and repeat"
              description="Get a tone similarity score and an adjustment to try, then record again."
            />
          </div>
        </div>
      </section>

      {/* Technical explanation */}
      <section className="border-t border-neutral-900">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-28 lg:grid-cols-2">

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">
              Under the hood
            </p>

            <h2 className="mt-4 text-4xl font-semibold tracking-tight">
              Your performances do not need to line up perfectly.
            </h2>

            <p className="mt-6 leading-7 text-neutral-400">
              Toneffx analyzes pitch information and aligns corresponding
              parts of the two performances before comparing their tone. This
              lets it handle differences in timing rather than simply comparing
              the recordings sample by sample.
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-8">
            <div className="space-y-5 font-mono text-sm">
              <PipelineItem text="Reference audio" />
              <PipelineArrow />
              <PipelineItem text="Performance alignment" />
              <PipelineArrow />
              <PipelineItem text="Spectral feature comparison" />
              <PipelineArrow />
              <PipelineItem text="Tone similarity score" />
              <PipelineArrow />
              <PipelineItem text="Suggested control adjustment" />
            </div>
          </div>

        </div>
      </section>

      {/* Account section */}
      <section className="border-t border-neutral-900 bg-neutral-950">
        <div className="mx-auto max-w-6xl px-6 py-32">

          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">
                Optional account
              </p>

              <h2 className="mt-4 text-4xl font-semibold tracking-tight">
                Try it first.
                <span className="block text-neutral-500">
                  Save your setup later.
                </span>
              </h2>

              <p className="mt-6 max-w-xl leading-7 text-neutral-400">
                You do not need an account to experiment with Toneffx.
                Creating one lets you save your rig configuration so you do not
                have to re-enter your available controls and settings every time
                you come back.
              </p>

              <div className="mt-8 space-y-4">
                <Benefit text="Save your current rig controls and values" />
                <Benefit text="Reload your setup on future visits" />
                <Benefit text="Keep your configuration tied to your account" />
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-[#111111] p-8 sm:p-10">
              <p className="text-sm font-medium text-neutral-400">
                Want to keep your setup?
              </p>

              <h3 className="mt-2 text-2xl font-semibold">
                Create a free account.
              </h3>

              <p className="mt-3 text-sm leading-6 text-neutral-500">
                Your saved rig stays available when you return, while you can
                still use the core tone analysis without signing up.
              </p>

              <Link
                href="/signup"
                className="mt-8 block w-full rounded-xl bg-white px-5 py-3 text-center font-semibold text-black transition hover:bg-neutral-200"
              >
                Create account
              </Link>

              <Link
                href="/tone"
                className="mt-3 block w-full rounded-xl border border-neutral-700 px-5 py-3 text-center font-semibold text-neutral-300 transition hover:border-neutral-500 hover:text-white"
              >
                Continue without account
              </Link>

              <p className="mt-5 text-center text-xs text-neutral-600">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-neutral-400 hover:text-white"
                >
                  Log in
                </Link>
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-neutral-900">
        <div className="mx-auto max-w-6xl px-6 py-28 text-center">

          <h2 className="text-4xl font-semibold tracking-tight">
            Hear the difference. Measure the difference.
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-neutral-500">
            Start with a reference recording and see how close your current
            setup can get.
          </p>

          <Link
            href="/tone"
            className="mt-8 inline-block rounded-xl bg-white px-7 py-3 font-semibold text-black transition hover:bg-neutral-200"
          >
            Open Toneffx
          </Link>

        </div>
      </section>

      <footer className="border-t border-neutral-900 px-6 py-8 text-center text-sm text-neutral-600">
        Toneffx
      </footer>
    </main>
  );
}


function Step({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6">
      <p className="font-mono text-xs text-neutral-600">
        {number}
      </p>

      <h3 className="mt-5 text-lg font-semibold">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-6 text-neutral-500">
        {description}
      </p>
    </div>
  );
}


function Benefit({
  text,
}: {
  text: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-2 w-2 rounded-full bg-white" />

      <p className="text-sm text-neutral-300">
        {text}
      </p>
    </div>
  );
}


function PipelineItem({
  text,
}: {
  text: string;
}) {
  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-950 px-5 py-4 text-neutral-300">
      {text}
    </div>
  );
}


function PipelineArrow() {
  return (
    <div className="pl-5 text-neutral-700">
      ↓
    </div>
  );
}