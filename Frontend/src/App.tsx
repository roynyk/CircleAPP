import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Home from "./pages/Home/Home";
import Profile from "./pages/Profile/Profile";
import Search from "./pages/Search/Search";
import DetailThread from "./pages/DetailThread/DetailThread";
import { Provider, useSelector } from "react-redux";
import { store, RootState } from "./redux/store";
import { Toaster } from "@/components/ui/sonner";

//Hanya izinkan masuk jika sudah terautentikasi (login)
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  );
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

//Jika sudah login tidak bolehkan masuk ke Login/Register
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  );
  return isAuthenticated ? <Navigate to="/home" replace /> : <>{children}</>;
};

function App() {
  return (
    <Provider store={store}>
      <Toaster richColors position="bottom-right" />
      <Router>
        <Routes>
          {/* Halaman Publik (khusus guest/belum login) */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          {/* Halaman Terproteksi */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/thread/:id"
            element={
              <ProtectedRoute>
                <DetailThread />
              </ProtectedRoute>
            }
          />
          <Route
            path="/search"
            element={
              <ProtectedRoute>
                <Search />
              </ProtectedRoute>
            }
          />

          {/* Halaman Default (Redirect ke login) */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;
