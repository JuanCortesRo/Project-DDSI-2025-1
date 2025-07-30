import { useState, useEffect } from "react"
import { ticketService } from "../../services/api"
import { useParams } from "react-router-dom"

const TicketStatus = () => {

    const {ticketId} = useParams()
    const [ticket, setTicket] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect (() => {
        const fetchTicket = async () => {

            try {
                const response = await ticketService.getById(ticketId)
                setTicket(response.data)
            } catch (err) {
                setError("El ticket no existe o no se pudo cargar")
                console.error(err)
            } finally {
                setLoading(false)
            }
        };

        fetchTicket();
    }, [ticketId]); 

    if (loading) {
        return <p>Cargando...</p>
    }

    if (error) {
        return <p className="error">{error}</p>
    }

    return (
        <div className="ticket-status">
            {loading ? (
                <p>Cargando ticket...</p>
            ) : error ? (
                <p className="error">{error}</p>
            ) : (
                <div>
                    <h2>Estado del Ticket #{ticket.id}</h2>
                    <p><strong>Estado:</strong> {ticket.status}</p>
                    <p><strong>Punto de Atención:</strong> {ticket.attention_point ? ticket.attention_point.name : "No asignado"}</p>
                </div>
            )}
        </div>
    )
}
export default TicketStatus;
