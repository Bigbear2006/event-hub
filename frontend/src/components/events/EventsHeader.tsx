import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export const EventsHeader = () => {
  const items = [
    { title: 'Активные события', path: '/events/active' },
    { title: 'Мои события', path: '/events/my' },
    { title: 'Прошедшие события', path: '/events/past' },
  ];
  const [currentItem, setCurrentItem] = useState<number>(0);
  const navigate = useNavigate();

  return (
    <div className="events-header">
      {items.map((elem, index) => (
        <div
          key={index}
          className={
            index == currentItem
              ? 'events-header__item events-header__item--active'
              : 'events-header__item'
          }
          onClick={() => {
            setCurrentItem(index);
            navigate(elem.path);
          }}
        >
          <p>{elem.title}</p>
        </div>
      ))}
    </div>
  );
};
