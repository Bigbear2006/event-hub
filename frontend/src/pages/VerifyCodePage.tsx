import { useForm } from 'react-hook-form';
import { sendVerificationCode, verifyCode } from '../api/auth.ts';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';

interface VerifyCodeForm {
  code: number;
}

export const VerifyCodePage = () => {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<VerifyCodeForm>();
  const navigate = useNavigate();
  const [params, _] = useSearchParams();

  return (
    <div className="registration">
      <div className="registration__form-field">
        <input
          type="password"
          placeholder="Код подтверждения"
          {...register('code', {
            required: 'Обязательное поле',
          })}
        />
        {errors.code && <p className="error">{errors.code.message}</p>}
      </div>

      <button
        onClick={handleSubmit(data =>
          verifyCode({
            user_id: +params.get('user_id')!,
            code: data.code,
          }).then(
            () => {
              navigate('/login');
              toast.info('Теперь вы можете войти в свой аккаунт');
            },
            () => toast.error('Неверный код'),
          ),
        )}
      >
        Зарегистрироваться
      </button>
      <p
        onClick={() =>
          sendVerificationCode(+params.get('user_id')!).then(
            () => toast.info('Код отправлен ещё раз'),
            () =>
              toast.error(
                'Код нельзя запрашивать так часто. Подождите и попробуйте еще раз',
              ),
          )
        }
      >
        Код не пришел, запросить ещё раз
      </p>
      <a href="/login">Уже есть аккаунт</a>
    </div>
  );
};
