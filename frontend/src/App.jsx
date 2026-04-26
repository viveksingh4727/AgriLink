import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import ChatAssistant from "./components/ChatAssistant";
import Footer from "./components/Footer";
import { useAuth } from "./context/AuthContext";
import BuyerDashboard from "./pages/BuyerDashboard";
import FarmerDashboard from "./pages/FarmerDashboard";
import ListingDetail from "./pages/ListingDetail";
import Login from "./pages/Login";
import Marketplace from "./pages/Marketplace";
import MyListings from "./pages/MyListings";
import MyOrders from "./pages/MyOrders";
import Register from "./pages/Register";
import WeatherDashboard from "./pages/WeatherDashboard";
import Profile from "./pages/Profile";

const FullPageSpinner = () => (
  <div className="flex min-h-[60vh] items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <span className="spinner h-10 w-10" />
      <p className="text-sm text-surface-400 font-medium">Loading...</p>
    </div>
  </div>
);

const RequireAuth = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) return <FullPageSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={user.role === "farmer" ? "/farmer" : "/buyer"} replace />;
  return children;
};

const PublicOnly = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <FullPageSpinner />;
  if (user) return <Navigate to={user.role === "farmer" ? "/farmer" : "/buyer"} replace />;
  return children;
};

const App = () => {
  return (
    <div className="min-h-screen flex flex-col bg-surface-50">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
        <Routes>
          <Route path="/" element={<Navigate to="/marketplace" replace />} />
          <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
          <Route path="/register" element={<PublicOnly><Register /></PublicOnly>} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/listings/:id" element={<ListingDetail />} />
          <Route path="/weather" element={<WeatherDashboard />} />
          <Route path="/farmer" element={<RequireAuth role="farmer"><FarmerDashboard /></RequireAuth>} />
          <Route path="/buyer" element={<RequireAuth role="buyer"><BuyerDashboard /></RequireAuth>} />
          <Route path="/my-listings" element={<RequireAuth role="farmer"><MyListings /></RequireAuth>} />
          <Route path="/my-orders" element={<RequireAuth role="buyer"><MyOrders /></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
        </Routes>
      </main>
      <ChatAssistant />
      <Footer />
    </div>
  );
};

export default App;
