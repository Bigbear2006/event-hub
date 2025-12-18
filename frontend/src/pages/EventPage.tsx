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
import { Back } from '../components/Back.tsx';

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
      <Back navigateTo={'/events/my/'} />
      <div className="event__title">
        <p>{event.title}</p>
      </div>
      <div className="event__body">
        <img src={event.image} alt="" />
        <div className="event__block">
          <p>Описание</p>
          <p>{event.fullDescription}</p>
        </div>
      </div>
      <div className="event__block">
        <p className="event__block-title">Информация об оплате</p>
        <p>Информация об оплате: {event.paymentInfo}</p>
      </div>
      <div className="event__block">
        <p className="event__block-title">Мероприятие проводится</p>
        <p>
          {formatDate(event.startDate)} по {formatDate(event.endDate)} (
          {getEventStatusText(event)})
        </p>
        <p>
          {event.userParticipated
            ? 'Вы участвуете в этом мероприятии'
            : 'Вы не участвуете в этом мероприятии'}
        </p>

        <p>{getEventParticipantsCountText(event)}</p>
      </div>
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
      {!event.isActive && event.userParticipated && (
        <button onClick={() => navigate(`/event/${id}/feedback/create/`)}>
          Оставить отзыв
        </button>
      )}
      {open && (
        <div className="modal-overlay">
          <div className="modal">
            <p>Вы уверены, что хотите отменить участие?</p>
            <div className="modal-actions">
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
              <button onClick={() => setOpen(false)}>Нет</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
