from django.urls import path
from .views import (
    DashboardStatisticsView,
    TicketStatisticsView,
    UserStatisticsView,
    AttentionPointStatisticsView
)

urlpatterns = [
    path('dashboard/', DashboardStatisticsView.as_view(), name='dashboard-statistics'),
    path('tickets/', TicketStatisticsView.as_view(), name='ticket-statistics'),
    path('users/', UserStatisticsView.as_view(), name='user-statistics'),
    path('attention-points/', AttentionPointStatisticsView.as_view(), name='attention-point-statistics'),
]
