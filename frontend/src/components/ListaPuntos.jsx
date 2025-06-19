// app/components/ListaPuntos.jsx
"use client"

import { useEffect, useState } from "react"
import { attentionPointService } from "../services/api"

const ListaPuntos = () => {
  const [puntos, setPuntos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await attentionPointService.getAll()
        setPuntos(response.data)
      } catch (err) {
        console.error(err)
        setError("Error al cargar los puntos de atención")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) return <div>Cargando...</div>
  if (error) return <div className="alert alert-danger">{error}</div>

  return (
    <div className="container">
      <div
        className="header-section"
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}
      >
        <h2 style={{ color: "black" }}>Lista Puntos de Atención</h2>
        <button className="btn btn-primary">
          Nuevo punto de atención
        </button>
      </div>

      <table className="table table-dark table-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Disponibilidad</th>
          </tr>
        </thead>
        <tbody>
          {puntos.map((punto) => (
            <tr key={punto.attention_point_id}>
              <td>{punto.attention_point_id}</td>
              <td>{punto.availability ? "Disponible" : "Ocupado"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ListaPuntos