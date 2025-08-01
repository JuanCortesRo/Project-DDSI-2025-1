"use client"

import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, loading, user } = useAuth()

  if (loading) {
    return <div>Cargando...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  // Check role-based access if roles are specified
  if (allowedRoles.length > 0 && user?.role) {
    if (!allowedRoles.includes(user.role)) {
      return <Navigate to="/unauthorized" />
    }
  }

  return children
}

export default ProtectedRoute