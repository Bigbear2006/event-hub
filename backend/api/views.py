from typing import cast

from django.db.models import QuerySet
from django.db.models.aggregates import Count
from django.utils.timezone import now
from rest_framework import status
from rest_framework.generics import (
    ListAPIView,
    RetrieveAPIView,
    get_object_or_404,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from api.models import Event, EventParticipation
from api.serializers import DetailEventSerializer, EventSerializer
from api.services import (
    send_user_cancelled_participation_email,
    send_user_participated_email,
)
from jwt_auth.models import User


class EventsListAPIView(ListAPIView[Event]):
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self) -> QuerySet[Event]:
        event_type = self.request.GET.get('type', '')
        base_queryset = Event.objects.filter(is_cancelled=False).annotate(
            participants_count=Count('users'),
        )
        today = now()
        if event_type == 'my':
            return base_queryset.filter(
                users__user=cast(User, self.request.user),
            )
        elif event_type == 'active':
            return base_queryset.filter(
                start_date__lte=today,
                end_date__gte=today,
            )
        elif event_type == 'past':
            return base_queryset.filter(end_date__lte=now())
        else:
            return base_queryset


class RetrieveEventAPIView(RetrieveAPIView[Event]):
    queryset = Event.objects.filter(is_cancelled=False).annotate(
        participants_count=Count('users'),
    )
    serializer_class = DetailEventSerializer
    permission_classes = [IsAuthenticated]


class EventParticipationAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request: Request, pk: int) -> Response:
        event = get_object_or_404(
            Event.objects.annotate(participants_count=Count('users')),
            pk=pk,
        )
        if (
            event.max_participants_count is not None
            and event.participants_count >= event.max_participants_count
        ):
            return Response(
                {'error': 'too many participants'},
                status.HTTP_400_BAD_REQUEST,
            )

        _, created = EventParticipation.objects.get_or_create(
            event=event,
            user=request.user,
        )
        if created:
            send_user_participated_email(event, request.user)
        return Response(status=status.HTTP_204_NO_CONTENT)

    def delete(self, request: Request, pk: int) -> Response:
        event = get_object_or_404(Event, pk=pk)
        queryset = EventParticipation.objects.filter(
            event=event,
            user=cast(User, request.user),
        )

        if queryset.exists():
            send_user_cancelled_participation_email(event, request.user)

        queryset.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
