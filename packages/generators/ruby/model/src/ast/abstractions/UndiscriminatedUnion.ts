import { Argument } from "../Argument";
import {
    BooleanClassReference,
    ClassReference,
    GenericClassReference,
    JsonClassReference,
    OpenStructClassReference,
    VoidClassReference
} from "../classes/ClassReference";
import { Class_ } from "../classes/Class_";
import { Expression } from "../expressions/Expression";
import { FunctionInvocation } from "../functions/FunctionInvocation";
import { Function_ } from "../functions/Function_";
import { Import } from "../Import";
import { Parameter } from "../Parameter";
import { Property } from "../Property";
import { RescueStatement } from "./RescueStatement";

export declare namespace UndiscriminatedUnion {
    export interface Init extends Omit<Class_.Init, "functions" | "includeInitializer" | "expressions" | "properties"> {
        memberClasses: ClassReference[];
    }
}
export class UndiscriminatedUnion extends Class_ {
    constructor({ memberClasses, ...rest }: UndiscriminatedUnion.Init) {
        const memberProperty = new Property({ name: "member", type: GenericClassReference });
        const properties = [memberProperty];

        super({
            ...rest,
            properties,
            functions: [
                UndiscriminatedUnion.createFromJsonFunction(memberProperty, memberClasses, rest.classReference),
                UndiscriminatedUnion.createToJsonFunction(memberProperty),
                UndiscriminatedUnion.createValidateRawFunction(memberClasses),
                UndiscriminatedUnion.createIsAFunction(memberProperty)
            ],
            expressions: [
                // Since we're overriding is_a, we also alias kind_of to it
                new Expression({ rightSide: "alias kind_of? is_a?", isAssignment: false })
            ],
            includeInitializer: true
        });
    }

    private static createFromJsonFunction(
        memberProperty: Property,
        subclasses: ClassReference[],
        classReference: ClassReference
    ): Function_ {
        const jsonObjectParameter = new Parameter({ name: "json_object", type: JsonClassReference });
        const functionBody = [
            new Expression({
                leftSide: "struct",
                rightSide: new FunctionInvocation({
                    onObject: new ClassReference({ name: "JSON", import_: new Import({ from: "json" }) }),
                    baseFunction: new Function_({ name: "parse", functionBody: [] }),
                    arguments_: [
                        new Argument({
                            value: jsonObjectParameter.name,
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
            ...subclasses.map(
                (sc) =>
                    new RescueStatement({
                        begin: [
                            new Expression({
                                rightSide: sc.validateRaw("struct"),
                                isAssignment: false
                            }),
                            new Expression({
                                leftSide: memberProperty.name,
                                rightSide: sc.fromJson(jsonObjectParameter.name) ?? jsonObjectParameter.name,
                                isAssignment: true
                            }),
                            new Expression({
                                leftSide: "return",
                                rightSide: new FunctionInvocation({
                                    baseFunction: new Function_({ name: "new", functionBody: [] }),
                                    arguments_: [memberProperty.toArgument(memberProperty.name, true)]
                                }),
                                isAssignment: false
                            })
                        ],
                        rescue: [new Expression({ rightSide: "# noop", isAssignment: false })]
                    })
            )
        ];

        const fromJsonDocumentation = `Deserialize a JSON object to an instance of ${classReference.name}`;
        return new Function_({
            name: "from_json",
            returnValue: classReference,
            parameters: [jsonObjectParameter],
            functionBody,
            documentation: fromJsonDocumentation,
            isStatic: true
        });
    }

    private static createToJsonFunction(memberProperty: Property): Function_ {
        const toJsonDocumentation = "For Union Types, to_json functionality is delegated to the wrapped member.";

        return new Function_({
            name: "to_json",
            functionBody: [
                new FunctionInvocation({
                    baseFunction: new Function_({ name: "to_json", functionBody: [] }),
                    onObject: memberProperty.toVariable()
                })
            ],
            documentation: toJsonDocumentation,
            returnValue: JsonClassReference
        });
    }

    private static createValidateRawFunction(subclasses: ClassReference[]): Function_ {
        const parameterName = "obj";

        const functionBody = [
            ...subclasses.map(
                (sc) =>
                    new RescueStatement({
                        begin: [
                            new Expression({
                                leftSide: "return",
                                rightSide: sc.validateRaw(parameterName),
                                isAssignment: false
                            })
                        ],
                        rescue: [new Expression({ rightSide: "# noop", isAssignment: false })]
                    })
            ),
            new Expression({
                rightSide: 'raise("Passed value matched no type within the union, validation failed.")',
                isAssignment: false
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

    private static createIsAFunction(memberProperty: Property): Function_ {
        const isADocumentation = "For Union Types, is_a? functionality is delegated to the wrapped member.";

        const parameterName = "obj";
        return new Function_({
            name: "is_a?",
            functionBody: [
                new FunctionInvocation({
                    baseFunction: new Function_({ name: "is_a?", functionBody: [] }),
                    onObject: memberProperty.toVariable(),
                    arguments_: [new Argument({ isNamed: false, type: GenericClassReference, value: parameterName })]
                })
            ],
            parameters: [new Parameter({ name: parameterName, type: GenericClassReference, isNamed: false })],
            documentation: isADocumentation,
            returnValue: BooleanClassReference
        });
    }
}
