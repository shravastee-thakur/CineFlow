// import Navbar from "./components/Navbar";
import { Toaster } from "react-hot-toast";
import RegisterPage from "./pages/User/Register";
import { Route, Routes } from "react-router-dom";
import LoginPage from "./pages/User/Login";

import VerifyOTPPage from "./pages/User/VerifyLogin";

const App = () => {
  return (
    <div>
      <Toaster position="top-right" reverseOrder={false} />
      {/* <Navbar /> */}
      <Routes>
        <Route path="/" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/verifyOtp" element={<VerifyOTPPage />} />
      </Routes>
    </div>
  );
};

export default App;
