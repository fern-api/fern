import path from "path";
import urlJoin from "url-join";

import { AbsoluteFilePath } from "@fern-api/fs-utils";

import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import {
    ExampleContainer,
    ExamplePrimitive,
    ExampleTypeReference,
    ExampleTypeReferenceShape,
    ExampleTypeShape,
    HttpEndpoint
} from "@fern-fern/ir-sdk/api";

import { GeneratedFile } from "../utils/GeneratedFile";
import { generateEnumNameFromValues } from "../utils/NamingUtilities";
import { Argument } from "./Argument";
import { ExampleNode } from "./ExampleNode";
import { Import } from "./Import";
import { Property } from "./Property";
import {
    ArrayInstance,
    ClassReferenceFactory,
    DateReference,
    EnumReference,
    HashInstance,
    SetInstance
} from "./classes/ClassReference";
import { Class_ } from "./classes/Class_";
import { AstNode } from "./core/AstNode";
import { Expression } from "./expressions/Expression";
import { FunctionInvocation } from "./functions/FunctionInvocation";
import { Function_ } from "./functions/Function_";

export declare namespace ExampleGenerator {
    export interface Init {
        rootClientClass: Class_;
        crf: ClassReferenceFactory;
        gemName: string;
        apiName: string;
    }
}

type ParsedExample = string | AstNode;

export class ExampleGenerator {
    private rootClientClass: Class_;
    private crf: ClassReferenceFactory;
    private endpointSnippets: FernGeneratorExec.Endpoint[] = [];

    private gemName: string;
    private apiName: string;

    constructor({ rootClientClass, gemName, apiName, crf }: ExampleGenerator.Init) {
        this.rootClientClass = rootClientClass;
        this.crf = crf;
        this.gemName = gemName;
        this.apiName = apiName;

        this.endpointSnippets = [];
    }

    public generateImport(): string {
        return `require "${this.gemName}"`;
    }

    public generateClientSnippet(): Expression {
        return new Expression({
            rightSide: this.rootClientClass.generateSnippet(),
            leftSide: this.apiName,
            isAssignment: true
        });
    }

    public generateEndpointSnippet(func: Function_): ParsedExample | undefined {
        return func.generateSnippet(this.apiName);
    }

    // TODO(dsinghvi): HACKHACK Move this to IR
    private getFullPathForEndpoint(endpoint: HttpEndpoint): string {
        let url = "";
        if (endpoint.fullPath.head.length > 0) {
            url = urlJoin(url, endpoint.fullPath.head);
        }
        for (const part of endpoint.fullPath.parts) {
            url = urlJoin(url, "{" + part.pathParameter + "}");
            if (part.tail.length > 0) {
                url = urlJoin(url, part.tail);
            }
        }
        return url.startsWith("/") ? url : `/${url}`;
    }

    public registerSnippet(func: Function_, endpoint: HttpEndpoint): void {
        const nodes: (AstNode | string)[] = [this.generateClientSnippet()];
        const funcExample = this.generateEndpointSnippet(func);
        if (funcExample != null) {
            nodes.push(funcExample);
            const exampleNode = new ExampleNode({
                children: nodes,
                arbitraryImports: [new Import({ from: this.gemName, isExternal: true })]
            });
            this.endpointSnippets.push({
                id: {
                    path: FernGeneratorExec.EndpointPath(this.getFullPathForEndpoint(endpoint)),
                    method: endpoint.method,
                    identifierOverride: endpoint.id
                },
                snippet: FernGeneratorExec.EndpointSnippet.ruby({
                    client: exampleNode.write({ startingTabSpaces: 0 })
                })
            });
        }
    }

    public generateSnippetsFile(snippetsPath: string): GeneratedFile {
        const directory = path.parse(snippetsPath).dir;
        const filename = path.parse(snippetsPath).base;
        const snippets: FernGeneratorExec.Snippets = {
            endpoints: this.endpointSnippets,
            types: {}
        };
        return new GeneratedFile(filename, AbsoluteFilePath.of(directory), JSON.stringify(snippets, undefined, 4));
    }

