
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet
} from "react-router-dom";

import { useState } from "react";

import { AuthProvider, useAuth } from "./context/AuthContext";

import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import AddLead from "./pages/AddLead";
import Campaigns from "./pages/Campaigns";
import Calls from "./pages/Calls";
import CallDetails from "./pages/CallDetails";
import Team from "./pages/Team";
import Settings from "./pages/Settings";
import Handoff from "./pages/Handoff";
import Analytics from "./pages/Analytics";
import ImportLeads from "./pages/ImportLeads";
import EditLead from "./pages/EditLead";
const AppLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-layout">

      <Sidebar
        mobileOpen={mobileOpen}
        closeMobile={() => setMobileOpen(false)}
      />

      <div className="main-area">

        <Navbar
          openSidebar={() => setMobileOpen(true)}
        />

        <main className="main-content">
          <Outlet />
        </main>

      </div>
    </div>
  );
};

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="route-loader">Loading...</div>;
  }

  return (
    <Routes>

      <Route
        path="/"
        element={
          <Navigate
            to={user ? "/dashboard" : "/login"}
            replace
          />
        }
      />

      <Route
        path="/login"
        element={
          user
            ? <Navigate to="/dashboard" replace />
            : <Login />
        }
      />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>

          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/leads" element={<Leads />} />
          <Route path="/leads/add" element={<AddLead />} />

          <Route path="/campaigns" element={<Campaigns />} />

          <Route path="/calls" element={<Calls />} />
          <Route path="/calls/:id" element={<CallDetails />} />

          <Route path="/handoff" element={<Handoff />} />
          <Route path="/analytics" element={<Analytics />} />

          <Route path="/team" element={<Team />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/leads/import" element={<ImportLeads />} />
          <Route path="/leads/:id/edit" element={<EditLead />} />
        </Route>
      </Route>

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />

    </Routes>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
