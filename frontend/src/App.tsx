import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './styles/main.scss';
import { RegistrationPage } from './pages/RegistrationPage.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { EventsListPage } from './pages/EventsListPage.tsx';
import { EventPage } from './pages/EventPage.tsx';
import { ToastContainer } from 'react-toastify';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage.tsx';
import { ResetPasswordPage } from './pages/ResetPasswordPage.tsx';
import { VerifyCodePage } from './pages/VerifyCodePage.tsx';
import { Theme } from './components/Theme.tsx';
import { CreateFeedbackPage } from './pages/CreateFeedbackPage.tsx';

export const App = () => {
  return (
    <>
      <BrowserRouter>
        <Theme />
        <Routes>
          <Route path="/" element={<RegistrationPage />} />
          <Route path="verify-code/" element={<VerifyCodePage />} />
          <Route path="login/" element={<LoginPage />} />
          <Route path="events/:eventType" element={<EventsListPage />} />
          <Route path="event/:id" element={<EventPage />} />
          <Route
            path="event/:eventId/feedback/create/"
            element={<CreateFeedbackPage />}
          />
          <Route path="forgot-password/" element={<ForgotPasswordPage />} />
          <Route path="reset-password/" element={<ResetPasswordPage />} />
        </Routes>
      </BrowserRouter>
      <ToastContainer theme="dark" />
    </>
  );
};
