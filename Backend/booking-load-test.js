import http from "k6/http";
import { check } from "k6";
import { Counter } from "k6/metrics";

const successfulBookings = new Counter("successful_bookings");

export const options = {
  scenarios: {
    seat_race_test: {
      executor: "constant-vus",
      vus: 100,
      duration: "10s",
    },
  },
  thresholds: {
    // Relaxed latency thresholds. We are testing data integrity here, not speed.
    http_req_duration: ["p(95)<2000", "p(99)<3000"],
    checks: ["rate>0.99"],
    successful_bookings: ["count==1"], // THE CRITICAL ASSERTION
  },
};

const BASE_URL = "http://localhost:5000/api/v1/bookings";

// YOU MUST REPLACE THESE WITH REAL DATA FROM YOUR DATABASE
const VALID_SHOW_ID = "6a25397907a20589d9129334"; // Must be a real 24-char ObjectId from your 'shows' collection
const VALID_JWT_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhMGMyYThhYmI3YzdiMjA5ODUyNzgyNyIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MDkwNDg4MywiZXhwIjoxNzgxNTA5NjgzfQ.y0F3EuCC1QPbiZBV0P8UwV_GUFLnu18ObXLUlOpM2uA"; // Must be a real, unexpired JWT for your test user

export default function () {
  const payload = JSON.stringify({
    showId: VALID_SHOW_ID,
    seats: ["A1"], // All 100 VUs attack the exact same seat simultaneously
  });

  const params = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${VALID_JWT_TOKEN}`,
    },
  };

  const res = http.post(`${BASE_URL}/createBooking`, payload, params);

  if (res.status === 201) {
    successfulBookings.add(1);
  }

  check(res, {
    "success or conflict": (r) =>
      r.status === 201 || r.status === 409 || r.status === 400,
  });
}
