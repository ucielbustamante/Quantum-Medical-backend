const request = require("supertest");
const app = require("../../src");
const { User } = require("../../src/models");
const StatusCodes = require("../../src/constants/statusCodes");

describe("POST /api/auth/register", () => {
  const validUserData = {
    name: "Alice",
    lastname: "Wonder",
    email: "alice@test.com",
    password: "secret123",
    role: "Patient",
    dni: "123",
  };

  beforeEach(async () => {
    await User.destroy({ where: {} }); // Limpiar la base de datos antes de cada test
  });

  it("should create patient user and return 201", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send(validUserData)
      .expect(StatusCodes.CREATED);

    expect(res.body.statusCode).toBe(StatusCodes.CREATED);
    expect(res.body.data).toHaveProperty("accessToken");
    expect(res.body.data).toHaveProperty("email", validUserData.email);
    expect(res.body.data).toHaveProperty("role", "Patient");
    expect(res.body.data).toHaveProperty("id");

    // Verificar que el usuario se creó en la base de datos
    const user = await User.findOne({ where: { email: validUserData.email } });
    expect(user).toBeTruthy();
    expect(user.role).toBe("Patient");
  });

  it("should create doctor user and return 201", async () => {
    const doctorData = { ...validUserData, role: "Doctor", email: "doctor@test.com" };
    const res = await request(app)
      .post("/api/auth/register")
      .send(doctorData)
      .expect(StatusCodes.CREATED);

    expect(res.body.statusCode).toBe(StatusCodes.CREATED);
    expect(res.body.data).toHaveProperty("role", "Doctor");

    const user = await User.findOne({ where: { email: doctorData.email } });
    expect(user).toBeTruthy();
    expect(user.role).toBe("Doctor");
  });

  it("should return 400 when email already exists", async () => {
    // Primer registro
    await request(app)
      .post("/api/auth/register")
      .send(validUserData);

    // Intentar registrar el mismo email
    const res = await request(app)
      .post("/api/auth/register")
      .send(validUserData)
      .expect(StatusCodes.BAD_REQUEST);

    expect(res.body.statusCode).toBe(StatusCodes.BAD_REQUEST);
    expect(res.body.data).toHaveProperty("message");
  });

  it("should return 400 when required fields are missing", async () => {
    const invalidData = {
      name: "Alice",
      // Falta el apellido y otros campos requeridos
    };

    const res = await request(app)
      .post("/api/auth/register")
      .send(invalidData)
      .expect(StatusCodes.BAD_REQUEST);

    expect(res.body.statusCode).toBe(StatusCodes.BAD_REQUEST);
    expect(res.body.data).toHaveProperty("message");
  });
});