from django.urls import path  # noqa

from api import views

urlpatterns = [
    path('events/', views.EventsListAPIView.as_view(), name='events-list'),
    path(
        'events/<int:pk>/',
        views.RetrieveEventAPIView.as_view(),
        name='event',
    ),
    path(
        'events/<int:pk>/participate/',
        views.EventParticipationAPIView.as_view(),
        name='event-participation',
    ),
    path(
        'events/<int:pk>/feedback/',
        views.CreateFeedbackAPIView.as_view(),
        name='create-feedback',
    ),
]
