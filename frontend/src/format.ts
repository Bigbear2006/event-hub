import { type Event } from './api/event.ts';

export const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);

export const getEventStatusText = (event: Event): string => {
  return event.isActive ? 'Активное' : 'Прошедшее';
};

export const getEventParticipantsCountText = (event: Event): string => {
  if (event.maxParticipantsCount) {
    return `${event.participantsCount} участников из ${event.maxParticipantsCount}`;
  } else {
    return `${event.participantsCount} участников`;
  }
};
