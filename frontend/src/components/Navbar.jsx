import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="navbar-brand">
          <span className="brand-mark">P</span>
          Pipeline
        </div>
        {user && (
          <div className="navbar-right">
            <span className="navbar-user">
              Signed in as <strong>{user.name}</strong>
            </span>
            <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
              Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
