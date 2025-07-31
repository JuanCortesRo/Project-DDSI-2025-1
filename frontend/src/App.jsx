import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom"
import Login from "./components/Login"
import Dashboard from "./components/Dashboard"
import UserList from "./components/UserList"
import UserForm from "./components/UserForm"
import TicketManagement from "./components/TicketManagement"
import Navbar from "./components/Navbar"
import { AuthProvider } from "./context/AuthContext"
import ProtectedRoute from "./components/ProtectedRoute"
import NormalTicketRequest from "./components/ticket-sections/NormalTicketRequest"
import RegisterTicketRequest from "./components/ticket-sections/RegisterTicketRequest"
import TicketStatus from "./components/ticket-sections/TicketStatus"
import AttentionPointList from "./components/AttentionPointList"
import PublicityList from "./components/PublicityList";
import PublicityForm from "./components/PublicityForm";


function AppContent() {
  const location = useLocation()
  const hideNavbar = location.pathname === "/login" || location.pathname === "/ticket-req" || location.pathname === "/ticket-req/new-user" || location.pathname === "/ticket-status"

  return (
    <div className="app-container">
      {!hideNavbar && <Navbar />}
      <div className="content">
        <Routes>
          <Route path="/ticket-status" element={<TicketStatus />} />
          <Route path="/login" element={<Login />} />
          <Route path="/ticket-req" element={<NormalTicketRequest />} />
          <Route path="/ticket-req/new-user" element={<RegisterTicketRequest />} />
          
          <Route
            path="/"
             element={
              <ProtectedRoute>
                <TicketManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tickets"
            element={
              <ProtectedRoute>
                <TicketManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <UserList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users/new"
            element={
              <ProtectedRoute>
                <UserForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users/edit/:id"
            element={
              <ProtectedRoute>
                <UserForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/attention-points"
            element={
              <ProtectedRoute>
                <AttentionPointList />
              </ProtectedRoute>
            }
          />
          <Route path="/publicity" 
          element={
          <PublicityList />
          } 
          />
          <Route path="/publicity/create" 
          element={
          <PublicityForm />
          } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  )
}

export default App