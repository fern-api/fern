import { Argument } from "../Argument";
import { Import } from "../Import";
import { Parameter } from "../Parameter";
import { Property } from "../Property";
import {
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
import { CaseStatement } from "./CaseStatement";

export declare namespace DiscriminatedUnion {
    export interface Init extends Omit<Class_.Init, "functions" | "includeInitializer" | "expressions" | "properties"> {
        discriminatingField: string;
        namedSubclasses: Map<string, ClassReference>;
        defaultSubclassReference: ClassReference;
    }
}
export class DiscriminatedUnion extends Class_ {
    constructor(init: DiscriminatedUnion.Init) {
        const memberProperty = new Property({name: "member", type: GenericClassReference});
        const properties = [memberProperty];

        super({
            ...init,
            properties,
            functions: [
                DiscriminatedUnion.createFromJsonFunction(init.discriminatingField, memberProperty, init.namedSubclasses, init.classReference, init.defaultSubclassReference),
                DiscriminatedUnion.createToJsonFunction(memberProperty),
                DiscriminatedUnion.createValidateRawFunction(init.discriminatingField, init.namedSubclasses),
                DiscriminatedUnion.createIsAFunction(memberProperty),
                ...DiscriminatedUnion.createStaticGeneratorFunctions(init.namedSubclasses, memberProperty)
            ],
            expressions: [
                // Hide the initializer for union classes
                new Expression({rightSide: "private_class_method :new"}),
                // Since we're overriding is_a, we also alias kind_of to it
                new Expression({rightSide: "alias kind_of? is_a?"})
            ],
            includeInitializer: true,
        });
    }

    private static createFromJsonFunction(
        discriminantField: string,
        memberProperty: Property,
        namedSubclasses: Map<string, ClassReference>,
        classReference: ClassReference,
        defaultSubclassReference: ClassReference
    ): Function_ {
        const jsonObjectParamName = "json_object";
        const functionBody = [
            new Expression({
                leftSide: "struct",
                rightSide: new FunctionInvocation({
                    onObject: new ClassReference({ name: "JSON", import_: new Import({ from: "json" }) }),
                    baseFunction: new Function_({ name: "parse", functionBody: [] }),
                    arguments_: [
                        new Argument({
                            value: jsonObjectParamName,
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
            new CaseStatement({
                case_: `struct.${discriminantField}`,
                whenBlocks: new Map(Array.from(namedSubclasses.entries()).map(([name, classReference]) => [`"${name}"`, [new Expression({leftSide: memberProperty.name, rightSide: classReference.fromJson(jsonObjectParamName) ?? jsonObjectParamName, isAssignment: true})]])),
                else_: [new Expression({leftSide: memberProperty.name, rightSide: defaultSubclassReference.fromJson(jsonObjectParamName) ?? jsonObjectParamName, isAssignment: true})]
            }),    
            new FunctionInvocation({
                baseFunction: new Function_({ name: "new", functionBody: [] }),
                arguments_: [memberProperty.toArgument(memberProperty.name, true)]
            })
        ];
        const parameters = [new Parameter({ name: "json_object", type: JsonClassReference })];
        const fromJsonDocumentation = `Deserialize a JSON object to an instance of ${classReference.name}`;
        return new Function_({
            name: "from_json",
            returnValue: Array.from(namedSubclasses.values()),
            parameters,
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
                    onObject: memberProperty.toVariable(),
                })
        
            ],
            documentation: toJsonDocumentation
        });  
    }

    private static createValidateRawFunction(
        discriminantField: string,
        namedSubclasses: Map<string, ClassReference>,
    ): Function_ {
        const parameterName = "obj";
        const functionBody = [
            new CaseStatement({
                case_: `struct.${discriminantField}`,
                whenBlocks: new Map(Array.from(namedSubclasses.entries()).map(([name, classReference]) => [`"${name}"`, [new Expression({rightSide: classReference.validateRaw(parameterName), isAssignment: true})]])),
                else_: [new Expression({rightSide: 'raise("Passed value matched no type within the union, validation failed.")', isAssignment: true})]
            }),    
        ];
        const validateRawDocumentation =
        "Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.";

        return new Function_({
            name: "validate_raw",
            returnValue: VoidClassReference,
            parameters: [new Parameter({name: parameterName, type: GenericClassReference})],
            functionBody,
            documentation: validateRawDocumentation,
            isStatic: true
        });
    }


    private static createStaticGeneratorFunctions(namedSubclasses: Map<string, ClassReference>, memberProperty: Property): Function_[] {
        const parameterName = "member";
        return Array.from(namedSubclasses.entries()).map(([name, classReference]) => new Function_({
            name,
            functionBody: [
                new FunctionInvocation({
                    baseFunction: new Function_({ name: "new", functionBody: [] }),
                    arguments_: [memberProperty.toArgument(parameterName, true)]
                })
            ],
            isStatic: true,
            parameters: [new Parameter({name: parameterName, type: classReference})]
        }));
    }

    private static createIsAFunction(memberProperty: Property): Function_ {
        const isADocumentation = "For Union Types, is_a? functionality is delegated to the wrapped member.";

        const parameterName = "obj";
        return new Function_({
            name: "is_a",
            functionBody: [
                new FunctionInvocation({
                    baseFunction: new Function_({ name: "is_a?", functionBody: [] }),
                    onObject: memberProperty.toVariable(),
                    arguments_: [new Argument({isNamed: false, type: GenericClassReference, value: parameterName})]
                })
        
            ],
            parameters: [new Parameter({name: parameterName, type: GenericClassReference, isNamed: false})],
            documentation: isADocumentation
        });        
    }
}
