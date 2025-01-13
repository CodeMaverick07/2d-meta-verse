const { default: axios } = require("axios");
const BACKEND_URL = "http://localhost:3000";
describe("Auth", () => {
  test("user is able to sign up only once", async () => {
    const username = "hemant" + Math.random();
    const password = "password";
    const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password,
      type: "admin",
    });
    expect(response.statusCode).toBe(200);

    const updatedResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password,
      type: "admin",
    });
    expect(updatedResponse.statusCode).toBe(400);
  });
  test("signup request fails if user name is not provided", async () => {
    const password = "password";
    const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      password,
      type: "admin",
    });
    expect(response.statusCode).toBe(400);
  });
  test("signin succeeds if the username and password are correct", async () => {
    const username = "hemant" + Math.random();
    const password = "password";
    await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password,
      type: "admin",
    });
    const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      username,
      password,
    });
    expect(response.statusCode).toBe(200);
    expect(response.body.token).toBeDefined();
  });
  test("signin fails if the username and password are incorrect", async () => {
    const username = "hemant" + Math.random();
    const password = "password";
    await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password,
      type: "admin",
    });
    const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      username,
      password: "wrongpassword",
    });
    expect(response.statusCode).toBe(403);
  });
});

describe("user information endpoints", () => {
  let token = "";
  beforeAll(async () => {
    const username = "hemant" + Math.random();
    const password = "password";

    await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password,
      type: "admin",
    });
    const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      username,
      password,
    });
    token = response.data.token;
  });

  test("user can't update their metadata with a wrong avatar id", async () => {
    const response = await axios.put(`${BACKEND_URL}/api/v1/user`, {
      avatarId: "wrongId",
    });
    expect(response.statusCode).toBe(400);
  });
});
