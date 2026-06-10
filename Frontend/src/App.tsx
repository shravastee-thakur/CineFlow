import { Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import MainLayout from "./components/MainLayout";
import RegisterPage from "./pages/User/Register";
import LoginPage from "./pages/User/Login";
import VerifyOTPPage from "./pages/User/VerifyLogin";
import ForgetPasswordPage from "./pages/User/ForgetPassword";
import ResetPasswordPage from "./pages/User/ResetPassword";

import Home from "./pages/Home";
import UserProfilePage from "./pages/User/UserProfilePage";
import AdminPage from "./pages/Admin";
import MovieDetailsPage from "./pages/MovieDetails";
import BookTicketsPage from "./pages/BookTicketsPage";
import SeatSelectionPage from "./pages/SeatSelectionPage";
import PaymentPage from "./pages/PaymentPage";

const App = () => {
  return (
    <div>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/verifyOtp" element={<VerifyOTPPage />} />
        <Route path="/forget-password" element={<ForgetPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<UserProfilePage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/movie/:id" element={<MovieDetailsPage />} />
          <Route path="/book/:id" element={<BookTicketsPage />} />
          <Route
            path="/seat-selection/:showId"
            element={<SeatSelectionPage />}
          />
          <Route path="/payment" element={<PaymentPage />} />
        </Route>
      </Routes>
    </div>
  );
};

export default App;
