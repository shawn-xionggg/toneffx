
import Image from "next/image";
import Link from "next/link";
export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f5f1e7] text-[#303b2d]">

      {/* NAVBAR */}
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-[#cdd5c2] bg-[#f5f1e7]/95">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#d4dfc6] font-bold text-[#303b2d]">
              T
            </div>

            <div>
              <p className="font-semibold leading-none">
                Toneffx
              </p>

              <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[#606b58]">
                Guitar Tone Matching
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm text-[#606b58] transition hover:text-[#303b2d]"
            >
              Log in
            </Link>

            <Link
              href="/signup"
              className="rounded-lg bg-[#d4dfc6] px-4 py-2 text-sm font-semibold text-[#303b2d] transition hover:bg-[#c3d2b3]"
            >
              Create account
            </Link>
          </div>
        </div>
      </header>
      <section className="relative min-h-screen overflow-hidden bg-[#f5f1e7]">

        <FlyingObjects />

        {/* Soft sage backdrop */}
        <div className="pointer-events-none absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[#d4dfc6]/40 blur-[120px]" />

        <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl items-center px-6 pt-20">
          <div className="max-w-4xl">

            <div className="mb-6 inline-flex rounded-full border border-[#c5d0b9] bg-[#e5ebdc] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[#58704e]">
              Audio analysis + adaptive tone matching
            </div>

            <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
              Stop guessing.
              <span className="block text-[#58704e]">
                Match the tone.
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-[#606b58]">
              Upload a reference tone, record your guitar, and Toneffx
              analyzes how they differ. It aligns the performances, measures
              their audio characteristics, and tells you which controls to
              adjust.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/tone"
                className="rounded-xl bg-[#d4dfc6] px-6 py-3 font-semibold text-[#303b2d] transition hover:scale-[1.02] hover:bg-[#c3d2b3]"
              >
                Try it without an account
              </Link>

              <a
                href="#how-it-works"
                className="rounded-xl border border-[#cdd5c2] bg-[#f8f5ec] px-6 py-3 font-semibold text-[#606b58] transition hover:bg-[#e5ebdc]"
              >
                How it works
              </a>
            </div>

            <p className="mt-4 text-sm text-[#606b58]">
              No account required.
            </p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="how-it-works"
        className="relative overflow-hidden border-t border-[#cdd5c2] bg-[#e5ebdc]"
      >
        <div className="pointer-events-none absolute -right-16 top-12 opacity-10">
          <Image
            src="/guitar-sprite.png"
            alt=""
            width={650}
            height={260}
            className="w-96 rotate-12 opacity-40 mix-blend-multiply grayscale"
            />
        </div>

        <div className="mx-auto max-w-6xl px-6 py-28">

          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#58704e]">
              How it works
            </p>

            <h2 className="mt-4 text-4xl font-semibold tracking-tight">
              From recording to recommendation.
            </h2>

            <p className="mt-5 text-[#606b58]">
              You play. Toneffx handles the signal processing.
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <Step
              number="01"
              title="Choose your controls"
              description="Tell Toneffx which knobs actually exist on your setup."
            />

            <Step
              number="02"
              title="Add a reference"
              description="Upload the guitar sound you want to match."
            />

            <Step
              number="03"
              title="Record your tone"
              description="Play the same passage. Your timing does not need to be perfect."
            />

            <Step
              number="04"
              title="Adjust and repeat"
              description="Get a match score and a suggested setting, then try again."
            />
          </div>
        </div>
      </section>

      {/* UNDER THE HOOD */}
      <section className="relative overflow-hidden border-t border-[#cdd5c2] bg-[#f5f1e7]">

        <div className="pointer-events-none absolute left-[-80px] top-1/3 opacity-10">
          <WaveIcon className="h-40 w-80" />
        </div>

        <div className="mx-auto grid max-w-6xl gap-16 px-6 py-28 lg:grid-cols-2 lg:items-center">

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#58704e]">
              Under the hood
            </p>

            <h2 className="mt-4 text-4xl font-semibold tracking-tight">
              Play it differently.
              <span className="block text-[#606b58]">
                We still line it up.
              </span>
            </h2>

            <p className="mt-6 leading-7 text-[#606b58]">
              Toneffx uses pitch information to identify corresponding
              moments between two performances, then dynamically aligns them
              before comparing their spectral characteristics.
            </p>

            <p className="mt-4 leading-7 text-[#606b58]">
              That means you do not have to play every note at exactly the
              same millisecond as the reference.
            </p>
          </div>

          <div className="rounded-3xl border border-[#cdd5c2] bg-[#f8f5ec] p-8 shadow-sm">

            <div className="space-y-4 font-mono text-sm">
              <PipelineItem text="Reference audio + your recording" />
              <PipelineArrow />
              <PipelineItem text="Chroma feature extraction" />
              <PipelineArrow />
              <PipelineItem text="Dynamic Time Warping alignment" />
              <PipelineArrow />
              <PipelineItem text="Spectral comparison" />
              <PipelineArrow />
              <PipelineItem text="Tone similarity + adjustment" />
            </div>

          </div>
        </div>
      </section>

      {/* MATCH SCORE */}
      <section className="relative overflow-hidden border-t border-[#cdd5c2] bg-[#eee9db]">

        <div className="pointer-events-none absolute right-12 top-16 opacity-10">
          <KnobIcon className="h-52 w-52" />
        </div>

        <div className="mx-auto max-w-6xl px-6 py-28">

          <div className="grid gap-14 lg:grid-cols-2 lg:items-center">

            <div className="rounded-3xl border border-[#cdd5c2] bg-[#f8f5ec] p-10">
              <p className="text-xs uppercase tracking-[0.2em] text-[#58704e]">
                Example result
              </p>

              <div className="mt-6 flex items-end gap-3">
                <span className="text-7xl font-semibold">
                  82
                </span>
                <span className="mb-2 text-2xl text-[#606b58]">
                  %
                </span>
              </div>

              <div className="mt-7 h-2 overflow-hidden rounded-full bg-[#dce3d2]">
                <div className="h-full w-[82%] rounded-full bg-[#7e946d]" />
              </div>

              <div className="mt-8 rounded-xl border border-[#cdd5c2] bg-[#f8f5ec] p-5">
                <p className="text-xs uppercase tracking-[0.15em] text-[#606b58]">
                  Suggested adjustment
                </p>

                <div className="mt-3 flex items-center justify-between">
                  <span className="font-semibold">
                    Treble
                  </span>

                  <span className="font-mono text-lg">
                    50 → 55
                  </span>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#58704e]">
                Iterative matching
              </p>

              <h2 className="mt-4 text-4xl font-semibold tracking-tight">
                You might never hit 100%.
                <span className="block text-[#606b58]">
                  That is the point.
                </span>
              </h2>

              <p className="mt-6 leading-7 text-[#606b58]">
                Different guitars, pickups, amps, pedals, and recording setups
                mean some tones cannot be reproduced perfectly.
              </p>

              <p className="mt-4 leading-7 text-[#606b58]">
                The similarity score gives you a measurable way to see whether
                each adjustment is actually moving your sound closer.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ACCOUNT */}
      <section className="relative overflow-hidden border-t border-[#cdd5c2] bg-[#e5ebdc]">

        <div className="pointer-events-none absolute -right-24 bottom-10 opacity-[0.08]">
          <Image
            src="/guitar-sprite.png"
            alt=""
            width={650}
            height={260}
            className="w-96 rotate-12 opacity-40 mix-blend-multiply grayscale"
            />
        </div>

        <div className="mx-auto max-w-6xl px-6 py-32">

          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#58704e]">
                Optional account
              </p>

              <h2 className="mt-4 text-4xl font-semibold tracking-tight">
                Try it first.
                <span className="block text-[#606b58]">
                  Save your rig later.
                </span>
              </h2>

              <p className="mt-6 max-w-xl leading-7 text-[#606b58]">
                You do not need an account to use Toneffx. Creating one
                simply lets you save your rig configuration, available controls,
                and current settings so you do not have to rebuild your setup
                every time.
              </p>

              <div className="mt-8 space-y-4">
                <Benefit text="Save your available controls" />
                <Benefit text="Remember your current rig settings" />
                <Benefit text="Load your configuration when you return" />
              </div>
            </div>

            <div className="rounded-3xl border border-[#cdd5c2] bg-[#f8f5ec] p-8 shadow-sm sm:p-10">

              <p className="text-sm font-medium text-[#606b58]">
                Want to keep your setup?
              </p>

              <h3 className="mt-2 text-2xl font-semibold">
                Create a free account.
              </h3>

              <p className="mt-3 text-sm leading-6 text-[#606b58]">
                Save your rig for later, or skip the account entirely and
                start matching tones immediately.
              </p>

              <Link
                href="/signup"
                className="mt-8 block w-full rounded-xl bg-[#d4dfc6] px-5 py-3 text-center font-semibold text-[#303b2d] transition hover:scale-[1.01] hover:bg-[#c3d2b3]"
              >
                Create account
              </Link>

              <Link
                href="/tone"
                className="mt-3 block w-full rounded-xl border border-[#cdd5c2] bg-[#f8f5ec] px-5 py-3 text-center font-semibold text-[#606b58] transition hover:bg-[#e5ebdc] hover:text-[#303b2d]"
              >
                Continue without account
              </Link>

              <p className="mt-5 text-center text-xs text-[#606b58]">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-[#606b58] hover:text-[#303b2d]"
                >
                  Log in
                </Link>
              </p>

            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative overflow-hidden border-t border-[#cdd5c2] bg-[#f5f1e7]">

        <div className="absolute inset-0 bg-[#e5ebdc]/40" />

        <div className="relative z-10 mx-auto max-w-6xl px-6 py-32 text-center">

          <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Hear the difference.
            <span className="block text-[#606b58]">
              Measure the difference.
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-[#606b58]">
            Upload a reference and see how close your current setup can get.
          </p>

          <Link
            href="/tone"
            className="mt-9 inline-block rounded-xl bg-[#d4dfc6] px-7 py-3 font-semibold text-[#303b2d] transition hover:scale-[1.03]"
          >
            Open Toneffx
          </Link>

        </div>
      </section>

      <footer className="border-t border-[#cdd5c2] bg-[#f5f1e7] px-6 py-8 text-center text-sm text-[#606b58]">
        Toneffx
      </footer>

      {/* animations */}
      <style>{`
        @keyframes flyAcross {
          0% {
            transform: translateX(-25vw) translateY(0px) rotate(-15deg);
          }

          35% {
            transform: translateX(35vw) translateY(-30px) rotate(4deg);
          }

          70% {
            transform: translateX(80vw) translateY(20px) rotate(14deg);
          }

          100% {
            transform: translateX(130vw) translateY(-10px) rotate(24deg);
          }
        }

        @keyframes flyReverse {
          0% {
            transform: translateX(125vw) translateY(0px) rotate(16deg);
          }

          50% {
            transform: translateX(45vw) translateY(35px) rotate(-4deg);
          }

          100% {
            transform: translateX(-35vw) translateY(-20px) rotate(-20deg);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(-4deg);
          }

          50% {
            transform: translateY(-25px) rotate(5deg);
          }
        }

        .fly-across {
          animation-name: flyAcross;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }

        .fly-reverse {
          animation-name: flyReverse;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }

        .float-object {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>

    </main>
  );
}


function FlyingObjects() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">

      {/* guitar 1 */}
      <div
        className="fly-across absolute top-[16%] opacity-35 mix-blend-multiply grayscale"
        style={{
          animationDuration: "22s",
          animationDelay: "-4s",
        }}
      >
        <Image
          src="/guitar-sprite.png"
          alt=""
          width={650}
          height={260}
          className="w-[420px]"
          priority
        />
      </div>

      {/* guitar 2 */}
      <div
        className="fly-reverse absolute top-[67%] opacity-20 mix-blend-multiply grayscale"
        style={{
          animationDuration: "30s",
          animationDelay: "-12s",
        }}
      >
        <Image
          src="/guitar-sprite.png"
          alt=""
          width={650}
          height={260}
          className="w-[520px]"
        />
      </div>

      {/* smaller guitar */}
      <div
        className="fly-across absolute top-[43%] opacity-15 mix-blend-multiply grayscale"
        style={{
          animationDuration: "36s",
          animationDelay: "-20s",
        }}
      >
        <Image
          src="/guitar-sprite.png"
          alt=""
          width={650}
          height={260}
          className="w-[300px]"
        />
      </div>

      {/* floating pick */}
      <div className="float-object absolute right-[10%] top-[20%] opacity-20">
        <PickIcon className="h-20 w-20" />
      </div>

      {/* waveform */}
      <div className="float-object absolute bottom-[14%] left-[8%] opacity-15">
        <WaveIcon className="h-24 w-52" />
      </div>

      {/* knob */}
      <div
        className="float-object absolute bottom-[18%] right-[16%] opacity-15"
        style={{
          animationDelay: "-3s",
        }}
      >
        <KnobIcon className="h-20 w-20" />
      </div>
    </div>
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
    <div className="group rounded-2xl border border-[#cdd5c2] bg-[#f8f5ec] p-6 transition duration-300 hover:-translate-y-1 hover:border-[#a7b797] hover:bg-[#f0f2e7]">

      <p className="font-mono text-xs text-[#58704e]">
        {number}
      </p>

      <h3 className="mt-5 text-lg font-semibold">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-6 text-[#606b58]">
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

      <div className="h-2 w-2 rounded-full bg-[#7e946d]" />

      <p className="text-sm text-[#606b58]">
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
    <div className="rounded-xl border border-[#cdd5c2] bg-[#f8f5ec] px-5 py-4 text-[#606b58]">
      {text}
    </div>
  );
}


function PipelineArrow() {
  return (
    <div className="pl-5 text-[#58704e]">
      ↓
    </div>
  );
}


/* ---------------- */
/* DECORATIVE ICONS */
/* ---------------- */


function PickIcon({
  className,
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="currentColor"
    >
      <path
        d="M50 88
           C42 88 15 51 15 31
           C15 14 33 9 50 9
           C67 9 85 14 85 31
           C85 51 58 88 50 88Z"
      />
    </svg>
  );
}


function WaveIcon({
  className,
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 240 80"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="6"
      strokeLinecap="round"
    >
      <path d="M5 40 H25" />
      <path d="M35 30 V50" />
      <path d="M50 18 V62" />
      <path d="M65 5 V75" />
      <path d="M80 24 V56" />
      <path d="M95 33 V47" />
      <path d="M110 16 V64" />
      <path d="M125 8 V72" />
      <path d="M140 24 V56" />
      <path d="M155 34 V46" />
      <path d="M170 20 V60" />
      <path d="M185 8 V72" />
      <path d="M200 25 V55" />
      <path d="M215 34 V46" />
      <path d="M225 40 H238" />
    </svg>
  );
}


function KnobIcon({
  className,
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
    >
      <circle
        cx="50"
        cy="50"
        r="38"
        stroke="currentColor"
        strokeWidth="7"
      />

      <line
        x1="50"
        y1="50"
        x2="68"
        y2="28"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
      />
    </svg>
  );
}