import { Argument } from "../Argument";
import {
    ArrayReference,
    ClassReference,
    DateReference,
    GenericClassReference,
    HashInstance,
    HashReference,
    JsonClassReference,
    OpenStructClassReference,
    VoidClassReference
} from "../classes/ClassReference";
import { Class_ } from "../classes/Class_";
import { AstNode } from "../core/AstNode";
import { Expression } from "../expressions/Expression";
import { FunctionInvocation } from "../functions/FunctionInvocation";
import { Function_ } from "../functions/Function_";
import { Parameter } from "../Parameter";
import { Property } from "../Property";
import { Variable, VariableType } from "../Variable";
import { ConditionalStatement } from "./ConditionalStatement";

const additional_properties_property = new Property({
    name: "additional_properties",
    type: OpenStructClassReference,
    isOptional: true,
    documentation: "Additional properties unmapped to the current class definition"
});
export declare namespace SerializableObject {
    export type Init = Omit<Class_.Init, "functions" | "includeInitializer" | "expressions">;
}
export class SerializableObject extends Class_ {
    constructor(init: SerializableObject.Init) {
        super({
            ...init,
            functions: [
                SerializableObject.createFromJsonFunction(init.properties, init.classReference),
                SerializableObject.createToJsonFunction(init.properties, init.classReference),
                SerializableObject.createValidateRawFunction(init.properties)
            ],
            includeInitializer: true,
            properties: [...(init.properties ?? []), additional_properties_property]
        });
    }

    private static createFromJsonFunction(
        properties: Property[] | undefined,
        classReference: ClassReference
    ): Function_ {
        const functionBody: AstNode[] = [
            new Expression({
                leftSide: "struct",
                rightSide: new FunctionInvocation({
                    onObject: JsonClassReference,
                    baseFunction: new Function_({ name: "parse", functionBody: [] }),
                    arguments_: [
                        new Argument({
                            value: "json_object",
                            type: GenericClassReference,
                            isNamed: false
                        }),
                        new Argument({
                            name: "object_class",
                            value: "OpenStruct",
                            type: OpenStructClassReference,
                            isNamed: true
                        })
                    ]
                }),
                isAssignment: true
            }),
            new Expression({
                leftSide: "parsed_json",
                rightSide: new FunctionInvocation({
                    onObject: JsonClassReference,
                    baseFunction: new Function_({ name: "parse", functionBody: [] }),
                    arguments_: [
                        new Argument({
                            value: "json_object",
                            type: GenericClassReference,
                            isNamed: false
                        })
                    ]
                }),
                isAssignment: true
            }),
            ...(properties?.flatMap((prop) => {
                const structVariable = new Variable({
                    name: `struct.${prop.wireValue}`,
                    variableType: VariableType.LOCAL,
                    type: prop.type
                });
                const parsedJsonVariable = new Variable({
                    name: `parsed_json["${prop.wireValue}"]`,
                    variableType: VariableType.LOCAL,
                    type: prop.type
                });

                const hasFromJson =
                    parsedJsonVariable.fromJson() !== undefined &&
                    !(prop.type[0] instanceof ArrayReference) &&
                    !(prop.type[0] instanceof HashReference) &&
                    !(prop.type[0] instanceof DateReference);
                if (hasFromJson) {
                    // If there's a special fromJson, then cast the object back to JSON before proceeding
                    const variable = new Variable({
                        name: prop.name,
                        variableType: VariableType.LOCAL,
                        type: prop.type
                    });

                    const toJsonIfPresent = new ConditionalStatement({
                        if_: {
                            leftSide: new FunctionInvocation({
                                onObject: parsedJsonVariable,
                                baseFunction: new Function_({
                                    name: "nil?",
                                    functionBody: []
                                }),
                                optionalSafeCall: false
                            }),
                            operation: "!",
                            expressions: [
                                new Expression({
                                    leftSide: variable.name,
                                    rightSide: new FunctionInvocation({
                                        onObject: parsedJsonVariable,
                                        baseFunction: new Function_({ name: "to_json", functionBody: [] })
                                    }),
                                    isAssignment: true
                                }),
                                new Expression({
                                    leftSide: prop.name,
                                    rightSide: variable.fromJson() ?? variable,
                                    isAssignment: true
                                })
                            ]
                        },
                        else_: [new Expression({ leftSide: prop.name, rightSide: "nil", isAssignment: true })]
                    });

                    return toJsonIfPresent;
                } else {
                    return new Expression({
                        leftSide: prop.name,
                        rightSide: parsedJsonVariable.fromJson() ?? structVariable,
                        isAssignment: true
                    });
                }
            }) ?? []),
            new FunctionInvocation({
                baseFunction: new Function_({ name: "new", functionBody: [] }),
                arguments_: [
                    ...(properties?.map((prop) => prop.toArgument(prop.name, true)) ?? []),
                    additional_properties_property.toArgument("struct", true)
                ]
            })
        ];
        const parameters = [new Parameter({ name: "json_object", type: JsonClassReference })];
        const fromJsonDocumentation = `Deserialize a JSON object to an instance of ${classReference.name}`;
        return new Function_({
            name: "from_json",
            returnValue: classReference,
            parameters,
            functionBody,
            documentation: fromJsonDocumentation,
            isStatic: true
        });
    }

    private static createToJsonFunction(properties: Property[] | undefined, classReference: ClassReference): Function_ {
        const functionBody = [
            new FunctionInvocation({
                // TODO: should we have a FunctionReference so we don't need to make these dummy full Function_ objects?
                // also see the definition of "new" in the function above
                baseFunction: new Function_({ name: "to_json", functionBody: [] }),
                onObject: new HashInstance({
                    contents: new Map(
                        properties?.map((prop) => {
                            // TODO: confirm enums are the only special case here
                            return [`"${prop.wireValue ?? prop.name}"`, prop.toVariable()];
                        })
                    )
                })
            })
        ];
        const toJsonDocumentation = `Serialize an instance of ${classReference.name} to a JSON object`;
        return new Function_({
            name: "to_json",
            returnValue: JsonClassReference,
            functionBody,
            documentation: toJsonDocumentation
        });
    }

    private static createValidateRawFunction(properties: Property[] | undefined): Function_ {
        const parameterName = "obj";
        const functionBody = properties
            ?.map((prop) => prop.type[0]?.validateRaw(`${parameterName}.${prop.name}`, prop.isOptional))
            .filter((p) => p !== undefined) as AstNode[];
        const validateRawDocumentation =
            "Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.";
        return new Function_({
            name: "validate_raw",
            returnValue: VoidClassReference,
            functionBody,
            documentation: validateRawDocumentation,
            isStatic: true,
            parameters: [new Parameter({ name: parameterName, type: GenericClassReference })]
        });
    }
}
