import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { registerUser, type RegisterUserData } from '../api/auth.ts';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';

export const RegistrationPage = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const {
    register,
    watch,
    formState: { errors },
    handleSubmit,
  } = useForm<RegisterUserData>();
  const password = watch('password');
  const navigate = useNavigate();

  const acceptCookies = (value: string) => {
    setModalIsOpen(false);
    localStorage.setItem('cookies-agreement', value);
  };

  useEffect(() => {
    if (!localStorage.getItem('cookies-agreement')) {
      setModalIsOpen(true);
    }
  }, []);

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
            pattern: {
              value: /^[А-Яа-яЁё\s-]+$/,
              message: 'ФИО должно содержать только русские буквы',
            },
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
          registerUser(data).then(
            rsp => {
              navigate(`/verify-code/?user_id=${rsp.data.id}`);
              toast.info(
                'Письмо с кодом подтверждением регистрации отправлено на почту. Обязательно проверьте папку спам',
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
      <a href="/login">Уже есть аккаунт</a>
      {modalIsOpen && (
        <div className="modal-overlay">
          <div className="modal cookies-modal">
            <p>
              Посещая этот сайт, вы соглашаетесь с нашей{' '}
              <a href="/privacy-policy/" target="_blank">
                политикой конфиденциальности
              </a>
              {' '}и соглашаетесь с использованием Cookie
            </p>
            <div className="modal-actions">
              <button onClick={() => acceptCookies('all')}>Принять все</button>
              <button onClick={() => acceptCookies('necessary')}>
                Только необходимые
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
