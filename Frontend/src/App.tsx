import { Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import MainLayout from "./components/MainLayout";
import RegisterPage from "./pages/User/Register";
import LoginPage from "./pages/User/Login";
import VerifyOTPPage from "./pages/User/VerifyLogin";
import ForgetPasswordPage from "./pages/User/ForgetPassword";
import ResetPasswordPage from "./pages/User/ResetPassword";

import Home from "./pages/Home";
import UserProfilePage from "./pages/User/Profile";
import AdminPage from "./pages/Admin";

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
        </Route>
      </Routes>
    </div>
  );
};

export default App;
