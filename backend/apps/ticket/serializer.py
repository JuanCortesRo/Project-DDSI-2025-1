from rest_framework import serializers
from .models import Ticket

class TicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = [
            'id_ticket','status', 'priority', 
            'created_at', 'updated_at', 'user', 'punto_atencion'
        ]
        read_only_fields = ['id_ticket']

        