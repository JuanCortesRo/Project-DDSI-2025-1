"use client"
import { useState, useEffect } from "react";
import AttentionPointsGrid from "./AttentionPointsGrid";
import { ticketService } from "../services/api"; 

const TicketManagement = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTickets = async () => {
    try {
      const response = await ticketService.getAll(); 
      setTickets(response.data);
      setError("");
    } catch (err) {
      setError("Error al cargar los tickets");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleDragStart = (e, ticket) => {
    e.dataTransfer.setData("ticketId", ticket.id_ticket);
  };

  const handleTicketAssigned = (ticketId) => {
    setTickets(prev => prev.filter(ticket => ticket.id_ticket !== ticketId));
  };

  if (loading) {
    return <div>Cargando tickets...</div>;
  }

  return (
    <div className="ticket-management-container">
      {/* Panel izquierdo: Puntos de atención */}
      <div className="attention-points-panel">
        <div className="attention-points-header">
          <h3>Puntos de Atención</h3>
        </div>
        <AttentionPointsGrid onTicketAssigned={handleTicketAssigned}/>
      </div>

      {/* Panel derecho: Lista de tickets */}
      <div className="tickets-panel">
        <h3>Tickets</h3>
        {error && <div className="alert alert-danger">{error}</div>}
        {tickets.length > 0 ? (
          <ul className="tickets-list">
            {tickets.map((ticket, idx) => (
              <li 
                key={ticket.id_ticket}
                className={`ticket-item${idx === 0 ? " ticket-head" : ""}`}
                draggable={idx === 0}
                onDragStart={idx === 0 ? (e) => handleDragStart(e, ticket) : undefined}
              >
                Ticket {ticket.id_ticket} - {ticket.status}
              </li>
            ))}
          </ul>
        ) : (
          <p>No hay tickets por el momento.</p>
        )}
      </div>
    </div>
  );
};

export default TicketManagement;