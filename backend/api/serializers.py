from rest_framework import serializers

from api.models import Event, EventParticipation, Feedback


class EventSerializer(serializers.ModelSerializer[Event]):
    participants_count = serializers.SerializerMethodField()
    is_active = serializers.SerializerMethodField()

    def get_participants_count(self, obj: Event) -> int:
        return obj.participants_count  # type: ignore

    def get_is_active(self, obj: Event) -> bool:
        return obj.is_active()

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
            'participants_count',
            'max_participants_count',
            'is_active',
        )


class DetailEventSerializer(EventSerializer):
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
            'participants_count',
            'max_participants_count',
            'user_participated',
            'is_active',
        )


class CreateFeedbackSerializer(serializers.ModelSerializer[Feedback]):
    class Meta:
        model = Feedback
        fields = ('text', 'rating')
