import BackIcon from '../assets/back-icon.svg';
import { useNavigate } from 'react-router-dom';

interface BackOptions {
  navigateTo: string;
}

export const Back = ({ navigateTo }: BackOptions) => {
  const navigate = useNavigate();
  return (
    <div className="back" onClick={() => navigate(navigateTo)}>
      <img src={BackIcon} alt="" width="30" height="30" />
    </div>
  );
};
