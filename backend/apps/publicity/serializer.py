from rest_framework import serializers
from .models import Publicity

class PublicitySerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Publicity
        fields = ['id_publicity', 'title', 'content', 'image', 'image_url', 'start_date', 'end_date', 'is_active']

    def get_image_url(self, obj):
        if obj.image:
            return obj.image.url
        return None