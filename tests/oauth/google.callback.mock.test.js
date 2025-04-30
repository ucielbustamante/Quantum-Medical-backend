jest.mock("passport", () => ({
  authenticate: () => (_req, _res, next) => {
    _req.user = { id: "mock-id", role: "Patient" };
    next();
  },
  initialize: () => (_req, _res, next) => next(),
  use: jest.fn(),
}));

const request = require("supertest");
const app = require("../../src");
const jwt = require("jsonwebtoken");
const { secret } = require("../../src/config/auth.config");

describe("Google OAuth callback", () => {
  it("redirects with JWT param", async () => {
    const res = await request(app)
      .get("/api/auth/google/callback")
      .expect(302);

    const url = new URL(res.headers.location);
    const token = url.searchParams.get("token");
    const decoded = jwt.verify(token, secret);

    expect(decoded).toHaveProperty("id", "mock-id");
  });
});