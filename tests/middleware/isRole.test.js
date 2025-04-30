const { isRole } = require("../../src/middlewares/authjwt");
const httpMocks = require("node-mocks-http");
const StatusCodes = require("../../src/constants/statusCodes");

describe("isRole middleware", () => {
  let req, res, next;

  beforeEach(() => {
    next = jest.fn();
    res = httpMocks.createResponse({
      eventEmitter: require('events').EventEmitter
    });
  });

  it("grants access to allowed role", () => {
    req = httpMocks.createRequest({ userRole: "Admin" });
    isRole("Admin")(req, res, next);
    
    expect(next).toHaveBeenCalled();
    expect(res.statusCode).toBe(StatusCodes.OK);
  });

  it("denies access to wrong role", () => {
    req = httpMocks.createRequest({ userRole: "Patient" });
    isRole("Admin")(req, res, next);
    
    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(StatusCodes.FORBIDDEN);
    
    const responseData = res._getJSONData();
    expect(responseData.statusCode).toBe(StatusCodes.FORBIDDEN);
    expect(responseData.data).toHaveProperty("message", "Requiere rol Admin");
  });

  it("grants access when multiple roles are allowed", () => {
    req = httpMocks.createRequest({ userRole: "Doctor" });
    isRole(["Admin", "Doctor"])(req, res, next);
    
    expect(next).toHaveBeenCalled();
    expect(res.statusCode).toBe(StatusCodes.OK);
  });

  it("denies access when role is not in allowed roles array", () => {
    req = httpMocks.createRequest({ userRole: "Patient" });
    isRole(["Admin", "Doctor"])(req, res, next);
    
    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(StatusCodes.FORBIDDEN);
    
    const responseData = res._getJSONData();
    expect(responseData.statusCode).toBe(StatusCodes.FORBIDDEN);
    expect(responseData.data).toHaveProperty("message", "Requiere rol Admin,Doctor");
  });

  it("handles case when userRole is not set", () => {
    req = httpMocks.createRequest({});
    isRole("Admin")(req, res, next);
    
    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(StatusCodes.FORBIDDEN);
    
    const responseData = res._getJSONData();
    expect(responseData.statusCode).toBe(StatusCodes.FORBIDDEN);
    expect(responseData.data).toHaveProperty("message", "Requiere rol Admin");
  });
});