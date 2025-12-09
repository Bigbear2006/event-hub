import { type Event } from '../../api/event.ts';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../../format.ts';

interface EventCardProps {
  event: Event;
}

export const EventCard = ({ event }: EventCardProps) => {
  const navigate = useNavigate();

  return (
    <div
      className="event-card"
      title={event.shortDescription}
      onClick={() => navigate(`/event/${event.id}/`)}
      style={{ backgroundImage: `url(${event.image})` }}
    >
      <p>{event.title}</p>
      <p>
        {formatDate(event.startDate)} - {formatDate(event.endDate)}
      </p>
    </div>
  );
};
