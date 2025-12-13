import { RelativeFilePath } from "@fern-api/path-utils";

import { FernDefinitionBuilderImpl } from "../FernDefinitionBuilder";

describe("FernDefinitionBuilder", () => {
    describe("addType", () => {
        it("should add a type to a file", () => {
            const builder = new FernDefinitionBuilderImpl(false);
            builder.addType(RelativeFilePath.of("types.yml"), {
                name: "MyType",
                schema: {
                    properties: {
                        id: "string"
                    }
                }
            });

            const definition = builder.build();
            expect(definition.definitionFiles["types.yml"]?.types).toEqual({
                MyType: {
                    properties: {
                        id: "string"
                    }
                }
            });
        });

        it("should skip duplicate type with same schema in different file", () => {
            const builder = new FernDefinitionBuilderImpl(false);
            const schema = {
                properties: {
                    id: "string",
                    name: "string"
                }
            };

            builder.addType(RelativeFilePath.of("diagrams.yml"), {
                name: "DiagramContentPartialComments",
                schema
            });

            builder.addType(RelativeFilePath.of("__package__.yml"), {
                name: "DiagramContentPartialComments",
                schema
            });

            const definition = builder.build();
            expect(definition.definitionFiles["diagrams.yml"]?.types).toEqual({
                DiagramContentPartialComments: schema
            });
            expect(definition.packageMarkerFile.types).toBeUndefined();
        });

        it("should allow same type name in same file (update)", () => {
            const builder = new FernDefinitionBuilderImpl(false);

            builder.addType(RelativeFilePath.of("types.yml"), {
                name: "MyType",
                schema: {
                    properties: {
                        id: "string"
                    }
                }
            });

            const updatedSchema = {
                properties: {
                    id: "string",
                    name: "string"
                }
            };

            builder.addType(RelativeFilePath.of("types.yml"), {
                name: "MyType",
                schema: updatedSchema
            });

            const definition = builder.build();
            expect(definition.definitionFiles["types.yml"]?.types).toEqual({
                MyType: updatedSchema
            });
        });

        it("should allow different types with same name but different schemas in different files", () => {
            const builder = new FernDefinitionBuilderImpl(false);

            builder.addType(RelativeFilePath.of("file1.yml"), {
                name: "SharedTypeName",
                schema: {
                    properties: {
                        field1: "string"
                    }
                }
            });

            builder.addType(RelativeFilePath.of("file2.yml"), {
                name: "SharedTypeName",
                schema: {
                    properties: {
                        field2: "integer"
                    }
                }
            });

            const definition = builder.build();
            expect(definition.definitionFiles["file1.yml"]?.types).toEqual({
                SharedTypeName: {
                    properties: {
                        field1: "string"
                    }
                }
            });
            expect(definition.definitionFiles["file2.yml"]?.types).toEqual({
                SharedTypeName: {
                    properties: {
                        field2: "integer"
                    }
                }
            });
        });

        it("should not add types to api.yml", () => {
            const builder = new FernDefinitionBuilderImpl(false);
            builder.addType(RelativeFilePath.of("api.yml"), {
                name: "MyType",
                schema: {
                    properties: {
                        id: "string"
                    }
                }
            });

            const definition = builder.build();
            expect(definition.definitionFiles["api.yml"]).toBeUndefined();
        });
    });
});
