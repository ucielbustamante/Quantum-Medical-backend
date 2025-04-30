const { User, Patient, Doctor } = require("../../src/models");

describe("Model relations", () => {
  it("Patient.belongsTo(User) FK works", async () => {
    const user = await User.create({
      name: "Neo",
      lastname: "Anderson",
      email: "neo@matrix.io",
      password_hash: "dummy123",
      role: "Patient",
      dni: "999",
    });

    const patient = await Patient.create({ user_id: user.id });
    const loaded  = await patient.getUser();

    expect(loaded.email).toBe("neo@matrix.io");
  });

  it("Doctor.belongsTo(User) FK works", async () => {
    const user = await User.create({
      name: "Morpheus",
      lastname: "Matrix",
      email: "morpheus@matrix.io",
      password_hash: "dummy123",
      role: "Doctor",
      dni: "888",
    });

    const doctor = await Doctor.create({ user_id: user.id });
    const loaded = await doctor.getUser();

    expect(loaded.email).toBe("morpheus@matrix.io");
  });
});