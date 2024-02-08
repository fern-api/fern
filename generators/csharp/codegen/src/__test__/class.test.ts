import { Access, CSharp } from "..";

describe("class", () => {
    it("basic", () => {
        const plant = new CSharp.Class({
            name: "Plant",
            namespace: "Fern",
            partial: true,
            access: Access.Public
        });
        plant.addField(
            new CSharp.Field({
                name: "watered",
                type: CSharp.Type.boolean(),
                access: Access.Public,
                get: true,
                init: true,
                annotations: [
                    new CSharp.Annotation({
                        reference: new CSharp.ClassReference({
                            name: "JsonProperty",
                            namespace: "System.Text.Json.Serialization"
                        }),
                        argument: '"watered"'
                    })
                ]
            })
        );
        expect(plant.name).toBe("Plant");
        expect(plant.toString()).toMatchSnapshot();
    });
});
