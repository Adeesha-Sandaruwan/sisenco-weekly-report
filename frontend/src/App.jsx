import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import { AuthProvider } from './context/AuthProvider';
import { useContext } from 'react';
import Auth from './pages/Auth';
import Layout from './components/Layout';
import MemberDashboard from './pages/MemberDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import Projects from './pages/Projects'; // Added import

const PrivateRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  return user ? <Layout>{children}</Layout> : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Auth />} />
          <Route path="/register" element={<Auth />} />

          <Route
            path="/"
            element={
              <PrivateRoute>
                <RoleAwareHome />
              </PrivateRoute>
            }
          />
          <Route path="/reports/all" element={<PrivateRoute><ManagerDashboard /></PrivateRoute>} />
          <Route path="/projects" element={<PrivateRoute><Projects /></PrivateRoute>} /> 
          
        </Routes>
      </AuthProvider>
    </Router>
  );
}

const RoleAwareHome = () => {
  const { user } = useContext(AuthContext);
  return user?.role === 'MANAGER' ? <Navigate to="/reports/all" replace /> : <MemberDashboard />;
};

export default App;