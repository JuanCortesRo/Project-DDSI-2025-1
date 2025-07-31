import { useState, useEffect } from "react"
import { statisticsService } from "../services/api"

const Statistics = () => {
  const [ticketStats, setTicketStats] = useState(null)
  const [userStats, setUserStats] = useState(null)
  const [attentionPointStats, setAttentionPointStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("tickets")
  const [timeframe, setTimeframe] = useState(30)

  useEffect(() => {
    fetchStatistics()
  }, [timeframe])

  const fetchStatistics = async () => {
    try {
      setLoading(true)
      const [ticketsResponse, usersResponse, attentionResponse] = await Promise.all([
        statisticsService.getTickets(timeframe),
        statisticsService.getUsers(),
        statisticsService.getAttentionPoints()
      ])

      setTicketStats(ticketsResponse.data)
      setUserStats(usersResponse.data)
      setAttentionPointStats(attentionResponse.data)
    } catch (err) {
      setError("Error al cargar las estadísticas")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num) => {
    return new Intl.NumberFormat('es-ES').format(num)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (hours) => {
    if (hours < 1) return `${Math.round(hours * 60)} min`
    if (hours < 24) return `${hours.toFixed(1)} h`
    return `${(hours / 24).toFixed(1)} días`
  }

  const TabButton = ({ id, label, active, onClick }) => (
    <button
      className={`btn ${active ? 'btn-primary' : 'btn-secondary'}`}
      onClick={() => onClick(id)}
      style={{ margin: '0 0.5rem' }}
    >
      {label}
    </button>
  )

  const StatCard = ({ title, value, subtitle, trend }) => (
    <div className="dashboard-card" style={{ textAlign: 'center' }}>
      <h4>{title}</h4>
      <div style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '1rem 0' }}>
        {typeof value === 'number' ? formatNumber(value) : value}
      </div>
      {subtitle && <p style={{ color: '#888', fontSize: '0.9rem' }}>{subtitle}</p>}
      {trend && (
        <div style={{ 
          color: trend > 0 ? '#27ae60' : '#e74c3c',
          fontSize: '0.9rem',
          fontWeight: 'bold'
        }}>
          {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%
        </div>
      )}
    </div>
  )

  const Chart = ({ title, data, xKey, yKey, color = "#4A90E2" }) => (
    <div className="dashboard-card">
      <h4>{title}</h4>
      <div style={{ 
        display: 'flex', 
        alignItems: 'end', 
        gap: '4px', 
        height: '200px',
        margin: '1rem 0',
        padding: '1rem',
        borderBottom: '1px solid #444'
      }}>
        {data.map((item, index) => {
          const maxValue = Math.max(...data.map(d => d[yKey]))
          const height = maxValue > 0 ? (item[yKey] / maxValue) * 160 : 0
          
          return (
            <div key={index} style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              flex: 1,
              minWidth: '40px'
            }}>
              <div style={{ 
                backgroundColor: color,
                width: '100%',
                height: `${height}px`,
                borderRadius: '2px 2px 0 0',
                transition: 'height 0.3s ease',
                marginBottom: '0.5rem'
              }} />
              <div style={{ 
                fontSize: '0.7rem', 
                color: '#888',
                textAlign: 'center',
                transform: 'rotate(-45deg)',
                whiteSpace: 'nowrap'
              }}>
                {xKey === 'date' ? formatDate(item[xKey]) : item[xKey]}
              </div>
              <div style={{ 
                fontSize: '0.8rem', 
                fontWeight: 'bold',
                marginTop: '0.25rem'
              }}>
                {item[yKey]}
              </div>
              <div style={{ 
                fontSize: '0.6rem', 
                color: '#888',
                textAlign: 'center',
                marginTop: '0.25rem'
              }}>
                {yKey === 'total_tickets_served' ? `${item[yKey]} atendidos` : 
                 yKey === 'total_tickets' ? `${item[yKey]} total` : 
                 xKey === 'date' ? '' : 
                 `${item[yKey]} tickets`}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

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

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Estadísticas Avanzadas</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <label>Período:</label>
          <select 
            value={timeframe} 
            onChange={(e) => setTimeframe(Number(e.target.value))}
            className="form-control"
            style={{ width: '150px' }}
          >
            <option value={7}>7 días</option>
            <option value={30}>30 días</option>
            <option value={90}>90 días</option>
          </select>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <TabButton 
          id="tickets" 
          label="Tickets" 
          active={activeTab === "tickets"} 
          onClick={setActiveTab} 
        />
        <TabButton 
          id="users" 
          label="Usuarios" 
          active={activeTab === "users"} 
          onClick={setActiveTab} 
        />
        <TabButton 
          id="attention-points" 
          label="Puntos de Atención" 
          active={activeTab === "attention-points"} 
          onClick={setActiveTab} 
        />
      </div>

      {/* Tickets Statistics */}
      {activeTab === "tickets" && ticketStats && (
        <div>
          <div className="dashboard-container">
            <StatCard 
              title="Tiempo Promedio de Resolución"
              value={ticketStats.average_resolution_time_hours ? 
                formatTime(ticketStats.average_resolution_time_hours) : 'N/A'}
              subtitle="Para tickets cerrados"
            />
            <StatCard 
              title="Tickets Prioritarios"
              value={ticketStats.user_type_distribution.priority_tickets}
              subtitle={`${((ticketStats.user_type_distribution.priority_tickets / 
                (ticketStats.user_type_distribution.priority_tickets + 
                 ticketStats.user_type_distribution.regular_tickets)) * 100).toFixed(1)}% del total`}
            />
            <StatCard 
              title="Tickets Regulares"
              value={ticketStats.user_type_distribution.regular_tickets}
              subtitle="Usuario sin prioridad"
            />
          </div>

          {/* Charts */}
          <div className="dashboard-container" style={{ gridTemplateColumns: '1fr' }}>
            {ticketStats.tickets_over_time && ticketStats.tickets_over_time.length > 0 && (
              <Chart 
                title={`Tickets Creados - ${ticketStats.time_period}`}
                data={ticketStats.tickets_over_time}
                xKey="date"
                yKey="count"
                color="#4A90E2"
              />
            )}
          </div>

          {/* Performance by Attention Point */}
          <div className="dashboard-card">
            <h4>Rendimiento por Punto de Atención</h4>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Punto de Atención</th>
                    <th>Tickets Abiertos</th>
                    <th>En Progreso</th>
                    <th>Cerrados</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {ticketStats.tickets_per_attention_point.map(point => (
                    <tr key={point.attention_point_id}>
                      <td>{point.attention_point_id}</td>
                      <td><span className="status-open">{point.open_tickets}</span></td>
                      <td><span className="status-in_progress">{point.in_progress_tickets}</span></td>
                      <td><span className="status-closed">{point.closed_tickets}</span></td>
                      <td><strong>{point.total_tickets}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Most Active Users */}
          {ticketStats.most_active_users && (
            <div className="dashboard-card">
              <h4>Usuarios Más Activos</h4>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Usuario</th>
                      <th>DNI</th>
                      <th>Tickets Creados</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ticketStats.most_active_users.map(user => (
                      <tr key={user.dni}>
                        <td>{user.first_name} {user.last_name}</td>
                        <td>{user.dni}</td>
                        <td><strong>{user.ticket_count}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Users Statistics */}
      {activeTab === "users" && userStats && (
        <div>
          <div className="dashboard-container">
            <StatCard 
              title="Usuarios Activos"
              value={userStats.user_activity.active_users}
              subtitle="Con al menos 1 ticket"
            />
            <StatCard 
              title="Usuarios Inactivos"
              value={userStats.user_activity.inactive_users}
              subtitle="Sin tickets creados"
            />
            <StatCard 
              title="Usuarios Prioritarios"
              value={userStats.priority_distribution.priority_users}
              subtitle={`${((userStats.priority_distribution.priority_users / 
                (userStats.priority_distribution.priority_users + 
                 userStats.priority_distribution.regular_users)) * 100).toFixed(1)}% del total`}
            />
          </div>

          {/* Users by Role */}
          <div className="dashboard-card">
            <h4>Distribución por Roles</h4>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Rol</th>
                    <th>Cantidad</th>
                    <th>Porcentaje</th>
                  </tr>
                </thead>
                <tbody>
                  {userStats.users_by_role.map(role => {
                    const total = userStats.users_by_role.reduce((sum, r) => sum + r.count, 0)
                    const percentage = ((role.count / total) * 100).toFixed(1)
                    return (
                      <tr key={role.role}>
                        <td>{role.role}</td>
                        <td><strong>{role.count}</strong></td>
                        <td>{percentage}%</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Users */}
          {userStats.recent_users && (
            <div className="dashboard-card">
              <h4>Usuarios Recientes</h4>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>DNI</th>
                      <th>Rol</th>
                      <th>Fecha de Registro</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userStats.recent_users.map(user => (
                      <tr key={user.dni}>
                        <td>{user.first_name} {user.last_name}</td>
                        <td>{user.dni}</td>
                        <td>{user.role}</td>
                        <td>{new Date(user.date_joined).toLocaleDateString('es-ES')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Attention Points Statistics */}
      {activeTab === "attention-points" && attentionPointStats && (
        <div>
          <div className="dashboard-container">
            <StatCard 
              title="Tasa de Utilización"
              value={`${attentionPointStats.utilization_summary.utilization_rate}%`}
              subtitle="Puntos de atención ocupados"
            />
            <StatCard 
              title="Puntos Disponibles"
              value={attentionPointStats.utilization_summary.available_points}
              subtitle="Listos para atender"
            />
            <StatCard 
              title="Puntos Ocupados"
              value={attentionPointStats.utilization_summary.occupied_points}
              subtitle="Atendiendo actualmente"
            />
          </div>

          {/* Chart showing closed tickets handled by each attention point */}
          <div className="dashboard-container" style={{ gridTemplateColumns: '1fr' }}>
            <Chart 
              title="Puntos de Atención que Más Tickets Han Atendido"
              data={attentionPointStats.attention_points_detail.map(point => ({
                attention_point_id: point.attention_point_id,
                total_tickets_served: point.total_tickets_served
              }))}
              xKey="attention_point_id"
              yKey="total_tickets_served"
              color="#27ae60"
            />
          </div>

          {/* Detailed Status */}
          <div className="dashboard-card">
            <h4>Estado Detallado de Puntos de Atención</h4>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Punto de Atención</th>
                    <th>Estado</th>
                    <th>Tickets Actuales</th>
                    <th>Tickets Atendidos</th>
                    <th>Tickets Pendientes</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {attentionPointStats.attention_points_detail.map(point => (
                    <tr key={point.attention_point_id}>
                      <td><strong>{point.attention_point_id}</strong></td>
                      <td>
                        <span style={{ 
                          color: point.availability ? '#27ae60' : '#e74c3c',
                          fontWeight: 'bold'
                        }}>
                          {point.availability ? 'Disponible' : 'Ocupado'}
                        </span>
                      </td>
                      <td>{point.current_tickets}</td>
                      <td>{point.total_tickets_served}</td>
                      <td>{point.pending_tickets}</td>
                      <td><strong>{point.current_tickets + point.total_tickets_served + point.pending_tickets}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Performance Metrics */}
          {attentionPointStats.performance_metrics && attentionPointStats.performance_metrics.length > 0 && (
            <div className="dashboard-card">
              <h4>Métricas de Rendimiento</h4>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Punto de Atención</th>
                      <th>Tickets Atendidos</th>
                      <th>Tiempo Promedio de Resolución</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attentionPointStats.performance_metrics.map(metric => (
                      <tr key={metric.attention_point_id}>
                        <td><strong>{metric.attention_point_id}</strong></td>
                        <td>{metric.tickets_served}</td>
                        <td>{formatTime(metric.avg_resolution_time_hours)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Statistics
