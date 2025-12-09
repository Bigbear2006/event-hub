import { useEffect, useState } from 'react';
import { type Event, getEvents } from '../api/event.ts';
import { EventCard } from '../components/events/EventCard.tsx';
import { EventsHeader } from '../components/events/EventsHeader.tsx';
import { useParams } from 'react-router-dom';

export const EventsListPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const { eventType } = useParams<{ eventType: string }>();

  useEffect(() => {
    getEvents(eventType!, setEvents);
  }, [eventType]);

  return (
    <div className="events">
      <EventsHeader />
      {events.length === 0 && <p className="events__empty">Нет событий</p>}
      {events.length > 0 && (
        <div className="events__cards">
          {events.map(elem => (
            <EventCard key={elem.id} event={elem} />
          ))}
        </div>
      )}
    </div>
  );
};
