from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.db.models import Count, Q, Avg
from django.db.models.functions import TruncDate, TruncHour
from django.utils import timezone
from datetime import timedelta, datetime
from apps.ticket.models import Ticket
from apps.user.models import User
from apps.attention_point.models import Attention_Point
from apps.publicity.models import Publicity


class DashboardStatisticsView(APIView):
    """
    Comprehensive statistics for the dashboard
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        try:
            # Basic counts
            total_users = User.objects.count()
            total_tickets = Ticket.objects.count()
            total_attention_points = Attention_Point.objects.count()
            total_publicity = Publicity.objects.count()
            
            # User statistics by role
            users_by_role = User.objects.values('role').annotate(count=Count('id')).order_by('role')
            
            # Ticket statistics by status
            tickets_by_status = Ticket.objects.values('status').annotate(count=Count('id_ticket')).order_by('status')
            
            # Ticket statistics by priority
            tickets_by_priority = Ticket.objects.values('priority').annotate(count=Count('id_ticket')).order_by('priority')
            
            # Active attention points
            available_attention_points = Attention_Point.objects.filter(availability=True).count()
            occupied_attention_points = Attention_Point.objects.filter(availability=False).count()
            
            # Recent tickets (last 7 days)
            seven_days_ago = timezone.now() - timedelta(days=7)
            recent_tickets = Ticket.objects.filter(created_at__gte=seven_days_ago).count()
            
            # Tickets created today
            today = timezone.now().date()
            tickets_today = Ticket.objects.filter(created_at__date=today).count()
            
            # Active publicity campaigns
            active_publicity = Publicity.objects.filter(
                is_active=True,
                start_date__lte=timezone.now().date(),
                end_date__gte=timezone.now().date()
            ).count()
            
            # Priority users count
            priority_users = User.objects.filter(prioridad=True).count()
            
            data = {
                'summary': {
                    'total_users': total_users,
                    'total_tickets': total_tickets,
                    'total_attention_points': total_attention_points,
                    'total_publicity': total_publicity,
                    'recent_tickets': recent_tickets,
                    'tickets_today': tickets_today,
                    'active_publicity': active_publicity,
                    'priority_users': priority_users
                },
                'users_by_role': list(users_by_role),
                'tickets_by_status': list(tickets_by_status),
                'tickets_by_priority': list(tickets_by_priority),
                'attention_points': {
                    'available': available_attention_points,
                    'occupied': occupied_attention_points,
                    'total': total_attention_points
                }
            }
            
            return Response(data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {'error': f'Error retrieving statistics: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class TicketStatisticsView(APIView):
    """
    Detailed ticket statistics and analytics
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        try:
            # Get time period from query params (default to last 30 days)
            days = int(request.query_params.get('days', 30))
            start_date = timezone.now() - timedelta(days=days)
            
            # Total tickets in the time period
            total_tickets_in_period = Ticket.objects.filter(created_at__gte=start_date).count()
            
            # Tickets by status in the time period
            tickets_by_status_period = (
                Ticket.objects
                .filter(created_at__gte=start_date)
                .values('status')
                .annotate(count=Count('id_ticket'))
                .order_by('status')
            )
            
            # Tickets created over time (daily)
            tickets_over_time = (
                Ticket.objects
                .filter(created_at__gte=start_date)
                .annotate(date=TruncDate('created_at'))
                .values('date')
                .annotate(count=Count('id_ticket'))
                .order_by('date')
            )
            
            # Tickets by hour of day (for today)
            today = timezone.now().date()
            tickets_by_hour = (
                Ticket.objects
                .filter(created_at__date=today)
                .annotate(hour=TruncHour('created_at'))
                .values('hour')
                .annotate(count=Count('id_ticket'))
                .order_by('hour')
            )
            
            # Average resolution time (for closed tickets in the time period)
            closed_tickets = Ticket.objects.filter(status='closed', created_at__gte=start_date)
            avg_resolution_time = None
            if closed_tickets.exists():
                resolution_times = []
                for ticket in closed_tickets:
                    if ticket.created_at and ticket.updated_at:
                        diff = ticket.updated_at - ticket.created_at
                        resolution_times.append(diff.total_seconds() / 3600)  # in hours
                
                if resolution_times:
                    avg_resolution_time = sum(resolution_times) / len(resolution_times)
            
            # Tickets by user type (priority vs regular) in the time period
            priority_tickets = Ticket.objects.filter(user__prioridad=True, created_at__gte=start_date).count()
            regular_tickets = Ticket.objects.filter(user__prioridad=False, created_at__gte=start_date).count()
            
            # Most active users (users with most tickets in the time period)
            most_active_users = (
                User.objects
                .annotate(ticket_count=Count('tickets_created', filter=Q(tickets_created__created_at__gte=start_date)))
                .filter(ticket_count__gt=0)
                .order_by('-ticket_count')[:5]
                .values('first_name', 'last_name', 'dni', 'ticket_count')
            )
            
            # Tickets per attention point (time-filtered)
            tickets_per_point = (
                Attention_Point.objects
                .annotate(
                    total_tickets=Count('ticket', filter=Q(ticket__created_at__gte=start_date)),
                    open_tickets=Count('ticket', filter=Q(ticket__status='open', ticket__created_at__gte=start_date)),
                    in_progress_tickets=Count('ticket', filter=Q(ticket__status='in_progress', ticket__created_at__gte=start_date)),
                    closed_tickets=Count('ticket', filter=Q(ticket__status='closed', ticket__created_at__gte=start_date))
                )
                .values(
                    'attention_point_id', 
                    'total_tickets', 
                    'open_tickets', 
                    'in_progress_tickets', 
                    'closed_tickets'
                )
                .order_by('-total_tickets')
            )
            
            data = {
                'time_period': f'Last {days} days',
                'total_tickets_in_period': total_tickets_in_period,
                'tickets_by_status_period': list(tickets_by_status_period),
                'tickets_over_time': list(tickets_over_time),
                'tickets_by_hour': list(tickets_by_hour),
                'average_resolution_time_hours': avg_resolution_time,
                'user_type_distribution': {
                    'priority_tickets': priority_tickets,
                    'regular_tickets': regular_tickets
                },
                'most_active_users': list(most_active_users),
                'tickets_per_attention_point': list(tickets_per_point)
            }
            
            return Response(data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {'error': f'Error retrieving ticket statistics: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class UserStatisticsView(APIView):
    """
    User analytics and statistics
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        try:
            # Total users by role
            users_by_role = User.objects.values('role').annotate(count=Count('id')).order_by('role')
            
            # Users registered over time (last 30 days)
            thirty_days_ago = timezone.now() - timedelta(days=30)
            users_over_time = (
                User.objects
                .filter(date_joined__gte=thirty_days_ago)
                .annotate(date=TruncDate('date_joined'))
                .values('date')
                .annotate(count=Count('id'))
                .order_by('date')
            )
            
            # Users with/without priority
            priority_users = User.objects.filter(prioridad=True).count()
            regular_users = User.objects.filter(prioridad=False).count()
            
            # Most recent users
            recent_users = (
                User.objects
                .order_by('-date_joined')[:5]
                .values('first_name', 'last_name', 'dni', 'role', 'date_joined')
            )
            
            # User activity (users who created tickets)
            active_users = (
                User.objects
                .annotate(ticket_count=Count('tickets_created'))
                .filter(ticket_count__gt=0)
                .count()
            )
            
            inactive_users = User.objects.annotate(ticket_count=Count('tickets_created')).filter(ticket_count=0).count()
            
            data = {
                'users_by_role': list(users_by_role),
                'users_over_time': list(users_over_time),
                'priority_distribution': {
                    'priority_users': priority_users,
                    'regular_users': regular_users
                },
                'recent_users': list(recent_users),
                'user_activity': {
                    'active_users': active_users,
                    'inactive_users': inactive_users
                }
            }
            
            return Response(data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {'error': f'Error retrieving user statistics: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class AttentionPointStatisticsView(APIView):
    """
    Attention point analytics
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        try:
            # Attention point utilization
            total_points = Attention_Point.objects.count()
            available_points = Attention_Point.objects.filter(availability=True).count()
            occupied_points = Attention_Point.objects.filter(availability=False).count()
            
            utilization_rate = (occupied_points / total_points * 100) if total_points > 0 else 0
            
            # Detailed attention point status
            attention_points_detail = (
                Attention_Point.objects
                .annotate(
                    current_tickets=Count('ticket', filter=Q(ticket__status='in_progress')),
                    total_tickets_served=Count('ticket', filter=Q(ticket__status='closed')),
                    pending_tickets=Count('ticket', filter=Q(ticket__status='open'))
                )
                .values(
                    'attention_point_id',
                    'availability',
                    'current_tickets',
                    'total_tickets_served',
                    'pending_tickets'
                )
                .order_by('attention_point_id')
            )
            
            # Performance metrics
            performance_data = []
            for point in Attention_Point.objects.all():
                closed_tickets = Ticket.objects.filter(
                    punto_atencion=point, 
                    status='closed'
                )
                
                if closed_tickets.exists():
                    resolution_times = []
                    for ticket in closed_tickets:
                        if ticket.created_at and ticket.updated_at:
                            diff = ticket.updated_at - ticket.created_at
                            resolution_times.append(diff.total_seconds() / 3600)
                    
                    avg_time = sum(resolution_times) / len(resolution_times) if resolution_times else 0
                    
                    performance_data.append({
                        'attention_point_id': point.attention_point_id,
                        'tickets_served': closed_tickets.count(),
                        'avg_resolution_time_hours': avg_time
                    })
            
            data = {
                'utilization_summary': {
                    'total_points': total_points,
                    'available_points': available_points,
                    'occupied_points': occupied_points,
                    'utilization_rate': round(utilization_rate, 2)
                },
                'attention_points_detail': list(attention_points_detail),
                'performance_metrics': performance_data
            }
            
            return Response(data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {'error': f'Error retrieving attention point statistics: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
