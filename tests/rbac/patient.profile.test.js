const request = require("supertest");
const app = require("../../src");
const { User, Patient } = require("../../src/models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { secret, expiresIn } = require("../../src/config/auth.config");
const { StatusCodes } = require("http-status-codes");

describe("Protected route /api/rbac/patient/profile", () => {
  let token, userId;

  beforeEach(async () => {
    const user = await User.create({
      name: "Patient",
      lastname: "Demo",
      email: "pat2@test.com",
      password_hash: await bcrypt.hash("pat123", 10),
      role: "Patient",
      dni: "7",
    });

    await Patient.create({
      user_id: user.id
    });

    userId = user.id;
    token = jwt.sign({ id: user.id, role: "Patient" }, secret, { expiresIn });
  });

  it("returns 200 and patient profile for Patient role", async () => {
    const res = await request(app)
      .get("/api/rbac/patient/profile")
      .set("Authorization", `Bearer ${token}`)
      .expect(StatusCodes.OK);

    expect(res.body.statusCode).toBe(StatusCodes.OK);
    expect(res.body.data).toHaveProperty("user");
    expect(res.body.data.user).toHaveProperty("id", userId);
    expect(res.body.data.user).toHaveProperty("role", "Patient");
    expect(res.body.data.user).toHaveProperty("name", "Patient");
    expect(res.body.data.user).toHaveProperty("lastname", "Demo");
    expect(res.body.data.user).toHaveProperty("email", "pat2@test.com");
  });

  it("returns 403 for Doctor role", async () => {
    const doctorToken = jwt.sign({ id: "x", role: "Doctor" }, secret, { expiresIn });
    const res = await request(app)
      .get("/api/rbac/patient/profile")
      .set("Authorization", `Bearer ${doctorToken}`)
      .expect(StatusCodes.FORBIDDEN);

    expect(res.body.statusCode).toBe(StatusCodes.FORBIDDEN);
    expect(res.body.data).toHaveProperty("message", "Requiere rol Patient");
  });

  it("returns 401 for invalid token", async () => {
    const res = await request(app)
      .get("/api/rbac/patient/profile")
      .set("Authorization", "Bearer invalid_token")
      .expect(StatusCodes.UNAUTHORIZED);

    expect(res.body.statusCode).toBe(StatusCodes.UNAUTHORIZED);
    expect(res.body.data).toHaveProperty("message", "Token inválido o expirado");
  });

  it("returns 403 when no token is provided", async () => {
    const res = await request(app)
      .get("/api/rbac/patient/profile")
      .expect(StatusCodes.FORBIDDEN);

    expect(res.body.statusCode).toBe(StatusCodes.FORBIDDEN);
    expect(res.body.data).toHaveProperty("message", "No token proporcionado");
  });

  it("returns 403 for malformed Authorization header", async () => {
    const res = await request(app)
      .get("/api/rbac/patient/profile")
      .set("Authorization", "Invalid_Format_Token")
      .expect(StatusCodes.FORBIDDEN);

    expect(res.body.statusCode).toBe(StatusCodes.FORBIDDEN);
    expect(res.body.data).toHaveProperty("message", "No token proporcionado");
  });
});