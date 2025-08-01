"use client"

import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useTicketRequest } from "./UseTicketRequest"
import { userService } from "../../services/api"


const RegisterTicketRequest = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const searchParams = new URLSearchParams(location.search)
    const dniFromQuery = searchParams.get("dni") || ""

    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        dni: dniFromQuery,
        phone_number: "",
        prioridad: false,
        role: "CLIENTE", 
    })

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [ticketInfo, setTicketInfo] = useState(null)
    const { pedirTicket, error: ticketError } = useTicketRequest()

    const isDniDisabled = !!dniFromQuery

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }))
    }

    const validateForm = () => {
        if (!formData.email) return "El email es obligatorio"
        return null
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")

        const validationError = validateForm()
        if (validationError) {
            setError(validationError)
            return
        }

        setLoading(true)

        try {
            const dataToSubmit = { ...formData }
            await userService.create(dataToSubmit)
            
            // Pedir ticket automáticamente después de registrar
            const result = await pedirTicket({
                dni: dataToSubmit.dni,
                prioridad: dataToSubmit.prioridad,
            })
            
            if (result && result.status === "success") {
                setTicketInfo({
                    nombre: result.user.first_name,
                    apellido: result.user.last_name,
                    prioridad: result.ticket.priority,
                    id_ticket: result.ticket.id_ticket,
                    email: result.user.email,
                })
            } else {
                setError(ticketError || "Error al pedir el ticket")
            }
        } catch (err) {
            let errorMessage = "Error al guardar el usuario"
            if (err.response && err.response.data) {
                const apiErrors = err.response.data
                if (typeof apiErrors === "object") {
                    const firstError = Object.values(apiErrors)[0]
                    if (Array.isArray(firstError) && firstError.length > 0) {
                        errorMessage = firstError[0]
                    } else if (typeof firstError === "string") {
                        errorMessage = firstError
                    }
                }
            }
            setError(errorMessage)
            console.error(err)
        } finally {
            setLoading(false)
        }
    }


    const handleCancel = () => {
        navigate("/ticket-req")
    }

    const handleUnderstood = () => {
        navigate("/ticket-req")
    }

    return (
        <div className="form-container">
            <h2 className="form-title">Registro</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            
            {ticketInfo ? (
                <div className="ticket-success-message">
                    <p>
                        ¡Registro exitoso! Bienvenido <strong>{ticketInfo.nombre} {ticketInfo.apellido}</strong>, se ha solicitado un ticket<strong>{ticketInfo.prioridad === "high" ? " prioritario" : ""}</strong>.
                    </p>
                    <p>
                        <strong>ID de su ticket:</strong> {ticketInfo.id_ticket}
                    </p>
                    <p>
                        Puede realizar seguimiento de la cola de tickets ingresando al correo que le fue enviado{ticketInfo.email ? ` (${ticketInfo.email})` : ""}.
                    </p>
                    <div className="form-actions">
                        <button className="btn btn-primary" onClick={handleUnderstood}>
                            Entendido
                        </button>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="first_name">Nombre</label>
                            <input
                            type="text"
                            id="first_name"
                            name="first_name"
                            className="form-control"
                            value={formData.first_name}
                            onChange={handleChange}
                            disabled={loading}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="last_name">Apellido</label>
                            <input
                            type="text"
                            id="last_name"
                            name="last_name"
                            className="form-control"
                            value={formData.last_name}
                            onChange={handleChange}
                            disabled={loading}
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            className="form-control"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={loading}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="phone_number">Teléfono</label>
                        <input
                            type="number"
                            id="phone_number"
                            name="phone_number"
                            className="form-control"
                            value={formData.phone_number}
                            onChange={handleChange}
                            disabled={loading}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="dni">Cedula</label>
                        <input
                            type="number"
                            id="dni"
                            name="dni"
                            className="form-control"
                            value={formData.dni}
                            onChange={handleChange}
                            disabled={isDniDisabled || loading}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="prioridad">
                            ¿Tiene alguna discapacidad?
                        </label>
                        <input
                            type="checkbox"
                            className="big-checkbox"
                            id="prioridad"
                            name="prioridad"
                            checked={formData.prioridad}
                            onChange={handleChange}
                            disabled={loading}
                        />
                    </div>
                    <div className="form-actions">
                        <button className="btn btn-secondary" onClick={handleCancel}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? "Guardando..." : "Registrarme y Pedir ticket"}
                        </button>
                    </div>
                </form>
            )}
        </div>
    )
}

export default RegisterTicketRequest
