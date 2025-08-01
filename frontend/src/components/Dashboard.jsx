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
      <h3 className={`stat-card-title stat-card-title-${color}`}>{title}</h3>
      <div className="stat-card-value">
        {formatNumber(value)}
      </div>
      {subtitle && <p className="stat-card-subtitle">{subtitle}</p>}
      {link && (
        <Link to={link} className="btn btn-primary stat-card-link">
          Ver detalles
        </Link>
      )}
    </div>
  )

  const ChartContainer = ({ title, children }) => (
    <div className="dashboard-card chart-container-card">
      <h3>{title}</h3>
      <div className="chart-content">
        {children}
      </div>
    </div>
  )

  const ProgressBar = ({ label, value, total, color = "#4A90E2" }) => {
    const percentage = total > 0 ? (value / total) * 100 : 0
    return (
      <div className="progress-bar-container">
        <div className="progress-bar-header">
          <span>{label}</span>
          <span>{value} / {total} ({percentage.toFixed(1)}%)</span>
        </div>
        <div className="progress-bar-background">
          <div 
            className="progress-bar-fill"
            style={{ 
              backgroundColor: color,
              width: `${percentage}%`
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
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <h2>Dashboard de Estadísticas</h2>
          <div className="dashboard-header-controls">
            <label htmlFor="timeframe">Período de análisis:</label>
            <select 
              id="timeframe"
              value={selectedTimeframe} 
              onChange={(e) => setSelectedTimeframe(Number(e.target.value))}
              className="form-control"
            >
              <option value={7}>Última semana</option>
              <option value={30}>Último mes</option>
              <option value={90}>Últimos 3 meses</option>
            </select>
          </div>
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
      <div className="dashboard-container dashboard-detailed-stats">
        
        {/* Attention Points Performance Chart */}
        {ticketStats && ticketStats.tickets_per_attention_point && (
          <ChartContainer title={`Puntos de Atención que Más Tickets Han Atendido - ${getTimeframeName(selectedTimeframe)}`}>
            <div className="attention-points-chart">
              {ticketStats.tickets_per_attention_point
                .sort((a, b) => b.closed_tickets - a.closed_tickets)
                .map((point, index) => {
                  const maxTickets = Math.max(...ticketStats.tickets_per_attention_point.map(p => p.closed_tickets))
                  const height = maxTickets > 0 ? (point.closed_tickets / maxTickets) * 250 : 0
                  
                  const colors = ['#4A90E2', '#27ae60', '#f39c12', '#e74c3c', '#9b59b6', '#1abc9c']
                  const color = colors[index % colors.length]
                  
                  return (
                    <div key={point.attention_point_id} className="chart-bar-container">
                      <div 
                        className="chart-bar"
                        style={{ 
                          backgroundColor: color,
                          height: `${height}px`
                        }}
                      >
                        <span className="chart-bar-value">
                          {point.closed_tickets}
                        </span>
                      </div>
                      <div className="chart-bar-id">
                        {point.attention_point_id}
                      </div>
                      <div className="chart-bar-label">
                        {point.closed_tickets} atendidos
                      </div>
                    </div>
                  )
                })}
            </div>
            <div className="chart-footer">
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
            <div className="active-users-list">
              {ticketStats.most_active_users.map((user, index) => (
                <div key={user.dni} className="active-user-item">
                  <div className="active-user-info">
                    <div className="active-user-name">{user.first_name} {user.last_name}</div>
                    <div className="active-user-dni">DNI: {user.dni}</div>
                  </div>
                  <div className="active-user-tickets">
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
            <div className="performance-metrics">
              <div className="performance-value">
                {ticketStats.average_resolution_time_hours.toFixed(1)}h
              </div>
              <div className="performance-label">Tiempo promedio de resolución</div>
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