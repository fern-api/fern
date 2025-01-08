import { Argument } from "../Argument";
import { Parameter } from "../Parameter";
import { Property } from "../Property";
import { Variable, VariableType } from "../Variable";
import {
    AliasReference,
    ArrayReference,
    ClassReference,
    DateReference,
    GenericClassReference,
    HashInstance,
    HashReference,
    JsonClassReference,
    OmittedValue,
    OpenStructClassReference,
    StringClassReference,
    VoidClassReference
} from "../classes/ClassReference";
import { Class_ } from "../classes/Class_";
import { AstNode } from "../core/AstNode";
import { Expression } from "../expressions/Expression";
import { FunctionInvocation } from "../functions/FunctionInvocation";
import { Function_ } from "../functions/Function_";
import { ConditionalStatement } from "./ConditionalStatement";

export const AdditionalPropertiesProperty = new Property({
    name: "additional_properties",
    type: OpenStructClassReference,
    isOptional: true,
    documentation: "Additional properties unmapped to the current class definition"
});
export const FieldsetProperty = new Property({
    name: "_field_set",
    type: GenericClassReference,
    isOptional: true
});

export declare namespace SerializableObject {
    export type Init = Omit<Class_.Init, "functions" | "includeInitializer" | "expressions">;
}
export class SerializableObject extends Class_ {
    public static INTERNAL_FIELDS = [AdditionalPropertiesProperty.name, FieldsetProperty.name];

    constructor(init: SerializableObject.Init) {
        super({
            ...init,
            functions: [
                SerializableObject.createFromJsonFunction(init.properties, init.classReference),
                SerializableObject.createToJsonFunction(init.properties, init.classReference),
                SerializableObject.createValidateRawFunction(init.properties)
            ],
            includeInitializer: false,
            initializerOverride: SerializableObject.createInitializerFunction(
                init.properties ?? [],
                init.classReference
            ),
            properties: [...(init.properties ?? []), AdditionalPropertiesProperty],
            protectedProperties: [FieldsetProperty],
            expressions: [SerializableObject.createOmitTypeExpression()],
            shouldOmitOptionalFieldsInInitializer: true
        });
    }

    private static createInitializerFunction(properties: Property[], classReference: ClassReference): Function_ {
        const propertyHash = new HashInstance({
            contents: new Map(
                properties?.map((prop) => {
                    return [`"${prop.wireValue ?? prop.name}"`, prop.name];
                })
            ),
            stringifyValues: false
        });
        return new Function_({
            name: "initialize",
            parameters: [
                ...properties.map((prop) => prop.toParameter({ shouldOmitOptional: true })),
                AdditionalPropertiesProperty.toParameter({})
            ],
            returnValue: classReference,
            functionBody: [
                ...properties.map((prop) => {
                    return new Expression({
                        leftSide: prop.toVariable(),
                        rightSide: prop.isOptional
                            ? new Expression({
                                  leftSide: prop.name,
                                  rightSide: `${prop.name} != ${OmittedValue}`,
                                  isAssignment: false,
                                  operation: "if"
                              })
                            : prop.name,
                        isAssignment: true
                    });
                }),
                new Expression({
                    leftSide: AdditionalPropertiesProperty.toVariable(),
                    rightSide: AdditionalPropertiesProperty.name,
                    isAssignment: true
                }),
                new Expression({
                    leftSide: FieldsetProperty.toVariable(),
                    rightSide: properties.some((prop) => prop.isOptional)
                        ? new FunctionInvocation({
                              // Here we take only the keys that were explicitly set
                              baseFunction: new Function_({ name: "reject", functionBody: [] }),
                              block: {
                                  arguments: "_k, v",
                                  expressions: [
                                      new Expression({
                                          leftSide: "v",
                                          rightSide: OmittedValue,
                                          operation: "==",
                                          isAssignment: false
                                      })
                                  ]
                              },
                              onObject: propertyHash
                          })
                        : propertyHash,
                    isAssignment: true
                })
            ],
            invocationName: "new"
        });
    }

    private static createOmitTypeExpression(): Expression {
        return new Expression({
            leftSide: OmittedValue,
            rightSide: "Object.new",
            isAssignment: true
        });
    }

    private static createFromJsonFunction(
        properties: Property[] | undefined,
        classReference: ClassReference
    ): Function_ {
        let functionUsesParsedJson = false;
        const functionBody: AstNode[] = [
            new Expression({
                leftSide: "struct",
                rightSide: new FunctionInvocation({
                    onObject: JsonClassReference,
                    baseFunction: new Function_({ name: "parse", functionBody: [] }),
                    arguments_: [
                        new Argument({
                            value: "json_object",
                            isNamed: false
                        }),
                        new Argument({
                            name: "object_class",
                            value: "OpenStruct",
                            isNamed: true
                        })
                    ]
                }),
                isAssignment: true
            })
        ];
        const functionBodyParameterManipulation = [
            ...(properties?.flatMap((prop) => {
                const structVariable = new Variable({
                    name: `struct["${prop.wireValue}"]`,
                    variableType: VariableType.LOCAL,
                    type: prop.type
                });
                const parsedJsonVariable = new Variable({
                    name: `parsed_json["${prop.wireValue}"]`,
                    variableType: VariableType.LOCAL,
                    type: prop.type
                });

                const crUsesParsedJson = parsedJsonVariable.fromJson() !== undefined;
                functionUsesParsedJson = functionUsesParsedJson || crUsesParsedJson;
                const classReferenceForCast = prop.type[0];
                const hasFromJson =
                    crUsesParsedJson &&
                    !(classReferenceForCast instanceof ArrayReference) &&
                    !(classReferenceForCast instanceof HashReference) &&
                    !(classReferenceForCast instanceof DateReference) &&
                    !(
                        classReferenceForCast instanceof AliasReference &&
                        (classReferenceForCast.aliasOf instanceof ArrayReference ||
                            classReferenceForCast.aliasOf instanceof HashReference ||
                            classReferenceForCast.aliasOf instanceof DateReference)
                    );
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
                    functionUsesParsedJson = true;
                    return new Expression({
                        leftSide: prop.name,
                        // If there's no fromJson on the value, then let's return parsed JSON, as that would remain a hash,
                        // as opposed to returning the struct, which is what you almost always want.
                        rightSide: parsedJsonVariable.fromJson() ?? parsedJsonVariable,
                        isAssignment: true
                    });
                }
            }) ?? []),
            new FunctionInvocation({
                baseFunction: new Function_({ name: "new", functionBody: [] }),
                arguments_: [
                    ...(properties?.map((prop) => prop.toArgument(prop.name, true)) ?? []),
                    AdditionalPropertiesProperty.toArgument("struct", true)
                ]
            })
        ];
        if (functionUsesParsedJson) {
            functionBody.push(
                new Expression({
                    leftSide: "parsed_json",
                    rightSide: new FunctionInvocation({
                        onObject: JsonClassReference,
                        baseFunction: new Function_({ name: "parse", functionBody: [] }),
                        arguments_: [
                            new Argument({
                                value: "json_object",
                                isNamed: false
                            })
                        ]
                    }),
                    isAssignment: true
                })
            );
        }

        functionBody.push(...functionBodyParameterManipulation);

        const parameters = [new Parameter({ name: "json_object", type: StringClassReference })];
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
                onObject: FieldsetProperty.toVariable()
            })
        ];
        const toJsonDocumentation = `Serialize an instance of ${classReference.name} to a JSON object`;
        return new Function_({
            name: "to_json",
            returnValue: StringClassReference,
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
