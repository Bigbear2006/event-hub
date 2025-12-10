import { useForm } from 'react-hook-form';
import { resetPassword } from '../api/auth.ts';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';

interface ResetPasswordData {
  password: string;
  repeat_password: string;
}

export const ResetPasswordPage = () => {
  const {
    register,
    watch,
    formState: { errors },
    handleSubmit,
  } = useForm<ResetPasswordData>();
  const password = watch('password');
  const navigate = useNavigate();
  const [params, _] = useSearchParams();

  return (
    <div className="registration">
      <p>Придумайте новый пароль</p>
      <div className="registration__form-field">
        <input
          type="password"
          placeholder="Пароль"
          {...register('password', {
            required: 'Обязательное поле',
            minLength: {
              value: 8,
              message: 'Минимум 8 символов',
            },
            pattern: {
              value: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^\w\s]).{8,}$/,
              message:
                'Пароль должен содержать латинские буквы, цифры и символы',
            },
          })}
        />
        {errors.password && <p className="error">{errors.password.message}</p>}
      </div>

      <div className="registration__form-field">
        <input
          type="password"
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
          resetPassword({
            userId: +params.get('user_id')!,
            token: params.get('token')!,
            password: data.password,
          }).then(
            () => {
              navigate('/login');
              toast.info('Пароль изменен');
            },
            () =>
              toast.error(
                'Не удалось поменять пароль. Запросите ссылку на смену пароля еще раз',
              ),
          ),
        )}
      >
        Поменять пароль
      </button>
    </div>
  );
};
