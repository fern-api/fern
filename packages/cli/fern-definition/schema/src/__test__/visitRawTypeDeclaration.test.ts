import { ObjectSchema } from "../schemas/index.js";
import { visitRawTypeDeclaration } from "../utils/visitRawTypeDeclaration.js";

describe("visitRawTypeDeclaration", () => {
    it("extends with no properties", () => {
        const declaration: ObjectSchema = { extends: "SomeType" };
        const isObject = visitRawTypeDeclaration(declaration, {
            object: () => true,
            discriminatedUnion: () => false,
            undiscriminatedUnion: () => false,
            enum: () => false,
            alias: () => false
        });
        expect(isObject).toBe(true);
    });
});
