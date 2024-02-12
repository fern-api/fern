import * as csharp from "../csharp";

describe("class", () => {
    it("basic", () => {
        const plant = csharp.class_({
            name: "Plant",
            namespace: "Fern",
            partial: true,
            access: "public"
        });
        plant.addField(
            csharp.field({
                name: "watered",
                type: csharp.Types.boolean(),
                access: "public",
                get: true,
                init: true,
                annotations: [
                    csharp.annotation({
                        reference: csharp.classReference({
                            name: "JsonProperty",
                            namespace: "System.Text.Json.Serialization"
                        }),
                        argument: '"watered"'
                    })
                ],
                summary: "Whether the plant has been watered"
            })
        );
        expect(plant.name).toBe("Plant");
        expect(plant.toString()).toMatchSnapshot();
    });
});
