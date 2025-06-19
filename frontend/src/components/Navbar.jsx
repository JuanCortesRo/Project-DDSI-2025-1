"use client"

import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useState } from "react"

const Navbar = () => {
  const { isAuthenticated, logout, user } = useAuth()
  const [infoOpen, setInfoOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
  }

  const toggleDropdown = () => {
    setInfoOpen(!infoOpen)
  }

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        Sistema de Usuarios
      </Link>

      {isAuthenticated ? (
        <div className="navbar-links">
          <Link to="/dashboard">Dashboard</Link>
          {user?.role !== "CLIENTE" && <Link to="/">Manejo de Tickets</Link>}
          {(user?.role === "ADMINISTRADOR" || user?.role !== "CLIENTE") && (
            <div className="dropdown" style={{ position: "relative" }}>
              <button onClick={toggleDropdown} className="btn btn-secondary">
                Información ▾
              </button>
              {infoOpen && (
                <div
                  className="dropdown-menu"
                  style={{
                    position: "absolute",
                    backgroundColor: "#2d2f43",
                    top: "100%",
                    left: 0,
                    zIndex: 10,
                    borderRadius: "0.5rem",
                    padding: "0.5rem",
                  }}
                >
                  {user?.role === "ADMINISTRADOR" && (
                    <Link className="dropdown-item" to="/users" style={{ display: "block", color: "white", margin: "0.2rem 0" }}>
                      Lista Usuarios
                    </Link>

                  )}

                  {user?.role === "ADMINISTRADOR" && (
                    <Link className="dropdown-item" to="/puntos" style={{ display: "block", color: "white", margin: "0.2rem 0" }}>
                      Lista Puntos de atencion
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}

          <button onClick={handleLogout} className="btn btn-secondary">
            Cerrar Sesión
          </button>
        </div>
      ) : (
        <div className="navbar-links">
          <Link to="/login">Iniciar Sesión</Link>
        </div>
      )}
    </nav>
  )
}

export default Navbar