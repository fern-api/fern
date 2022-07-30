import { ObjectSchema } from "../schemas";
import { visitRawTypeDeclaration } from "../utils/visitRawTypeDeclaration";

describe("visitRawTypeDeclaration", () => {
    it("extends with no properties", () => {
        const declaration: ObjectSchema = { extends: "SomeType" };
        const isObject = visitRawTypeDeclaration(declaration, {
            object: () => true,
            union: () => false,
            enum: () => false,
            alias: () => false,
        });
        expect(isObject).toBe(true);
    });
});
