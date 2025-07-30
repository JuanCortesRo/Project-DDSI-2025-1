from .models import Ticket
from .serializer import TicketSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Case, When, IntegerField
from rest_framework.permissions import AllowAny
from rest_framework.decorators import api_view
from .models import Attention_Point
import random
import string

class TicketListViewAll(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        tickets = Ticket.objects.exclude(status='closed').annotate(
            priority_order=Case(
                When(priority='high', then=0),
                When(priority='low', then=1),
                output_field=IntegerField(),
            )
        ).order_by('priority_order', 'created_at')
        serializer = TicketSerializer(tickets, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = TicketSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TicketListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        tickets = Ticket.objects.filter(status='open').annotate(
            priority_order=Case(
                When(priority='high', then=0),
                When(priority='low', then=1),
                output_field=IntegerField(),
            )
        ).order_by('priority_order', 'created_at')
        serializer = TicketSerializer(tickets, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = TicketSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def assign_ticket(request):
    ticket_id = request.data.get('ticket_id')
    attention_point_id = request.data.get('attention_point_id')
    
    try:
        ticket = Ticket.objects.get(id_ticket=ticket_id)
        attention_point = Attention_Point.objects.get(attention_point_id=attention_point_id)
        
        if not attention_point.availability:
            return Response(
                {"error": "El punto de atención no está disponible"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Actualizar el estado del ticket y asignar el punto de atención
        ticket.status = 'in_progress'
        ticket.punto_atencion = attention_point  # Agregar esta línea
        ticket.save()
        
        # Actualizar el punto de atención
        attention_point.availability = False
        attention_point.save()
        
        return Response({
            "message": "Ticket asignado correctamente",
            "ticket": ticket.id_ticket,
            "attention_point": attention_point.attention_point_id
        })
        
    except (Ticket.DoesNotExist, Attention_Point.DoesNotExist):
        return Response(
            {"error": "Ticket o punto de atención no encontrado"}, 
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['POST'])
def unassign_ticket(request):
    ticket_id = request.data.get('ticket_id')
    
    try:
        ticket = Ticket.objects.get(id_ticket=ticket_id)
        attention_point = ticket.punto_atencion
        
        if ticket.status != 'in_progress':
            return Response(
                {"error": f"Solo se pueden desasignar tickets en progreso, este ticket está: {ticket.status}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if attention_point:
            attention_point.availability = True
            attention_point.save()
            
        ticket.status = 'closed'
        ticket.save()
        
        return Response({
            "message": "Ticket cerradoo correctamente",
            "ticket": ticket.id_ticket
        })
        
    except Ticket.DoesNotExist:
        print(f"Ticket no encontrado: {ticket_id}")
        return Response(
            {"error": "Ticket no encontrado"}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    except Exception as e:
        return Response(
            {"error": str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
@api_view(['GET'])
def get_ticket(request, ticketId):
    try:
        ticket = Ticket.objects.get(id_ticket=ticketId)
        serializer = TicketSerializer(ticket)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Ticket.DoesNotExist:
        return Response({"error": "Ticket not found"}, status=status.HTTP_404_NOT_FOUND)
    
