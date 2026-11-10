import { describe, expect, it } from "vitest";
import { guestSdkName } from "../runRemoteGenerationForGenerator";

describe("guestSdkName", () => {
    it("names the SDK after the workspace when the API definition carries the default name", () => {
        expect(guestSdkName({ apiName: "api", workspaceName: "petstore-orders" })).toBe("petstore-orders");
    });

    it("keeps a single-API fern/generators.yml under 'api'", () => {
        expect(guestSdkName({ apiName: "api", workspaceName: "api" })).toBe("api");
        expect(guestSdkName({ apiName: "api", workspaceName: undefined })).toBe("api");
        expect(guestSdkName({ apiName: "api", workspaceName: "" })).toBe("api");
    });

    it("keeps an API the customer named", () => {
        expect(guestSdkName({ apiName: "billing", workspaceName: "petstore-orders" })).toBe("billing");
    });
});
