from typing import cast

from django.db.models import QuerySet
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
from jwt_auth.models import User


class EventsListAPIView(ListAPIView[Event]):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self) -> QuerySet[Event]:
        event_type = self.request.GET.get('type', '')
        today = now()
        if event_type == 'my':
            return Event.objects.filter(
                users__user=cast(User, self.request.user),
            )
        elif event_type == 'active':
            return Event.objects.filter(
                start_date__lte=today,
                end_date__gte=today,
            )
        elif event_type == 'past':
            return Event.objects.filter(end_date__lte=now())
        else:
            return Event.objects.all()


class RetrieveEventAPIView(RetrieveAPIView[Event]):
    queryset = Event.objects.all()
    serializer_class = DetailEventSerializer
    permission_classes = [IsAuthenticated]


class EventParticipationAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request: Request, pk: int) -> Response:
        event = get_object_or_404(Event, pk=pk)
        EventParticipation.objects.get_or_create(
            event=event,
            user=request.user,
        )
        return Response(status=status.HTTP_204_NO_CONTENT)

    def delete(self, request: Request, pk: int) -> Response:
        event = get_object_or_404(Event, pk=pk)
        EventParticipation.objects.filter(
            event=event,
            user=request.user,
        ).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
