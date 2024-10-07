import { removeSuffix } from "../removeSuffix";

describe("parseEndpointLocator", () => {
    it("simple", () => {
        const result = removeSuffix({ value: "UserService", suffix: "Service" });
        expect(result).toEqual("User");
    });

    it("simple", () => {
        const result = removeSuffix({ value: "UserService", suffix: "Services" });
        expect(result).toEqual("UserService");
    });
});
