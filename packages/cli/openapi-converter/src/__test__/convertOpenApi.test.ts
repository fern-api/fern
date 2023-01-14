import { COMMONS_SERVICE_FILE_NAME } from "../v3/utils";

describe("convertOpenApi", () => {
    it("basic", () => {
        expect(COMMONS_SERVICE_FILE_NAME).toEqual("commons");
    });
});
