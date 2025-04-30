const request = require("supertest");
const app     = require("../../src");
const { User } = require("../../src/models");
const bcrypt  = require("bcryptjs");
const StatusCodes = require("../../src/constants/statusCodes");

describe("Login flow", () => {
  const email = "bob@test.com";
  const pass  = "password123";

  beforeEach(async () => {
    await User.destroy({ where: {} }); // Limpiar la base de datos antes de cada test
    await User.create({
      name: "Bob",
      lastname: "Builder",
      email,
      password_hash: pass,
      role: "Patient",
      dni: "2",
    });
  });

  it("returns token on valid credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email, password: pass })
      .expect(StatusCodes.OK);

    expect(res.body.statusCode).toBe(StatusCodes.OK);
    expect(res.body.data).toHaveProperty("accessToken");
    expect(res.body.data).toHaveProperty("email", email);
    expect(res.body.data).toHaveProperty("role", "Patient");
    expect(res.body.data).toHaveProperty("id");
  });

  it("401 on wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email, password: "wrong" })
      .expect(StatusCodes.UNAUTHORIZED);

    expect(res.body.statusCode).toBe(StatusCodes.UNAUTHORIZED);
    expect(res.body.data).toHaveProperty("message", "Contraseña inválida");
  });

  it("404 on non-existent user", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nonexistent@test.com", password: pass })
      .expect(StatusCodes.NOT_FOUND);

    expect(res.body.statusCode).toBe(StatusCodes.NOT_FOUND);
    expect(res.body.data).toHaveProperty("message", "Usuario no encontrado");
  });
});