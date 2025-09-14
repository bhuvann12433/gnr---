import ModelBackground from './ModelBackground';
import React, { useState } from 'react';
import { Package, Snowflake } from 'lucide-react';

interface LoginPageProps {
  onLogin: (username: string, password: string) => Promise<{ ok: boolean; message?: string }>;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const showDebug = (text: string) => {
    const el =
      document.getElementById('fetchDebug') ||
      ((): HTMLElement => {
        const d = document.createElement('div');
        d.id = 'fetchDebug';
        d.style.position = 'fixed';
        d.style.bottom = '12px';
        d.style.left = '12px';
        d.style.right = '12px';
        d.style.zIndex = '99999';
        d.style.background = 'linear-gradient(90deg, rgba(220,38,38,0.95), rgba(185,28,28,0.95))';
        d.style.color = 'white';
        d.style.padding = '12px';
        d.style.borderRadius = '10px';
        d.style.fontSize = '13px';
        d.style.boxShadow = '0 10px 30px rgba(0,0,0,0.22)';
        d.style.wordBreak = 'break-word';
        d.style.maxHeight = '30vh';
        d.style.overflow = 'auto';
        document.body.appendChild(d);
        return d;
      })();
    el.textContent = text;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await onLogin(username.trim(), password);
      if (!result.ok) {
        setError(result.message || 'Invalid credentials');
        setIsLoading(false);
        return;
      }
      // success — App will update isLoggedIn
    } catch (err: any) {
      // show friendly UI error
      setError('Unable to connect. Try again.');
      console.error('Login error', err);

      // show raw debug message on screen (useful for phone)
      try {
        const msg =
          (err && err.message) ||
          (typeof err === 'string' ? err : JSON.stringify(err, Object.getOwnPropertyNames(err)));
        showDebug(`Login fetch error: ${msg}`);
        // optional beacon to server-side logging endpoint (if you add one)
        if (navigator.sendBeacon) {
          try {
            navigator.sendBeacon('/api/log-client', JSON.stringify({ err: String(msg), at: new Date().toISOString() }));
          } catch (_) {}
        }
      } catch (e2) {
        // ignore
      }
    } finally {
      setIsLoading(false);
    }
  };

  // generate decorative snowflakes (same as yours)
  const snowflakes = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    animationDelay: Math.random() * 3,
    animationDuration: 3 + Math.random() * 2,
    opacity: 0.3 + Math.random() * 0.7,
    size: 0.5 + Math.random() * 1.5
  }));

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* 3D GLB background (absolute, z-0) */}
      <ModelBackground />

      {/* optional ember overlay + subtle glow (above model, below snowflakes & form) */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background:
            'radial-gradient(circle at 10% 10%, rgba(255,166,77,0.02), transparent 8%), radial-gradient(circle at 90% 90%, rgba(255,100,50,0.02), transparent 8%)'
        }}
        aria-hidden="true"
      />

      {/* snowflakes (above background, below form) */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {snowflakes.map((flake) => (
          <div
            key={flake.id}
            className="absolute text-blue-200 animate-bounce"
            style={{
              left: `${flake.left}%`,
              animationDelay: `${flake.animationDelay}s`,
              animationDuration: `${flake.animationDuration}s`,
              opacity: flake.opacity,
              fontSize: `${flake.size}rem`,
              top: '-10px'
            }}
          >
            <Snowflake className="animate-spin" style={{ animationDuration: '4s' }} />
          </div>
        ))}
      </div>

      {/* actual form content sits above everything */}
      <div className="relative z-20 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="backdrop-blur-lg bg-white/30 rounded-2xl shadow-2xl border border-white/20 p-8 transform transition-all duration-300 hover:scale-105">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-full mb-4 backdrop-blur-sm">
                <Package className="h-8 w-8 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Gnr Surgicals</h1>
              <p className="text-gray-600">Inventory Management System</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-white/50 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-200 placeholder-gray-500"
                  placeholder="Enter your username"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/50 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-200 placeholder-gray-500"
                  placeholder="Enter your password"
                  required
                />
              </div>

              {error && <div className="text-sm text-red-600">{error}</div>}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                    Signing In...
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">Secure access to your inventory management system</p>
            </div>
          </div>

          <div className="mt-4 text-center">
            <div className="inline-block bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/30">
              <div className="text-xs text-gray-600">Demo: admin / password (or use your own)</div>
            </div>
          </div>
        </div>
      </div>

      {/* soft decorative blobs */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-blue-200/20 rounded-full blur-xl z-0" />
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-blue-300/20 rounded-full blur-2xl z-0" />
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/30 rounded-full blur-lg z-0" />
    </div>
  );
};

export default LoginPage;
