import { Argument } from "../Argument";
import { ClassReference, GenericClassReference, JsonClassReference } from "../classes/ClassReference";
import { Class_ } from "../classes/Class_";
import { Expression } from "../expressions/Expression";
import { FunctionInvocation } from "../functions/FunctionInvocation";
import { Function_ } from "../functions/Function_";
import { Parameter } from "../Parameter";
import { HashInstance } from "../primitives/Hash_";
import { Property } from "../Property";

export declare namespace SerializableObject {
    export type Init = Omit<Class_.Init, "functions" | "includeInitializer" | "expressions">;
}
export class SerializableObject extends Class_ {
    constructor(init: SerializableObject.Init) {
        super({
            functions: [
                SerializableObject.createFromJsonFunction(init.properties, init.classReference),
                SerializableObject.createToJsonFunction(init.properties, init.classReference)
            ],
            includeInitializer: true,
            ...init
        });
    }

    private static createFromJsonFunction(
        properties: Property[] | undefined,
        classReference: ClassReference
    ): Function_ {
        const functionBody = [
            new Expression({
                leftSide: "struct",
                rightSide: new FunctionInvocation({
                    onObject: "JSON",
                    baseFunction: new Function_({ name: "new", functionBody: [] }),
                    arguments_: [
                        new Argument({
                            value: "json_object",
                            type: GenericClassReference,
                            isNamed: false
                        }),
                        new Argument({
                            name: "object_class",
                            value: "OpenStruct",
                            type: GenericClassReference,
                            isNamed: true
                        })
                    ]
                }),
                isAssignment: true
            }),
            ...(properties ?? []).map(
                (prop) =>
                    new Expression({ leftSide: prop.name, rightSide: `struct.${prop.wireValue}`, isAssignment: true })
            ),
            new Expression({ leftSide: "additional_properties", rightSide: "struct", isAssignment: true }),
            new FunctionInvocation({
                baseFunction: new Function_({ name: "new", functionBody: [] }),
                arguments_: properties?.map((prop) => prop.toArgument(prop.name, true))
            })
        ];
        const parameters = [new Parameter({ name: "json_object", type: JsonClassReference })];
        const toJsonDocumentation = `Deserialize a JSON object to an instance of ${classReference.name}`;
        return new Function_({
            name: "from_json",
            returnValue: classReference,
            parameters,
            functionBody,
            isStatic: true,
            documentation: toJsonDocumentation
        });
    }

    private static createToJsonFunction(properties: Property[] | undefined, classReference: ClassReference): Function_ {
        const functionBody = [
            new FunctionInvocation({
                // TODO: should we have a FunctionReference so we don't need to make these dummy full Function_ objects?
                // also see the definition of "new" in the function above
                baseFunction: new Function_({ name: "to_json", functionBody: [] }),
                // TODO: call to_json on these properties if they're objects
                onObject: new HashInstance({
                    contents: new Map(properties?.map((prop) => [prop.wireValue ?? prop.name, prop.toVariable()]))
                })
            })
        ];
        const toJsonDocumentation = `Serialize an instance of ${classReference.name} to a JSON object`;
        return new Function_({
            name: "to_json",
            returnValue: JsonClassReference,
            functionBody,
            isStatic: true,
            documentation: toJsonDocumentation
        });
    }
}
