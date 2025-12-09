import {
  cancelEventParticipation,
  type Event,
  getEvent,
  participateInEvent,
} from '../api/event.ts';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export const EventPage = () => {
  const [event, setEvent] = useState<Event>({
    id: 0,
    title: '',
    image: '',
    shortDescription: '',
    fullDescription: '',
    startDate: new Date(),
    endDate: new Date(),
    paymentInfo: '',
  });
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    getEvent(+id!, setEvent);
  }, []);

  return (
    <div className="event">
      <div className="event__back" onClick={() => navigate('/events/active/')}>
        <p>Назад</p>
      </div>
      <div className="event__title">
        <p>{event.title}</p>
      </div>
      <div className="event__body">
        <img src={event.image} alt="" />
        <p>{event.fullDescription}</p>
      </div>
      {event.userParticipated && (
        <button onClick={() => {
          cancelEventParticipation(event.id).then(() => getEvent(event.id, setEvent))
        }}>
          Отменить участие в событии
        </button>
      )}
      {!event.userParticipated && (
        <button onClick={() => {
          participateInEvent(event.id).then(() => getEvent(event.id, setEvent))
        }}>
          Принять участие в событии
        </button>
      )}
    </div>
  );
};
