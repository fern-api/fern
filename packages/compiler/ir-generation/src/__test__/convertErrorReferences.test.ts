import { ErrorReference, FernFilepath } from "@fern-api/api";
import { convertErrorReferences } from "../converters/services/convertErrorReferences";

describe("convertErrorReferences", () => {
    it("reference to an error in another file", () => {
        const references = convertErrorReferences({
            errors: {
                unauthorized: "commons.UnauthorizedError",
            },
            fernFilepath: FernFilepath.of("path/to/service"),
            imports: {
                commons: "./commons",
            },
        });

        const expectedReference: ErrorReference = {
            docs: undefined,
            discriminantValue: "unauthorized",
            error: {
                name: "UnauthorizedError",
                fernFilepath: FernFilepath.of("path/to/commons"),
            },
        };

        expect(references).toEqual([expectedReference]);
    });
});
