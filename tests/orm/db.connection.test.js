const { sequelize } = require("../../src/models");

describe("DB connection", () => {
  it("authenticate() should succeed", async () => {
    await expect(sequelize.authenticate()).resolves.not.toThrow();
  });
});