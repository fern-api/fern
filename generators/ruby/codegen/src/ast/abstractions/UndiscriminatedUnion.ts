import { Argument } from "../Argument";
import { Parameter } from "../Parameter";
import {
    ClassReference,
    GenericClassReference,
    JsonClassReference,
    StringClassReference,
    VoidClassReference
} from "../classes/ClassReference";
import { Class_ } from "../classes/Class_";
import { Expression } from "../expressions/Expression";
import { FunctionInvocation } from "../functions/FunctionInvocation";
import { Function_ } from "../functions/Function_";
import { ConditionalStatement } from "./ConditionalStatement";
import { RescueStatement } from "./RescueStatement";

export declare namespace UndiscriminatedUnion {
    export interface Init extends Omit<Class_.Init, "functions" | "includeInitializer" | "expressions" | "properties"> {
        memberClasses: ClassReference[];
    }
}
export class UndiscriminatedUnion extends Class_ {
    constructor({ memberClasses, ...rest }: UndiscriminatedUnion.Init) {
        super({
            ...rest,
            functions: [
                UndiscriminatedUnion.createFromJsonFunction(memberClasses, rest.classReference),
                UndiscriminatedUnion.createValidateRawFunction(memberClasses)
            ],
            includeInitializer: false
        });
    }

    private static createFromJsonFunction(subclasses: ClassReference[], classReference: ClassReference): Function_ {
        const jsonObjectParameter = new Parameter({ name: "json_object", type: StringClassReference });
        const functionBody = [
            new Expression({
                leftSide: "struct",
                rightSide: new FunctionInvocation({
                    onObject: JsonClassReference,
                    baseFunction: new Function_({ name: "parse", functionBody: [] }),
                    arguments_: [
                        new Argument({
                            value: jsonObjectParameter.name,
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
            ...subclasses.map((sc) => {
                return new RescueStatement({
                    begin: [
                        new Expression({
                            rightSide: sc.validateRaw("struct"),
                            isAssignment: false
                        }),
                        new ConditionalStatement({
                            if_: {
                                leftSide: new FunctionInvocation({
                                    onObject: "struct",
                                    baseFunction: new Function_({
                                        name: "nil?",
                                        functionBody: []
                                    }),
                                    optionalSafeCall: false
                                }),
                                operation: "!",
                                expressions: [
                                    new Expression({
                                        leftSide: "return",
                                        rightSide: sc.fromJson("struct") ?? "struct",
                                        isAssignment: false
                                    })
                                ]
                            },
                            else_: [new Expression({ leftSide: "return", rightSide: "nil", isAssignment: false })]
                        })
                    ],
                    rescue: [new Expression({ rightSide: "# noop", isAssignment: false })]
                });
            }),
            new Expression({
                leftSide: "return struct",
                isAssignment: false
            })
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
}
