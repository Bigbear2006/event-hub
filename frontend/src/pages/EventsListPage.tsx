import { useEffect, useState } from 'react';
import { type Event, getEvents } from '../api/event.ts';
import { EventCard } from '../components/events/EventCard.tsx';
import { EventsHeader } from '../components/events/EventsHeader.tsx';
import { useParams } from 'react-router-dom';
import type {User} from "../api/auth.ts";

interface EventsListPageProps {
  user: User;
}

export const EventsListPage = ({user}: EventsListPageProps) => {
  const [events, setEvents] = useState<Event[]>([]);
  const { eventType } = useParams<{ eventType: string }>();

  useEffect(() => {
    getEvents(eventType!, setEvents);
  }, [eventType]);

  return (
    <div className="events">
      <EventsHeader user={user} />
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
