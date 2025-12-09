import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './styles/main.scss';
import { RegistrationPage } from './pages/RegistrationPage.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { EventsListPage } from './pages/EventsListPage.tsx';
import { EventPage } from './pages/EventPage.tsx';
import { ToastContainer } from 'react-toastify';

export const App = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RegistrationPage />} />
          <Route path="login/" element={<LoginPage />} />
          <Route path="events/:eventType" element={<EventsListPage />} />
          <Route path="event/:id" element={<EventPage />} />
        </Routes>
      </BrowserRouter>
      <ToastContainer theme="dark" />
    </>
  );
};
