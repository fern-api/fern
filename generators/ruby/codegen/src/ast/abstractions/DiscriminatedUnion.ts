import { NameAndWireValue, SingleUnionTypeProperties, SingleUnionTypeProperty } from "@fern-fern/ir-sdk/api";

import { Argument } from "../Argument";
import { Parameter } from "../Parameter";
import { Property } from "../Property";
import {
    BooleanClassReference,
    ClassReference,
    GenericClassReference,
    HashInstance,
    JsonClassReference,
    StringClassReference,
    VoidClassReference
} from "../classes/ClassReference";
import { Class_ } from "../classes/Class_";
import { AstNode } from "../core/AstNode";
import { Expression } from "../expressions/Expression";
import { FunctionInvocation } from "../functions/FunctionInvocation";
import { Function_ } from "../functions/Function_";
import { CaseStatement } from "./CaseStatement";

export declare namespace DiscriminatedUnion {
    export interface Init extends Omit<Class_.Init, "functions" | "includeInitializer" | "expressions"> {
        discriminantField: string;
        namedSubclasses: Subclass[];
        defaultSubclassReference?: ClassReference;
    }
    export interface Subclass {
        discriminantValue: NameAndWireValue;
        classReference: ClassReference | undefined;
        unionPropertiesType: SingleUnionTypeProperties;
    }
}
export class DiscriminatedUnion extends Class_ {
    constructor({ discriminantField, namedSubclasses, defaultSubclassReference, ...rest }: DiscriminatedUnion.Init) {
        const memberProperty = new Property({ name: "member", type: GenericClassReference });
        const discriminantProperty = new Property({ name: "discriminant", type: StringClassReference });
        const properties = [memberProperty, discriminantProperty, ...(rest.properties ?? [])];

        super({
            ...rest,
            properties,
            functions: [
                DiscriminatedUnion.createFromJsonFunction(
                    discriminantField,
                    memberProperty,
                    discriminantProperty,
                    namedSubclasses,
                    rest.classReference,
                    defaultSubclassReference
                ),
                DiscriminatedUnion.createToJsonFunction(
                    memberProperty,
                    discriminantProperty,
                    discriminantField,
                    namedSubclasses
                ),
                DiscriminatedUnion.createValidateRawFunction(discriminantField, namedSubclasses),
                DiscriminatedUnion.createIsAFunction(memberProperty),
                ...DiscriminatedUnion.createStaticGeneratorFunctions(
                    namedSubclasses,
                    memberProperty,
                    discriminantProperty,
                    rest.classReference
                )
            ],
            expressions: [
                // Hide the initializer for union classes
                new Expression({ rightSide: "private_class_method :new", isAssignment: false }),
                // Since we're overriding is_a, we also alias kind_of to it
                new Expression({ rightSide: "alias kind_of? is_a?", isAssignment: false })
            ],
            includeInitializer: true
        });
    }

    private static unionPropertyTypeFromJson(
        jsonParameter: string,
        memberProperty: Property,
        unionSubclass: DiscriminatedUnion.Subclass
    ): Expression {
        const rightSide = unionSubclass.unionPropertiesType._visit<AstNode | string>({
            samePropertiesAsObject: () => unionSubclass.classReference?.fromJson(jsonParameter) ?? jsonParameter,
            singleProperty: (sutp: SingleUnionTypeProperty) =>
                unionSubclass.classReference?.fromJson(`${jsonParameter}.${sutp.name.wireValue}`) ??
                `${jsonParameter}.${sutp.name.wireValue}`,
            noProperties: () => "nil",
            _other: () => {
                throw new Error("Unknown SingleUnionProperties: " + unionSubclass.unionPropertiesType.propertiesType);
            }
        });

        return new Expression({
            leftSide: memberProperty.name,
            rightSide,
            isAssignment: true
        });
    }

