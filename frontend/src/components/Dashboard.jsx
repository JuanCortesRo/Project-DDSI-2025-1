"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { statisticsService, attentionPointService } from "../services/api"
import { useAuth } from "../context/AuthContext"

const Dashboard = () => {
  const [dashboardStats, setDashboardStats] = useState(null)
  const [ticketStats, setTicketStats] = useState(null)
  const [userStats, setUserStats] = useState(null)
  const [attentionPointStats, setAttentionPointStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedTimeframe, setSelectedTimeframe] = useState(30)
  const { user } = useAuth()

  useEffect(() => {
    const fetchAllStatistics = async () => {
      try {
        setLoading(true)
        
        // Fetch all statistics in parallel
        const [dashboardResponse, ticketResponse, userResponse, attentionResponse] = await Promise.all([
          statisticsService.getDashboard(),
          statisticsService.getTickets(selectedTimeframe),
          statisticsService.getUsers(),
          statisticsService.getAttentionPoints()
        ])

        setDashboardStats(dashboardResponse.data)
        setTicketStats(ticketResponse.data)
        setUserStats(userResponse.data)
        setAttentionPointStats(attentionResponse.data)
        
      } catch (err) {
        setError("Error al cargar las estadísticas")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchAllStatistics()
  }, [selectedTimeframe])

  const formatNumber = (num) => {
    return new Intl.NumberFormat('es-ES').format(num)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES')
  }

  const getTimeframeName = (days) => {
    switch(days) {
      case 7: return "Última semana"
      case 30: return "Último mes"
      case 90: return "Últimos 3 meses"
      default: return `Últimos ${days} días`
    }
  }

  const StatCard = ({ title, value, subtitle, color = "primary", link = null }) => (
    <div className="dashboard-card">
      <h3 style={{ color: `var(--${color}-color)` }}>{title}</h3>
      <div style={{ fontSize: '2rem', fontWeight: 'bold', margin: '1rem 0' }}>
        {formatNumber(value)}
      </div>
      {subtitle && <p style={{ color: '#888', fontSize: '0.9rem' }}>{subtitle}</p>}
      {link && (
        <Link to={link} className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Ver detalles
        </Link>
      )}
    </div>
  )

  const ChartContainer = ({ title, children }) => (
    <div className="dashboard-card" style={{ gridColumn: 'span 2' }}>
      <h3>{title}</h3>
      <div style={{ marginTop: '1rem' }}>
        {children}
      </div>
    </div>
  )

  const ProgressBar = ({ label, value, total, color = "#4A90E2" }) => {
    const percentage = total > 0 ? (value / total) * 100 : 0
    return (
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span>{label}</span>
          <span>{value} / {total} ({percentage.toFixed(1)}%)</span>
        </div>
        <div style={{ 
          backgroundColor: '#333', 
          borderRadius: '4px', 
          height: '8px',
          overflow: 'hidden'
        }}>
          <div 
            style={{ 
              backgroundColor: color,
              height: '100%',
              width: `${percentage}%`,
              transition: 'width 0.3s ease'
            }}
          />
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
    )
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>
  }

  if (!dashboardStats) {
    return <div>No se pudieron cargar las estadísticas</div>
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Dashboard de Estadísticas</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <label htmlFor="timeframe">Período de análisis:</label>
          <select 
            id="timeframe"
            value={selectedTimeframe} 
            onChange={(e) => setSelectedTimeframe(Number(e.target.value))}
            className="form-control"
            style={{ width: '150px' }}
          >
            <option value={7}>Última semana</option>
            <option value={30}>Último mes</option>
            <option value={90}>Últimos 3 meses</option>
          </select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="dashboard-container">
        <StatCard 
          title="Total de Usuarios" 
          value={dashboardStats.summary.total_users}
          subtitle="Registrados en el sistema"
          link={user?.role === "ADMINISTRADOR" ? "/users" : null}
        />

        <StatCard 
          title="Total de Tickets" 
          value={ticketStats?.total_tickets_in_period || 0}
          subtitle={`En ${getTimeframeName(selectedTimeframe).toLowerCase()}`}
        />

        <StatCard 
          title="Tickets Cerrados" 
          value={ticketStats?.tickets_by_status_period?.find(s => s.status === 'closed')?.count || 0}
          subtitle={`En ${getTimeframeName(selectedTimeframe).toLowerCase()}`}
        />
      </div>

      {/* Detailed Statistics */}
      <div className="dashboard-container" style={{ marginTop: '2rem' }}>
        
        {/* Attention Points Performance Chart */}
        {ticketStats && ticketStats.tickets_per_attention_point && (
          <ChartContainer title={`Puntos de Atención que Más Tickets Han Atendido - ${getTimeframeName(selectedTimeframe)}`}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'end', 
              gap: '8px', 
              height: '300px',
              margin: '1rem 0',
              padding: '1rem',
              borderBottom: '1px solid #444',
              overflow: 'auto'
            }}>
              {ticketStats.tickets_per_attention_point
                .sort((a, b) => b.closed_tickets - a.closed_tickets)
                .map((point, index) => {
                  const maxTickets = Math.max(...ticketStats.tickets_per_attention_point.map(p => p.closed_tickets))
                  const height = maxTickets > 0 ? (point.closed_tickets / maxTickets) * 250 : 0
                  
                  const colors = ['#4A90E2', '#27ae60', '#f39c12', '#e74c3c', '#9b59b6', '#1abc9c']
                  const color = colors[index % colors.length]
                  
                  return (
                    <div key={point.attention_point_id} style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                      minWidth: '80px',
                      margin: '0 4px'
                    }}>
                      <div style={{ 
                        backgroundColor: color,
                        width: '60px',
                        height: `${height}px`,
                        borderRadius: '4px 4px 0 0',
                        transition: 'height 0.3s ease',
                        marginBottom: '0.5rem',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'end',
                        justifyContent: 'center',
                        paddingBottom: '8px'
                      }}>
                        <span style={{ 
                          color: 'white', 
                          fontSize: '0.9rem', 
                          fontWeight: 'bold',
                          textShadow: '1px 1px 2px rgba(0,0,0,0.7)'
                        }}>
                          {point.closed_tickets}
                        </span>
                      </div>
                      <div style={{ 
                        fontSize: '0.8rem', 
                        fontWeight: 'bold',
                        textAlign: 'center',
                        marginBottom: '0.25rem'
                      }}>
                        {point.attention_point_id}
                      </div>
                      <div style={{ 
                        fontSize: '0.7rem', 
                        color: '#888',
                        textAlign: 'center'
                      }}>
                        {point.closed_tickets} atendidos
                      </div>
                    </div>
                  )
                })}
            </div>
            <div style={{ 
              fontSize: '0.9rem', 
              color: '#888', 
              textAlign: 'center', 
              marginTop: '1rem' 
            }}>
              Datos de tickets cerrados para el período: {getTimeframeName(selectedTimeframe)}
            </div>
          </ChartContainer>
        )}

        {/* Users by Role */}
        <ChartContainer title="Usuarios por Rol">
          {dashboardStats.users_by_role.map(item => (
            <ProgressBar 
              key={item.role}
              label={item.role}
              value={item.count}
              total={dashboardStats.summary.total_users}
              color={item.role === 'ADMINISTRADOR' ? '#e74c3c' : 
                     item.role === 'EMPLEADO' ? '#f39c12' : '#3498db'}
            />
          ))}
        </ChartContainer>

        {/* Recent Activity */}
        {ticketStats && ticketStats.most_active_users && (
          <ChartContainer title={`Usuarios Más Activos - ${getTimeframeName(selectedTimeframe)}`}>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {ticketStats.most_active_users.map((user, index) => (
                <div key={user.dni} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  padding: '0.5rem', 
                  borderBottom: '1px solid #333',
                  alignItems: 'center'
                }}>
                  <div>
                    <strong>{user.first_name} {user.last_name}</strong>
                    <div style={{ fontSize: '0.8rem', color: '#888' }}>DNI: {user.dni}</div>
                  </div>
                  <div style={{ 
                    backgroundColor: '#4A90E2', 
                    color: 'white', 
                    padding: '0.25rem 0.5rem', 
                    borderRadius: '4px',
                    fontSize: '0.9rem'
                  }}>
                    {user.ticket_count} tickets
                  </div>
                </div>
              ))}
            </div>
          </ChartContainer>
        )}

        {/* Performance Metrics */}
        {ticketStats && ticketStats.average_resolution_time_hours && (
          <div className="dashboard-card">
            <h3>Métricas de Rendimiento - {getTimeframeName(selectedTimeframe)}</h3>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', margin: '1rem 0' }}>
                {ticketStats.average_resolution_time_hours.toFixed(1)}h
              </div>
              <div style={{ color: '#888' }}>Tiempo promedio de resolución</div>
            </div>
          </div>
        )}

        {/* Priority Distribution */}
        {ticketStats && ticketStats.user_type_distribution && (
          <div className="dashboard-card">
            <h3>Distribución por Prioridad - {getTimeframeName(selectedTimeframe)}</h3>
            <ProgressBar 
              label="Alta Prioridad"
              value={ticketStats.user_type_distribution.priority_tickets}
              total={ticketStats.user_type_distribution.priority_tickets + ticketStats.user_type_distribution.regular_tickets}
              color="#e74c3c"
            />
            <ProgressBar 
              label="Prioridad Normal"
              value={ticketStats.user_type_distribution.regular_tickets}
              total={ticketStats.user_type_distribution.priority_tickets + ticketStats.user_type_distribution.regular_tickets}
              color="#95a5a6"
            />
          </div>
        )}

      </div>
    </div>
  )
}

export default Dashboard