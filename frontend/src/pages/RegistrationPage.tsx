import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { registerUser, type RegisterUserData } from '../api/auth.ts';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export const RegistrationPage = () => {
  const {
    register,
    watch,
    formState: { errors },
    handleSubmit,
  } = useForm<RegisterUserData>();
  const password = watch('password');
  const navigate = useNavigate();

  return (
    <div className="registration">
      <div className="registration__form-field">
        <input
          type="text"
          placeholder="ФИО"
          {...register('fullname', {
            required: 'Обязательное поле',
            minLength: { value: 5, message: 'Минимум 5 символов' },
            maxLength: { value: 50, message: 'Максимум 50 символов' },
          })}
        />
        {errors.fullname && <p className="error">{errors.fullname.message}</p>}
      </div>

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

      <div className="registration__form-field">
        <input
          type="text"
          placeholder="Пароль"
          {...register('password', { required: 'Обязательное поле' })}
        />
        {errors.password && <p className="error">{errors.password.message}</p>}
      </div>

      <div className="registration__form-field">
        <input
          type="text"
          placeholder="Повторите пароль"
          {...register('repeat_password', {
            required: 'Обязательное поле',
            validate: value => value === password || 'Пароли не совпадают',
          })}
        />
        {errors.repeat_password && (
          <p className="error">{errors.repeat_password.message}</p>
        )}
      </div>
      <button
        onClick={handleSubmit(data =>
          registerUser(data).then(
            () => {
              navigate('/login');
              toast.info(
                'Письмо с подтверждением регистрации отправлено на почту. Обязательно проверьте папку спам',
              );
            },
            () =>
              toast.error(
                'Ошибка при регистрации. Эта почта уже используется',
              ),
          ),
        )}
      >
        Зарегистрироваться
      </button>
    </div>
  );
};
