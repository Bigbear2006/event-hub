import { useForm } from 'react-hook-form';
import { createFeedback } from '../api/feedback.ts';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

interface CreateFeedbackForm {
  rating: number;
  text: string;
}

export const CreateFeedbackPage = () => {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<CreateFeedbackForm>();
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  return (
    <div className="feedback-form">
      <div className="feedback-form__field">
        <label>Оценка</label>
        <select {...register('rating')}>
          {Array(10)
            .fill(0)
            .map((_, index) => (
              <option value={10 - index}>{10 - index}</option>
            ))}
        </select>
      </div>
      <div className="feedback-form__field">
        <label>Отзыв</label>
        <textarea
          placeholder="Отзыв"
          rows={5}
          {...register('text', { required: 'Обязательное поле' })}
        />
        {errors.text && <p>{errors.text.message}</p>}
      </div>
      <button
        onClick={handleSubmit(data =>
          createFeedback({
            eventId: +eventId!,
            text: data.text,
            rating: data.rating,
          }).then(
            () => {
              navigate(`/event/${eventId}`);
              toast.info('Отзыв отправлен');
            },
            () => {
              toast.error('Что-то пошло не так...');
            },
          ),
        )}
      >
        Отправить отзыв
      </button>
    </div>
  );
};
