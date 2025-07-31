from django.urls import path
from .views import (
    DashboardStatisticsView,
    TicketStatisticsView,
    UserStatisticsView,
    AttentionPointStatisticsView
)

urlpatterns = [
    path('api/statistics/dashboard/', DashboardStatisticsView.as_view(), name='dashboard-statistics'),
    path('api/statistics/tickets/', TicketStatisticsView.as_view(), name='ticket-statistics'),
    path('api/statistics/users/', UserStatisticsView.as_view(), name='user-statistics'),
    path('api/statistics/attention-points/', AttentionPointStatisticsView.as_view(), name='attention-point-statistics'),
]
