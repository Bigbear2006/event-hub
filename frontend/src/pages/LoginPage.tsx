import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { loginUser, type LoginUserData } from '../api/auth.ts';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export const LoginPage = () => {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<LoginUserData>();
  const navigate = useNavigate();

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
      <div className="registration__form-field">
        <input
          type="text"
          placeholder="Пароль"
          {...register('password', { required: 'Обязательное поле' })}
        />
        {errors.password && <p className="error">{errors.password.message}</p>}
      </div>
      <button
        onClick={handleSubmit(data =>
          loginUser(data).then(
            () => navigate('/events/active/'),
            () => toast.error('Проверьте, что ввели верные почту и пароль'),
          ),
        )}
      >
        Войти
      </button>
      <a href="/forgot-password">Забыли пароль?</a>
      <a href="/admin">Войти как администратор</a>
    </div>
  );
};
