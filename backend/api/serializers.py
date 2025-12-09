from rest_framework import serializers

from api.models import Event, EventParticipation


class EventSerializer(serializers.ModelSerializer[Event]):
    class Meta:
        model = Event
        fields = '__all__'


class DetailEventSerializer(serializers.ModelSerializer[Event]):
    user_participated = serializers.SerializerMethodField()

    def get_user_participated(self, obj: Event) -> bool:
        request = self.context.get('request')
        return EventParticipation.objects.filter(
            event=obj,
            user=request.user,
        ).exists()

    class Meta:
        model = Event
        fields = (
            'id',
            'title',
            'image',
            'short_description',
            'full_description',
            'start_date',
            'end_date',
            'payment_info',
            'max_participants_count',
            'user_participated',
        )
