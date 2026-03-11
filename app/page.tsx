import Link from 'next/link';
import {
  BookOpen,
  BarChart2,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="border-b border-border/50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold text-foreground">
              Trading Journal
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors px-4 py-2"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-sm text-primary mb-6">
          <ShieldCheck className="h-4 w-4" />
          Built for disciplined day traders
        </div>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-br from-foreground via-foreground/90 to-foreground/60 bg-clip-text text-transparent">
          Master Your Trading
          <br />
          Psychology
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          The professional trading journal that goes beyond P&amp;L. Track
          every trade, analyse your rule adherence, understand your psychology,
          and build the discipline that separates consistent traders.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/signup"
            className="flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-md text-base font-medium hover:bg-primary/90 transition-colors"
          >
            Start Journaling
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/login"
            className="flex items-center gap-2 border border-border text-foreground px-8 py-3 rounded-md text-base font-medium hover:bg-accent transition-colors"
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Detailed Trade Logging</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Log every detail — entry/exit prices, setup pattern, market
              session, emotional state, and chart screenshots. Never forget
              what you were thinking.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="bg-green-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <BarChart2 className="h-6 w-6 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Performance Analytics</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Visual equity curve, win rate, average R:R, and total P&amp;L at
              a glance. Understand exactly how your account is growing (or
              shrinking) over time.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="bg-amber-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <ShieldCheck className="h-6 w-6 text-amber-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Rule Adherence Tracking</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              The most important metric most traders ignore. Track whether you
              followed your rules on every trade and see the direct correlation
              with profitability.
            </p>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-t border-border/50 bg-card/30">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-1">30+</div>
              <div className="text-sm text-muted-foreground">
                Fields per trade
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-400 mb-1">
                Real-time
              </div>
              <div className="text-sm text-muted-foreground">
                Equity curve updates
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-amber-400 mb-1">100%</div>
              <div className="text-sm text-muted-foreground">
                Your data, secured
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-foreground mb-1">Free</div>
              <div className="text-sm text-muted-foreground">
                To get started
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <TrendingUp className="h-4 w-4" />
            Trading Journal
          </div>
          <p className="text-xs text-muted-foreground">
            Built for traders who take their craft seriously.
          </p>
        </div>
      </footer>
    </div>
  );
}
