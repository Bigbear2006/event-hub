import { useForm } from 'react-hook-form';
import { createEvent, type CreateEventData } from '../api/event.ts';
import { Back } from '../components/Back.tsx';

export const CreateEventPage = () => {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<CreateEventData>();

  return (
    <>
      <Back navigateTo={'/events/my/'} />
      <div className="form">
        <div className="form__field">
          <label>Название</label>
          <input
            type="text"
            {...register('title', { required: 'Обязательное поле' })}
          />
          {errors.title && <p>{errors.title.message}</p>}
        </div>

        <div className="form__field">
          <label>Изображение (URL)</label>
          <input
            type="text"
            {...register('image', { required: 'Обязательное поле' })}
          />
          {errors.image && <p>{errors.image.message}</p>}
        </div>

        <div className="form__field">
          <label>Краткое описание</label>
          <textarea {...register('shortDescription')} rows={3} />
        </div>

        <div className="form__field">
          <label>Полное описание</label>
          <textarea
            {...register('fullDescription', { required: 'Обязательное поле' })}
            rows={6}
          />
          {errors.fullDescription && <p>{errors.fullDescription.message}</p>}
        </div>

        <div className="form__field">
          <label>Дата начала</label>
          <input
            type="datetime-local"
            {...register('startDate', { required: 'Обязательное поле' })}
          />
          {errors.startDate && <p>{errors.startDate.message}</p>}
        </div>

        <div className="form__field">
          <label>Дата окончания</label>
          <input
            type="datetime-local"
            {...register('endDate', { required: 'Обязательное поле' })}
          />
          {errors.endDate && <p>{errors.endDate.message}</p>}
        </div>

        <div className="form__field">
          <label>Информация об оплате</label>
          <textarea {...register('paymentInfo')} rows={3} />
        </div>

        <div className="form__field">
          <label>Максимальное количество участников</label>
          <input type="number" min="1" {...register('maxParticipantsCount')} />
        </div>

        <button onClick={handleSubmit(createEvent)}>Создать событие</button>
      </div>
    </>
  );
};
