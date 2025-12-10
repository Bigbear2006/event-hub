import {
  cancelEventParticipation,
  type Event,
  getEvent,
  participateInEvent,
} from '../api/event.ts';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  formatDate,
  getEventParticipantsCountText,
  getEventStatusText,
} from '../format.ts';
import { toast } from 'react-toastify';
import BackIcon from '../assets/back-icon.svg';

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
    participantsCount: 0,
    isActive: false,
  });
  const [open, setOpen] = useState(false);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    getEvent(+id!, setEvent);
  }, []);

  return (
    <div className="event">
      <div className="event__back" onClick={() => navigate('/events/my/')}>
        <img src={BackIcon} alt="" width="30" height="30" />
      </div>
      <div className="event__title">
        <p>{event.title}</p>
      </div>
      <div className="event__body">
        <img src={event.image} alt="" />
        <div>
          <p>Описание</p>
          <p>{event.fullDescription}</p>
        </div>
      </div>
      <p>Информация об оплате: {event.paymentInfo}</p>
      <p>
        Мероприятие проводится с {formatDate(event.startDate)} по{' '}
        {formatDate(event.endDate)}
      </p>
      <p>
        {event.userParticipated
          ? 'Вы участвуете в этом мероприятии'
          : 'Вы не участвуете в этом мероприятии'}
      </p>
      <p>{getEventParticipantsCountText(event)}</p>
      <p>Статус: {getEventStatusText(event)}</p>
      {event.isActive && event.userParticipated && (
        <button
          onClick={() => {
            setOpen(true);
          }}
        >
          Отменить участие
        </button>
      )}
      {event.isActive && !event.userParticipated && (
        <button
          onClick={() => {
            participateInEvent(event.id).then(
              () => getEvent(event.id, setEvent),
              error =>
                toast.error(
                  error.response.status === 429
                    ? 'Вы только что приняли участие в этом событии, и затем отменили его. ' +
                        'Попробуйте еще раз через минуту'
                    : 'Достигнут максимальный лимит участников',
                ),
            );
          }}
        >
          Подтвердить участие
        </button>
      )}
      {open && (
        <div className="event__modal-overlay">
          <div className="event__modal">
            <p>Вы уверены, что хотите отменить участие?</p>
            <div className="event__modal-actions">
              <button
                onClick={() => {
                  setOpen(false);
                  cancelEventParticipation(event.id).then(() =>
                    getEvent(event.id, setEvent),
                  );
                }}
              >
                Да
              </button>
              <button
                className="event__confirm-cancel"
                onClick={() => setOpen(false)}
              >
                Нет
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
