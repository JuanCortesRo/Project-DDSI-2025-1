from django.utils import timezone
from .models import Publicity

def deactivate_expired_publicity():
    today = timezone.now().date()
    expired = Publicity.objects.filter(is_active=True, end_date__lt=today)
    count = expired.update(is_active=False)
    return f"Deactivated {count} expired publicity items."

def activate_publicity():
    today = timezone.now().date()
    to_activate = Publicity.objects.filter(is_active=False, start_date__lte=today, end_date__gte=today)
    count = to_activate.update(is_active=True)
    return f"Activated {count} publicity items."