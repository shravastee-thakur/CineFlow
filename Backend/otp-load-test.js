import http from "k6/http";
import { check } from "k6";

export const options = {
  vus: 50,
  duration: "30s",
  thresholds: {
    http_req_duration: ["p(95)<500", "p(99)<1000"],
  },
};

// Change this if your server runs on a different port
const BASE_URL = "http://localhost:5000/api/v1/users";

export default function () {
  // Adjust the key to 'phone' or 'email' based on what your loginStepOne controller expects
  const payload = JSON.stringify({
    email: "sakshi@yopmail.com",
    password: "123456",
  });

  const params = {
    headers: { "Content-Type": "application/json" },
  };

  // This hits the exact endpoint that triggers your BullMQ email job
  const res = http.post(`${BASE_URL}/loginStepOne`, payload, params);

  check(res, {
    "OTP generation successful": (r) => r.status === 200 || r.status === 201,
  });
}
