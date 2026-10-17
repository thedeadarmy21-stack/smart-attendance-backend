import { Link, useLocation, useNavigate } from 'react-router-dom';

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const adminData = JSON.parse(localStorage.getItem('adminData') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    navigate('/');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'Students', path: '/students', icon: '👨‍🎓' },
    { name: 'Add Student', path: '/add-student', icon: '➕' },
    { name: 'Reports', path: '/reports', icon: '📑' },
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      {/* PREMIUM DARK SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-2xl z-20">
        <div className="h-20 flex items-center px-6 border-b border-slate-800 bg-slate-950">
          <h1 className="text-xl font-extrabold tracking-wide flex items-center gap-2">
            <span className="text-2xl">🎓</span> Smart Admin
          </h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 mt-4">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-300 ${
                location.pathname === item.path
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-semibold translate-x-1'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-5 border-t border-slate-800 bg-slate-950">
          <div className="mb-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold border border-blue-500/30">
              {adminData.name?.charAt(0) || 'A'}
            </div>
            <div>
              <p className="text-sm font-bold text-white">{adminData.name || 'Admin'}</p>
              <p className="text-xs text-slate-400">{adminData.schoolName || 'School'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-center px-4 py-2.5 text-red-400 bg-red-400/10 rounded-xl hover:bg-red-500 hover:text-white transition-all duration-300 text-sm font-bold"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto relative">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center px-8 sticky top-0 z-10">
          <h2 className="text-xl font-bold text-slate-800 capitalize tracking-tight">
            {location.pathname.replace('/', '').replace('-', ' ')}
          </h2>
        </header>
        <div className="p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
};

export default Layout;