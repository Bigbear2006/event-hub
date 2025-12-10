import { axiosInstance } from './instance.ts';

export interface CreateFeedbackData {
  eventId: number;
  text: string;
  rating: number;
}

export const createFeedback = (data: CreateFeedbackData) => {
  return axiosInstance.post(`api/events/${data.eventId}/feedback/`, {
    text: data.text,
    rating: data.rating,
  });
};
