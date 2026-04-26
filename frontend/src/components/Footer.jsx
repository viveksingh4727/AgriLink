import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="mt-auto border-t border-surface-200/80 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-brand-400 text-lg font-bold text-white shadow-sm">
                🌾
              </div>
              <div>
                <p className="text-lg font-bold text-surface-900">AgriLink AI</p>
                <p className="text-xs text-surface-500">Smart Agriculture Marketplace</p>
              </div>
            </div>
            <p className="text-sm text-surface-500 max-w-md leading-relaxed">
              Connecting farmers directly to buyers with AI-powered pricing, weather insights, and seamless crop trading across India.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-surface-900 mb-4 uppercase tracking-wider">Platform</h4>
            <div className="space-y-3">
              <Link to="/marketplace" className="block text-sm text-surface-500 hover:text-brand transition-colors">Marketplace</Link>
              <Link to="/weather" className="block text-sm text-surface-500 hover:text-brand transition-colors">Weather</Link>
              <Link to="/register" className="block text-sm text-surface-500 hover:text-brand transition-colors">Get Started</Link>
            </div>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-sm font-bold text-surface-900 mb-4 uppercase tracking-wider">Features</h4>
            <div className="space-y-3">
              <p className="text-sm text-surface-500">🤖 AI Price Suggestions</p>
              <p className="text-sm text-surface-500">🌤️ Weather Forecasts</p>
              <p className="text-sm text-surface-500">📊 Market Analytics</p>
              <p className="text-sm text-surface-500">💚 Farmer Wellbeing</p>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-surface-200 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-surface-400">
            © {new Date().getFullYear()} AgriLink AI. Built for Indian farmers and buyers.
          </p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-xs text-surface-400">
              <span className="h-2 w-2 rounded-full bg-brand animate-pulse" />
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