    public convertExampleTypeReference(example?: ExampleTypeReference): ParsedExample | undefined {
        return example != null
            ? ExampleTypeReferenceShape._visit<ParsedExample | undefined>(example.shape, {
                  primitive: (primitiveExample) =>
                      ExamplePrimitive._visit<ParsedExample>(primitiveExample, {
                          string: (stringExample) => `"${stringExample.original}"`,
                          integer: (integerExample) => integerExample.toString(),
                          double: (doubleExample) => doubleExample.toString(),
                          long: (longExample) => longExample.toString(),
                          boolean: (booleanExample) => (booleanExample ? "true" : "false"),
                          uuid: (uuidExample) => `"${uuidExample}"`,
                          datetime: (dateTimeExample) =>
                              new FunctionInvocation({
                                  baseFunction: new Function_({ name: "parse", functionBody: [] }),
                                  onObject: new DateReference({ type: "DateTime" }),
                                  arguments_: [
                                      new Argument({ value: `"${dateTimeExample.toISOString()}"`, isNamed: false })
                                  ]
                              }),
                          date: (dateExample) =>
                              new FunctionInvocation({
                                  baseFunction: new Function_({ name: "parse", functionBody: [] }),
                                  onObject: new DateReference({ type: "Date" }),
                                  arguments_: [new Argument({ value: `"${dateExample}"`, isNamed: false })]
                              }),
                          _other: () => {
                              throw new Error("Unknown primitive example: " + primitiveExample.type);
                          }
                      }),
                  container: (ec: ExampleContainer) => {
                      return ExampleContainer._visit<ParsedExample | undefined>(ec, {
                          list: (exampleItems) => {
                              return new ArrayInstance({
                                  contents: exampleItems
                                      .map((item) => this.convertExampleTypeReference(item))
                                      .filter((i): i is ParsedExample => i != null)
                              });
                          },
                          set: (exampleItems) =>
                              new SetInstance({
                                  contents: exampleItems
                                      .map((item) => this.convertExampleTypeReference(item))
                                      .filter((i): i is ParsedExample => i != null)
                              }),
                          map: (examplePairs) =>
                              new HashInstance({
                                  contents: new Map(
                                      examplePairs
                                          .map((kp) => [
                                              this.convertExampleTypeReference(kp.key),
                                              this.convertExampleTypeReference(kp.value)
                                          ])
                                          .filter((e): e is [string, ParsedExample] => e !== undefined)
                                  ),
                                  stringifyValues: false
                              }),
                          optional: (optionalExample) => this.convertExampleTypeReference(optionalExample),
                          _other: () => {
                              throw new Error("Unknown example container type: " + ec.type);
                          }
                      });
                  },
                  named: ({ shape: es, typeName }) => {
                      const cr = this.crf.fromDeclaredTypeName(typeName);
                      return ExampleTypeShape._visit<ParsedExample | undefined>(es, {
                          object: (objectExample) =>
                              new HashInstance({
                                  contents: new Map(
                                      objectExample.properties
                                          .map((prop) => {
                                              const objectValueExample = this.convertExampleTypeReference(prop.value);
                                              return objectValueExample != null
                                                  ? [
                                                        Property.getNameFromIr(prop.name.name),
                                                        this.convertExampleTypeReference(prop.value)
                                                    ]
                                                  : undefined;
                                          })
                                          .filter((e): e is [string, ParsedExample] => e !== undefined)
                                  ),
                                  stringifyValues: false
                              }),
                          union: () => undefined,
                          enum: (enumExample) => {
                              if (cr instanceof EnumReference) {
                                  return generateEnumNameFromValues(enumExample.value.wireValue, cr.values);
                              }
                              return undefined;
                          },
                          alias: (aliasExample) => this.convertExampleTypeReference(aliasExample.value),
                          undiscriminatedUnion: (uuExample) =>
                              this.convertExampleTypeReference(uuExample.singleUnionType),
                          _other: () => {
                              throw new Error("Unknown example container type: " + es.type);
                          }
                      });
                  },
                  unknown: () => JSON.stringify(example.jsonExample),
                  _other: () => {
                      throw new Error("Unknown example type: " + example.shape.type);
                  }
              })
            : undefined;
    }
}
