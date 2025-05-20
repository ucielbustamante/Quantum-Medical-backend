const request = require("supertest");
const app     = require("../../src/index");
const { User } = require("../../src/models");
const { StatusCodes } = require("http-status-codes");

describe("Login flow", () => {
  const email = "bob@test.com";
  const pass  = "password123";

  beforeEach(async () => {
    console.log('Starting login test setup...');
    await User.destroy({ where: {} });
    console.log('Cleaned existing users');
    
    const userData = {
      name: "Bob",
      lastname: "Builder",
      email,
      password_hash: pass,
      role: "Patient",
      dni: "2",
      is_active: true
    };
    console.log('Attempting to create test user with data:', userData);
    
    const user = await User.create(userData);
    console.log('Test user created successfully:', user.toJSON());
  });

  afterEach(async () => {
    console.log('Cleaning up test user...');
    await User.destroy({ where: {} });
    console.log('Test user cleaned up');
  });

  it("returns token on valid credentials", async () => {
    console.log('Testing login with valid credentials...');
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email, password: pass })
      .expect(StatusCodes.OK);

    console.log('Login response:', res.body);
    expect(res.body).toHaveProperty("statusCode", StatusCodes.OK);
    expect(res.body).toHaveProperty("data");
    expect(res.body.data).toHaveProperty("accessToken");
    expect(res.body.data).toHaveProperty("email", email);
    expect(res.body.data).toHaveProperty("role", "Patient");
    expect(res.body.data).toHaveProperty("id");
  });

  it("401 on wrong password", async () => {
    console.log('Testing login with wrong password...');
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email, password: "wrong" })
      .expect(StatusCodes.UNAUTHORIZED);

    console.log('Login response:', res.body);
    expect(res.body).toHaveProperty("statusCode", StatusCodes.UNAUTHORIZED);
    expect(res.body).toHaveProperty("data");
    expect(res.body.data).toHaveProperty("message", "Contraseña inválida");
  });

  it("404 on non-existent user", async () => {
    console.log('Testing login with non-existent user...');
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nonexistent@test.com", password: pass })
      .expect(StatusCodes.NOT_FOUND);

    console.log('Login response:', res.body);
    expect(res.body).toHaveProperty("statusCode", StatusCodes.NOT_FOUND);
    expect(res.body).toHaveProperty("data");
    expect(res.body.data).toHaveProperty("message", "User no encontrado");
  });
});
