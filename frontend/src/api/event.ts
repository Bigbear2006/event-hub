import { axiosInstance } from './instance.ts';

interface EventResponse {
  id: number;
  title: string;
  image: string;
  short_description: string;
  full_description: string;
  start_date: string;
  end_date: string;
  payment_info: string;
  participants_count: number;
  max_participants_count?: number;
  user_participated?: boolean;
  is_active: boolean;
}

export interface Event {
  id: number;
  title: string;
  image: string;
  shortDescription: string;
  fullDescription: string;
  startDate: Date;
  endDate: Date;
  paymentInfo: string;
  participantsCount: number;
  maxParticipantsCount?: number;
  userParticipated?: boolean;
  isActive: boolean;
}

const mapEvent = (event: EventResponse): Event => {
  return {
    id: event.id,
    title: event.title,
    image: event.image,
    shortDescription: event.short_description,
    fullDescription: event.full_description,
    startDate: new Date(event.start_date),
    endDate: new Date(event.end_date),
    paymentInfo: event.payment_info,
    participantsCount: event.participants_count,
    maxParticipantsCount: event.max_participants_count,
    userParticipated: event.user_participated,
    isActive: event.is_active,
  };
};

export const getEvents = (
  eventType: string,
  callback: (events: Event[]) => void,
) => {
  axiosInstance
    .get<EventResponse[]>('api/events/', { params: { type: eventType } })
    .then(rsp => {
      callback(rsp.data.map(elem => mapEvent(elem)));
    });
};

export const getEvent = (
  eventId: number,
  callback: (event: Event) => void,
) => {
  axiosInstance
    .get(`api/events/${eventId}/`)
    .then(rsp => callback(mapEvent(rsp.data)));
};

export const participateInEvent = (eventId: number) => {
  return axiosInstance.post(`api/events/${eventId}/participate/`);
};

export const cancelEventParticipation = (eventId: number) => {
  return axiosInstance.delete(`api/events/${eventId}/participate/`);
};