    private static createFromJsonFunction(
        discriminantField: string,
        memberProperty: Property,
        discriminantProperty: Property,
        namedSubclasses: DiscriminatedUnion.Subclass[],
        unionClassReference: ClassReference,
        defaultSubclassReference?: ClassReference
    ): Function_ {
        const jsonObjectParamName = "json_object";
        const functionBody = [
            new Expression({
                leftSide: "struct",
                rightSide: new FunctionInvocation({
                    onObject: JsonClassReference,
                    baseFunction: new Function_({ name: "parse", functionBody: [] }),
                    arguments_: [
                        new Argument({
                            value: jsonObjectParamName,
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
            }),
            new CaseStatement({
                case_: `struct.${discriminantField}`,
                whenBlocks: new Map(
                    namedSubclasses.map((sc) => [
                        `"${sc.discriminantValue.wireValue}"`,
                        [DiscriminatedUnion.unionPropertyTypeFromJson(jsonObjectParamName, memberProperty, sc)]
                    ])
                ),
                else_: [
                    new Expression({
                        leftSide: memberProperty.name,
                        rightSide: defaultSubclassReference?.fromJson(jsonObjectParamName) ?? jsonObjectParamName,
                        isAssignment: true
                    })
                ]
            }),
            new FunctionInvocation({
                baseFunction: new Function_({ name: "new", functionBody: [] }),
                arguments_: [
                    memberProperty.toArgument(memberProperty.name, true),
                    discriminantProperty.toArgument(`struct.${discriminantField}`, true)
                ]
            })
        ];
        const parameters = [new Parameter({ name: jsonObjectParamName, type: StringClassReference })];
        const fromJsonDocumentation = `Deserialize a JSON object to an instance of ${unionClassReference.name}`;
        return new Function_({
            name: "from_json",
            returnValue: unionClassReference,
            parameters,
            functionBody,
            documentation: fromJsonDocumentation,
            isStatic: true
        });
    }

    private static unionPropertyTypeToJson(
        memberProperty: Property,
        discriminantProperty: Property,
        unionSubclass: DiscriminatedUnion.Subclass,
        discriminantField: string
    ): FunctionInvocation {
        const objectHash = unionSubclass.unionPropertiesType._visit<HashInstance>({
            samePropertiesAsObject: () =>
                new HashInstance({
                    contents: new Map([[discriminantField, discriminantProperty.toVariable()]]),
                    // Take the member property and spread it into this hash that includes the discriminant
                    additionalHashes: [
                        {
                            value: new FunctionInvocation({
                                baseFunction: new Function_({ name: "to_json", functionBody: [] }),
                                onObject: memberProperty.toVariable()
                            })
                        }
                    ]
                }),
            singleProperty: (sutp: SingleUnionTypeProperty) =>
                new HashInstance({
                    contents: new Map([
                        [`"${discriminantField}"`, discriminantProperty.toVariable()],
                        [`"${sutp.name.wireValue}"`, memberProperty.toVariable()]
                    ])
                }),
            noProperties: () =>
                new HashInstance({ contents: new Map([[discriminantField, discriminantProperty.toVariable()]]) }),
            _other: () => {
                throw new Error("Unknown SingleUnionProperties: " + unionSubclass.unionPropertiesType.propertiesType);
            }
        });

        return new FunctionInvocation({
            baseFunction: new Function_({ name: "to_json", functionBody: [] }),
            onObject: objectHash
        });
    }

    private static createToJsonFunction(
        memberProperty: Property,
        discriminantProperty: Property,
        discriminantField: string,
        namedSubclasses: DiscriminatedUnion.Subclass[]
    ): Function_ {
        const toJsonDocumentation = "For Union Types, to_json functionality is delegated to the wrapped member.";

        return new Function_({
            name: "to_json",
            functionBody: [
                new CaseStatement({
                    case_: discriminantProperty.toVariable(),
                    whenBlocks: new Map(
                        namedSubclasses.map((sc) => [
                            `"${sc.discriminantValue.wireValue}"`,
                            [
                                DiscriminatedUnion.unionPropertyTypeToJson(
                                    memberProperty,
                                    discriminantProperty,
                                    sc,
                                    discriminantField
                                )
                            ]
                        ])
                    ),
                    else_: [
                        new FunctionInvocation({
                            baseFunction: new Function_({ name: "to_json", functionBody: [] }),
                            onObject: new HashInstance({
                                contents: new Map([
                                    [`"${discriminantField}"`, discriminantProperty.toVariable()],
                                    ["value", memberProperty.toVariable()]
                                ])
                            })
                        })
                    ]
                }),
                new FunctionInvocation({
                    baseFunction: new Function_({ name: "to_json", functionBody: [] }),
                    onObject: memberProperty.toVariable()
                })
            ],
            returnValue: StringClassReference,
            documentation: toJsonDocumentation
        });
    }

    private static createValidateRawFunction(
        discriminantField: string,
        namedSubclasses: DiscriminatedUnion.Subclass[]
    ): Function_ {
        const parameterName = "obj";
        const functionBody = [
            new CaseStatement({
                case_: `${parameterName}.${discriminantField}`,
                whenBlocks: new Map(
                    namedSubclasses.map((sc) => [
                        `"${sc.discriminantValue.wireValue}"`,
                        [
                            new Expression({
                                rightSide: sc.classReference?.validateRaw(parameterName) ?? "# noop",
                                isAssignment: false
                            })
                        ]
                    ])
                ),
                else_: [
                    new Expression({
                        rightSide: 'raise("Passed value matched no type within the union, validation failed.")',
                        isAssignment: false
                    })
                ]
            })
        ];
        const validateRawDocumentation =
            "Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.";

        return new Function_({
            name: "validate_raw",
            returnValue: VoidClassReference,
            parameters: [new Parameter({ name: parameterName, type: GenericClassReference })],
            functionBody,
            documentation: validateRawDocumentation,
            isStatic: true
        });
    }

    private static createStaticGeneratorFunctions(
        namedSubclasses: DiscriminatedUnion.Subclass[],
        memberProperty: Property,
        discriminantProperty: Property,
        classReference: ClassReference
    ): Function_[] {
        const parameterName = "member";
        return namedSubclasses.map((sc) => {
            return new Function_({
                name: sc.discriminantValue.name.snakeCase.safeName,
                functionBody: [
                    new FunctionInvocation({
                        baseFunction: new Function_({ name: "new", functionBody: [] }),
                        arguments_: [
                            memberProperty.toArgument(sc.classReference !== undefined ? parameterName : "nil", true),
                            discriminantProperty.toArgument(`"${sc.discriminantValue.wireValue}"`, true)
                        ]
                    })
                ],
                isStatic: true,
                parameters:
                    sc.classReference !== undefined
                        ? [new Parameter({ name: parameterName, type: sc.classReference })]
                        : [],
                returnValue: classReference
            });
        });
    }

    private static createIsAFunction(memberProperty: Property): Function_ {
        const isADocumentation = "For Union Types, is_a? functionality is delegated to the wrapped member.";

        const parameterName = "obj";
        return new Function_({
            name: "is_a?",
            functionBody: [
                new FunctionInvocation({
                    baseFunction: new Function_({ name: "is_a?", functionBody: [] }),
                    onObject: memberProperty.toVariable(),
                    arguments_: [new Argument({ isNamed: false, value: parameterName })]
                })
            ],
            parameters: [new Parameter({ name: parameterName, type: GenericClassReference, isNamed: false })],
            documentation: isADocumentation,
            returnValue: BooleanClassReference
        });
    }
}
