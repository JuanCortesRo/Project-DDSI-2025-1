from django.db import models
from cloudinary.models import CloudinaryField 

class Publicity(models.Model):
    id_publicity = models.CharField(max_length=3, primary_key=True, editable=False)
    title = models.CharField(max_length=255)
    content = models.TextField()
    image = CloudinaryField('image', null=True, blank=True)
    start_date = models.DateField()
    end_date = models.DateField()
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "publicidad"
        
    def save(self, *args, **kwargs):
        if not self.id_publicity:
            last = Publicity.objects.order_by('-id_publicity').first()
            if last and last.id_publicity.isdigit():
                new_id = int(last.id_publicity) + 1
            else:
                new_id = 1
            self.id_publicity = f"{new_id:03d}"
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.title
