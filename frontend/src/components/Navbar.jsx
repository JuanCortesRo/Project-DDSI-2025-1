
"use client"

import { Link, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useState, useEffect, useRef } from "react"
import { FiLogOut } from "react-icons/fi"

const Navbar = () => {
  const { isAuthenticated, logout, user } = useAuth()
  const [infoOpen, setInfoOpen] = useState(false)
  const dropdownRef = useRef(null)
  const location = useLocation()

  useEffect(() => {
    setInfoOpen(false)
  }, [location.pathname])

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setInfoOpen(false)
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [dropdownRef])
  
  const handleLogout = async () => {
    await logout()
  }

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <img src="/brand.png" alt="Qline" style={{ height: "55px", verticalAlign: "middle" }} />
      </Link>

      {isAuthenticated ? (
        <div className="navbar-links">
          
          <Link to="/dashboard">Dashboard</Link>

          {user?.role !== "CLIENTE" && <Link to="/">Gestion de tickets</Link>}

          <div className="dropdown" ref={dropdownRef}>
            <span
              className="navbar-link dropdown-toggle"
              onClick={() => setInfoOpen(!infoOpen)}
              tabIndex={0}
              style={{ cursor: "pointer" }}
            >
              Listas ▾
            </span>
            <div className={`dropdown-menu${infoOpen ? " open" : ""}`}>
              {user?.role === "ADMINISTRADOR" && [
                { to: "/users", text: "Usuarios" },
                { to: "/attention-points", text: "Puntos de atención" },
                { to: "/publicity", text: "Publicidad" },
                { to: "/ticket-req", text: "test" }
              ].map((item, index) => (
                <Link key={index} className="dropdown-item" to={item.to}>
                  {item.text}
                </Link>
              ))}
            </div>
          </div>

          <button onClick={handleLogout} className="btn btn-tertiary logout-btn" title="Cerrar sesión">
            <FiLogOut size={32} style={{ margin: " 0 0.5rem 0 0.5rem" }} />
            <span className="logout-text">Cerrar sesión</span>
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
