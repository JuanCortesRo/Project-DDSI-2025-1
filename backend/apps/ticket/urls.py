from django.urls import path
from .views import TicketListView, assign_ticket, unassign_ticket, get_ticket

urlpatterns = [
    path('tickets/', TicketListView.as_view(), name='ticket-list'),
    path('tickets/assign/', assign_ticket, name='assign-ticket'),
    path('tickets/unassign/', unassign_ticket, name='unassign-ticket'),
    path('tickets/<str:ticketId>/', get_ticket, name='get-ticket')
]