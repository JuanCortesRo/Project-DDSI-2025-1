import { useState, useEffect } from "react"
import { ticketService } from "../../services/api"
import { useParams } from "react-router-dom"

const TicketStatus = () => {

    const {ticketId} = useParams()
    const [ticket, setTicket] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [allTickets, setAllTickets] = useState([])

    useEffect (() => {
      let firstLoad = true;
        const fetchTicket = async () => {
           if (firstLoad) setLoading(true);

            try {
                const response = await ticketService.getById(ticketId)
                setTicket(response.data)
                const allResponse = await ticketService.getAllTickets()
                setAllTickets(allResponse.data);
            } catch (err) {
                setError("El ticket no existe o no se pudo cargar")
                console.error(err)
            } finally {
                if (firstLoad) {
                    setLoading(false);
                    firstLoad = false;
                }
            }
        };

        fetchTicket();
        const interval = setInterval(fetchTicket, 5000); // cada 5 segundos
         return () => clearInterval(interval);

    }, [ticketId])
    ; 
    
    const Spinner = () => (
    <div className="spinner-container">
    <div className="spinner"></div>
    </div>);


    const statusLabels = {
        open: 'En espera de atención',
        in_progress: 'En proceso',
        closed: 'Finalizado',
    };

    if (loading) {
        return <Spinner/>;
    }

    if (error) {
        return <p className="error">{error}</p>
    }

return (
  <div className="ticket-status">
    <div className="tickets-box-1">
      <h1>Ticket {ticket.id_ticket}</h1>
      <p>
        <h3><strong>Estado:</strong></h3>{" "}
        <span className={`status-${ticket.status}`}>
          {statusLabels[ticket.status]}
        </span>
      </p>
      <p>
        <h3><strong>Punto de Atención:</strong></h3> {ticket.punto_atencion}
      </p>
    </div>

    <div className="tickets-box-2">
      <h3>Estado de Tickets</h3>
      <ul className="tickets-lists">
        {allTickets.map((t) => (
          <li key={t.id_ticket}>
            <strong>Ticket {t.id_ticket}:</strong>{" "}
            <span className={`status-${t.status}`}>
              {statusLabels[t.status]}
            </span>{" "}
            - Punto de atención {t.punto_atencion}
          </li>
        ))}
      </ul>
    </div>
  </div>
)
}
export default TicketStatus;
