import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { forgotPassword, type LoginUserData } from '../api/auth.ts';
import { toast } from 'react-toastify';

export const ForgotPasswordPage = () => {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<LoginUserData>();

  return (
    <div className="registration">
      <div className="registration__form-field">
        <input
          type="text"
          placeholder="Почта"
          {...register('email', {
            required: 'Обязательное поле',
            validate: value =>
              z.email().safeParse(value).success || 'Некорректный email',
          })}
        />
        {errors.email && <p className="error">{errors.email.message}</p>}
      </div>
      <button
        onClick={handleSubmit(data =>
          forgotPassword(data).then(
            () => toast.info('Сообщение с инструкциями отправлено на почту'),
            () => toast.error('Проверьте, что ввели верную почту'),
          ),
        )}
      >
        Отправить сообщение на почту
      </button>
    </div>
  );
};
