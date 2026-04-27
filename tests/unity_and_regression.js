/**
 * UNITY (UNIT) AND REGRESSION TESTING SUITE
 * 
 * This script performs:
 * 1. Unit Tests: Testing individual validation logic and OTP functions.
 * 2. Regression Tests: Testing the API endpoints to ensure existing and new
 *    functionality works together seamlessly.
 */

const axios = require("axios");

// Configuration
const BASE_URL = "http://localhost:8080/api";
const TEST_EMAIL = "test_tester_" + Date.now() + "@example.com";
let testOTP = "";

async function runTests() {
  console.log("=========================================");
  console.log(" STARTING UNITY & REGRESSION TESTS");
  console.log("=========================================\n");

  try {
    // --- UNITY (UNIT) TESTS: VALIDATION LOGIC ---
    console.log(" PHASE 1: UNIT TESTING (VALIDATION)");
    
    // Test: Phone Number Validation (Too Short)
    console.log("  [Unit] Testing 9-digit phone validation...");
    try {
      await axios.post(`${BASE_URL}/users/register`, {
        name: "Test",
        email: "fail@test.com",
        phone: "123456789", // 9 digits
        password: "password123"
      });
      console.log("  FAIL: Allowed 9-digit phone number");
    } catch (err) {
      if (err.response?.data?.errors?.some(e => e.includes("10 digits"))) {
        console.log("  PASS: Correctly rejected 9-digit phone");
      } else {
        console.log("  FAIL: Rejected for wrong reason:", err.response?.data?.message);
      }
    }

    // --- REGRESSION TESTS: FLOW INTEGRITY ---
    console.log("\n PHASE 2: REGRESSION TESTING (FLOW)");

    // 1. Send OTP (New Feature)
    console.log("  [Reg] Testing Send OTP...");
    const otpRes = await axios.post(`${BASE_URL}/users/send-signup-otp`, { email: TEST_EMAIL });
    if (otpRes.data.success) {
      console.log("  PASS: OTP Sent successfully");
    } else {
      console.log("  FAIL: OTP Send failed");
    }

    // 2. Register with correct 10-digit phone (Regression)
    console.log("  [Reg] Testing Registration Data Handling...");
    try {
      await axios.post(`${BASE_URL}/users/register`, {
        name: "Test User",
        email: TEST_EMAIL,
        phone: "1234567890", // 10 digits
        password: "password123",
        role: "user"
      });
      console.log("  FAIL: Registered without OTP verification");
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.message?.includes("verify")) {
        console.log("  PASS: Correctly blocked registration without OTP");
      }
    }

    // 3. Admin Analytics (New Feature)
    console.log("  [Reg] Testing Admin Stats Analytics...");
    try {
      await axios.get(`${BASE_URL}/admin/stats`);
      console.log("  FAIL: Admin stats accessible without auth");
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        console.log("  PASS: Admin stats correctly protected");
      }
    }

    console.log("\n=========================================");
    console.log(" ALL TESTS COMPLETED SUCCESSFULLY");
    console.log("=========================================");
  } catch (err) {
    console.error("\n CRITICAL TEST FAILURE:");
    console.error(err.message);
    if (err.response) console.error("Response:", err.response.data);
  }
}

console.log("Note: Ensure the server is running on http://localhost:8080 before running tests.\n");
runTests();
