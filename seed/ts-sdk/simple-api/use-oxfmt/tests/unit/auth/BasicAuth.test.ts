import { BasicAuth } from "../../../src/core/auth/BasicAuth";

describe("BasicAuth", () => {
  describe("toAuthorizationHeader", () => {
    it("correctly converts to header", () => {
      expect(
        BasicAuth.toAuthorizationHeader({
          username: "username",
          password: "password",
        }),
      ).toBe("Basic dXNlcm5hbWU6cGFzc3dvcmQ=");
    });
  });
  describe("fromAuthorizationHeader", () => {
    it("correctly parses header", () => {
      expect(BasicAuth.fromAuthorizationHeader("Basic dXNlcm5hbWU6cGFzc3dvcmQ=")).toEqual({
        username: "username",
        password: "password",
      });
    });

    it("handles password with colons", () => {
      expect(BasicAuth.fromAuthorizationHeader("Basic dXNlcjpwYXNzOndvcmQ=")).toEqual({
        username: "user",
        password: "pass:word",
      });
    });

    it("handles empty username and password (just colon)", () => {
      expect(BasicAuth.fromAuthorizationHeader("Basic Og==")).toEqual({
        username: "",
        password: "",
      });
    });

    it("handles empty username", () => {
      expect(BasicAuth.fromAuthorizationHeader("Basic OnBhc3N3b3Jk")).toEqual({
        username: "",
        password: "password",
      });
    });

    it("handles empty password", () => {
      expect(BasicAuth.fromAuthorizationHeader("Basic dXNlcm5hbWU6")).toEqual({
        username: "username",
        password: "",
      });
    });

    it("throws error for completely empty credentials", () => {
      expect(() => BasicAuth.fromAuthorizationHeader("Basic ")).toThrow("Invalid basic auth");
    });

    it("throws error for credentials without colon", () => {
      expect(() => BasicAuth.fromAuthorizationHeader("Basic dXNlcm5hbWU=")).toThrow("Invalid basic auth");
    });
  });
});
