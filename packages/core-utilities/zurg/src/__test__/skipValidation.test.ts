import { boolean, number, object, property, string } from "../builders";

describe("skipValidation", () => {
    it("allows data that doesn't conform to the schema", async () => {
        const schema = object({
            camelCase: property("snake_case", string()),
            numberProperty: number(),
            requiredProperty: boolean(),
        });

        const parsed = await schema.parse(
            {
                snake_case: "hello",
                numberProperty: "oops",
            },
            {
                skipValidation: true,
            }
        );

        expect(parsed).toEqual({
            ok: true,
            value: {
                camelCase: "hello",
                numberProperty: "oops",
            },
        });
    });
});
