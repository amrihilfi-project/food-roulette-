import { useState, useEffect, useRef } from 'react';
import { supabase } from './lib/supabase';
import Roulette from './components/Roulette';
import Manager from './components/Manager';

function App() {
  const [activeTab, setActiveTab] = useState('roulette');
  const [restaurants, setRestaurants] = useState([]);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // Fetch initial data
    const fetchRestaurants = async () => {
      const { data, error } = await supabase.from('restaurants').select('*');
      if (error) {
        console.error('Error fetching restaurants:', error);
      } else {
        setRestaurants(data || []);
      }
      setLoading(false);
    };

    fetchRestaurants();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('public:restaurants')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'restaurants' }, handleRealtimeChange)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleRealtimeChange = (payload) => {
    if (payload.eventType === 'INSERT') {
      setRestaurants((prev) => [...prev, payload.new]);
    } else if (payload.eventType === 'UPDATE') {
      setRestaurants((prev) =>
        prev.map((r) => (r.id === payload.new.id ? payload.new : r))
      );
    } else if (payload.eventType === 'DELETE') {
      setRestaurants((prev) => prev.filter((r) => r.id !== payload.old.id));
    }
  };

  const signInWithGithub = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) console.error('Error logging in:', error);
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error logging out:', error);
  };

  return (
    <>
      <header className="header" id="header">
        <div className="header__inner">
          <span className="header__icon" aria-hidden="true">🍜</span>
          <h1 className="header__title">Food Roulette</h1>
          <p className="header__subtitle">Let fate pick your lunch</p>
        </div>

        <nav className="tabs" id="tabs" aria-label="Main navigation">
          <button
            className={`tabs__btn ${activeTab === 'roulette' ? 'tabs__btn--active' : ''}`}
            onClick={() => setActiveTab('roulette')}
            type="button"
          >
            🎰 Play Roulette
          </button>
          <button
            className={`tabs__btn ${activeTab === 'manager' ? 'tabs__btn--active' : ''}`}
            onClick={() => setActiveTab('manager')}
            type="button"
          >
            📋 Manage
          </button>
        </nav>
      </header>

      <main className="main" id="main">
        {loading ? (
          <div style={{ color: 'var(--clr-text-muted)', marginTop: '2rem' }}>Loading restaurant data...</div>
        ) : (
          <>
            <div className={`view ${activeTab === 'roulette' ? 'view--active' : ''}`} id="view-roulette">
              {activeTab === 'roulette' && (
                <Roulette restaurants={restaurants} />
              )}
            </div>

            <div className={`view ${activeTab === 'manager' ? 'view--active' : ''}`} id="view-manager">
              {activeTab === 'manager' && (
                <Manager
                  restaurants={restaurants}
                  session={session}
                  onSignIn={signInWithGithub}
                  onSignOut={signOut}
                />
              )}
            </div>
          </>
        )}
      </main>

      <footer className="footer" id="footer">
        <p>Made with 🍕 for the team &mdash; Food Roulette &copy; {(new Date()).getFullYear()}</p>
      </footer>
    </>
  );
}

export default App;
