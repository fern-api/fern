import {
    ContainerType,
    DeclaredTypeName,
    HttpEndpoint,
    Name,
    NameAndWireValue,
    TypeReference
} from "@fern-fern/ir-sdk/api";
import { FdrSnippetTemplate } from "@fern-fern/snippet-sdk";
import { getTextOfTsNode, ImportsManager, NpmPackage, PackageId } from "@fern-typescript/commons";
import { Project, SourceFile, ts } from "ts-morph";
import { SdkContextImpl } from "./contexts/SdkContextImpl";

// Write this in the fern def to share between FE + BE
const TEMPLATE_SENTINEL = "$FERN_INPUT";

export class TemplateGenerator {
    constructor(
        private readonly npmPackage: NpmPackage,
        private readonly endpoint: HttpEndpoint,
        private readonly packageId: PackageId,
        private readonly rootPackageId: PackageId,
        private readonly retainOriginalCasing: boolean,
        private readonly getEndpointFunctionName: (endpoint: HttpEndpoint) => string,
        private readonly generateSdkContext: (
            args: { sourceFile: SourceFile; importsManager: ImportsManager },
            opts: { isForSnippet: boolean }
        ) => SdkContextImpl
    ) {}

    private getPropertyKey(name: Name): string {
        return this.retainOriginalCasing ? name.originalName : name.camelCase.unsafeName;
    }

    // Get the dot access path to the object within the broader json object
    private getBreadCrumbPath({
        wireOrOriginalName,
        nameBreadcrumbs
    }: {
        wireOrOriginalName: string | undefined;
        nameBreadcrumbs: string[] | undefined;
    }): string | undefined {
        let crumbs: string[] = [];
        if (wireOrOriginalName == null && nameBreadcrumbs != null) {
            crumbs = nameBreadcrumbs;
        } else if (wireOrOriginalName != null && nameBreadcrumbs == null) {
            crumbs = [wireOrOriginalName];
        } else if (wireOrOriginalName != null && nameBreadcrumbs != null) {
            crumbs = [...nameBreadcrumbs, wireOrOriginalName];
        } else {
            // They're both undefined, return undefined
            return undefined;
        }

        return crumbs.join(".");
    }

    private getBaseGenericTemplate({
        name,
        location,
        wireOrOriginalName,
        nameBreadcrumbs
    }: {
        name: string | undefined;
        location: FdrSnippetTemplate.PayloadLocation;
        wireOrOriginalName: string | undefined;
        nameBreadcrumbs: string[];
    }): FdrSnippetTemplate.Template {
        return FdrSnippetTemplate.Template.generic({
            imports: [],
            templateString: name != null ? `${name}: ${TEMPLATE_SENTINEL}` : `"${TEMPLATE_SENTINEL}"`,
            isOptional: true,
            templateInputs: [
                FdrSnippetTemplate.TemplateInput.payload({
                    location,
                    path: this.getBreadCrumbPath({ wireOrOriginalName, nameBreadcrumbs })
                })
            ]
        });
    }

    private getNamedTypeTemplate({
        typeName,
        name,
        location,
        wireOrOriginalName,
        nameBreadcrumbs,
        indentationLevel
    }: {
        typeName: DeclaredTypeName;
        name: string | undefined;
        location: FdrSnippetTemplate.PayloadLocation;
        wireOrOriginalName: string | undefined;
        nameBreadcrumbs: string[];
        indentationLevel: number;
    }): FdrSnippetTemplate.Template | undefined {
        return;
    }

    private getContainerTemplate({
        containerType,
        name,
        location,
        wireOrOriginalName,
        nameBreadcrumbs,
        indentationLevel
    }: {
        containerType: ContainerType;
        name: string | undefined;
        location: FdrSnippetTemplate.PayloadLocation;
        wireOrOriginalName: string | undefined;
        nameBreadcrumbs: string[];
        indentationLevel: number;
    }): FdrSnippetTemplate.Template | undefined {
        return containerType._visit<FdrSnippetTemplate.Template | undefined>({
            list: (list) => {},
            map: (map) => {},
            set: (set) => {},
            optional: (optionalType) =>
                this.getTemplateFromTypeReference({
                    typeReference: optionalType,
                    name,
                    location,
                    wireOrOriginalName,
                    nameBreadcrumbs,
                    indentationLevel
                }),
            literal: () => undefined,
            _other: () => undefined
        });
    }

    private getTemplateFromTypeReference({
        typeReference,
        name,
        location,
        wireOrOriginalName,
        nameBreadcrumbs,
        indentationLevel
    }: {
        typeReference: TypeReference;
        name: string | undefined;
        location: FdrSnippetTemplate.PayloadLocation;
        wireOrOriginalName: string | undefined;
        nameBreadcrumbs: string[];
        indentationLevel: number;
    }): FdrSnippetTemplate.Template | undefined {
        // Do not insert literals into templates
        if (typeReference.type === "container" && typeReference.container.type === "literal") {
            return;
        }
        return typeReference._visit({
            primitive: () => this.getBaseGenericTemplate({ name, location, wireOrOriginalName, nameBreadcrumbs }),
            unknown: () => this.getBaseGenericTemplate({ name, location, wireOrOriginalName, nameBreadcrumbs }),
            container: (containerType) =>
                this.getContainerTemplate({
                    containerType,
                    name,
                    location,
                    wireOrOriginalName,
                    nameBreadcrumbs,
                    indentationLevel
                }),
            named: (typeName) =>
                this.getNamedTypeTemplate({
                    typeName,
                    name,
                    location,
                    wireOrOriginalName,
                    nameBreadcrumbs,
                    indentationLevel
                }),
            _other: () => undefined
        });
    }

    private getTemplateInputFromTemplate(template: FdrSnippetTemplate.Template): FdrSnippetTemplate.TemplateInput {
        return FdrSnippetTemplate.TemplateInput.template(template);
    }

    private getTemplateInputFromTypeReference(args: {
        typeReference: TypeReference;
        name: string | undefined;
        location: FdrSnippetTemplate.PayloadLocation;
        wireOrOriginalName: string | undefined;
        nameBreadcrumbs: string[];
        indentationLevel: number;
    }): FdrSnippetTemplate.TemplateInput | undefined {
        const template = this.getTemplateFromTypeReference(args);
        return template != null ? this.getTemplateInputFromTemplate(template) : template;
    }

    private getNonRequestParametersFromEndpoint(): FdrSnippetTemplate.TemplateInput[] {
        const nrp: FdrSnippetTemplate.TemplateInput[] = [];
        this.endpoint.allPathParameters.forEach((pathParameter) => {
            const pt = this.getTemplateInputFromTypeReference({
                typeReference: pathParameter.valueType,
                name: undefined,
                location: FdrSnippetTemplate.PayloadLocation.Path,
                wireOrOriginalName: pathParameter.name.originalName,
                nameBreadcrumbs: [],
                indentationLevel: 0
            });
            if (pt != null) {
                nrp.push(pt);
            }
        });

        return nrp;
    }

    private getRequestParametersFromEndpoint(): FdrSnippetTemplate.TemplateInput[] {
        const nrp: FdrSnippetTemplate.TemplateInput[] = [];
        this.endpoint.queryParameters.forEach((pathParameter) => {
            const pt = this.getTemplateInputFromTypeReference({
                typeReference: pathParameter.valueType,
                name: this.getPropertyKey(pathParameter.name.name),
                location: FdrSnippetTemplate.PayloadLocation.Query,
                wireOrOriginalName: pathParameter.name.wireValue,
                nameBreadcrumbs: [],
                indentationLevel: 0
            });
            if (pt != null) {
                nrp.push(pt);
            }
        });

        this.endpoint.headers.forEach((header) => {
            const pt = this.getTemplateInputFromTypeReference({
                typeReference: header.valueType,
                name: this.getPropertyKey(header.name.name),
                location: FdrSnippetTemplate.PayloadLocation.Headers,
                wireOrOriginalName: header.name.wireValue,
                nameBreadcrumbs: [],
                indentationLevel: 0
            });
            if (pt != null) {
                nrp.push(pt);
            }
        });

        const rbpt = this.endpoint.requestBody?._visit<(FdrSnippetTemplate.TemplateInput | undefined)[] | undefined>({
            // These two are handled the same way, get the parameters and map them
            inlinedRequestBody: (irb) =>
                irb.properties.map((prop) =>
                    this.getTemplateInputFromTypeReference({
                        typeReference: prop.valueType,
                        name: this.getPropertyKey(prop.name.name),
                        location: FdrSnippetTemplate.PayloadLocation.Body,
                        wireOrOriginalName: prop.name.wireValue,
                        nameBreadcrumbs: [],
                        indentationLevel: 1
                    })
                ),
            reference: (ref) => [
                this.getTemplateInputFromTypeReference({
                    typeReference: ref.requestBodyType,
                    location: FdrSnippetTemplate.PayloadLocation.Body,
                    name: undefined,
                    wireOrOriginalName: undefined,
                    nameBreadcrumbs: [],
                    indentationLevel: 1
                })
            ],
            fileUpload: (fu) =>
                fu.properties.flatMap((prop) =>
                    prop._visit<FdrSnippetTemplate.TemplateInput | undefined>({
                        file: (file) =>
                            file._visit({
                                file: (f) => this.getTemplateInputFromTemplate(this.fileUploadTemplate(f.key)),
                                fileArray: (fa) =>
                                    this.getTemplateInputFromTemplate(this.fileUploadArrayTemplate(fa.key)),
                                _other: () => undefined
                            }),
                        bodyProperty: (bp) =>
                            this.getTemplateInputFromTypeReference({
                                typeReference: bp.valueType,
                                name: this.getPropertyKey(bp.name.name),
                                location: FdrSnippetTemplate.PayloadLocation.Body,
                                wireOrOriginalName: bp.name.wireValue,
                                nameBreadcrumbs: [],
                                indentationLevel: 1
                            }),
                        _other: () => undefined
                    })
                ),
            // Bytes currently not supported
            bytes: () => undefined,
            // No sense in throwing, just ignore this.
            _other: () => undefined
        });
        if (rbpt != null) {
            for (const ti of rbpt) {
                if (ti != null) {
                    nrp.push(ti);
                }
            }
        }

        return nrp;
    }

    private fileUploadArrayTemplate(key: NameAndWireValue) {
        return FdrSnippetTemplate.Template.iterable({
            isOptional: true,
            containerTemplateString: `[\n\t\t${TEMPLATE_SENTINEL}\n\t]`,
            delimiter: ",\n\t\t",
            innerTemplate: this.fileUploadTemplate(key, true),
            templateInput: FdrSnippetTemplate.TemplateInput.payload({
                location: FdrSnippetTemplate.PayloadLocation.Body,
                path: key.wireValue
            })
        });
    }

    private fileUploadTemplate(key: NameAndWireValue, isNested?: boolean) {
        return FdrSnippetTemplate.Template.generic({
            imports: ['import fs from "fs";'],
            templateString: `fs.createReadStream('${TEMPLATE_SENTINEL}')`,
            isOptional: false,
            templateInputs:
                isNested !== true
                    ? [
                          FdrSnippetTemplate.TemplateInput.payload({
                              location: FdrSnippetTemplate.PayloadLocation.Body,
                              path: key.wireValue
                          })
                      ]
                    : []
        });
    }

    // Should take in all params, filter out request to put at the back
    // Then create type reference templates for everything
    // Then make the request param manual to ensure that it acts like a hash
    private generateTopLevelSnippetTemplateInput(): FdrSnippetTemplate.TemplateInput[] {
        const topLevelTemplateInputs: FdrSnippetTemplate.TemplateInput[] = [];
        // TS params are essentially going to be ordered, if they're not named request then they're going to go in loose (no name)
        // if they're in the request object then they're named within this hash (this.requestExample)
        // path parameters matter since they are unnamed, if they're not present undefined is required
        // Generally its: (`path parameters`, {`request parameter`}}
        // If there's a file in the requestbody properties they go first????
        // Add the unnamed, non-request params first
        topLevelTemplateInputs.push(
            FdrSnippetTemplate.TemplateInput.template(
                FdrSnippetTemplate.Template.generic({
                    imports: [],
                    templateString: TEMPLATE_SENTINEL,
                    isOptional: false,
                    inputDelimiter: ",\n\t",
                    templateInputs: this.getNonRequestParametersFromEndpoint()
                })
            )
        );

        // Finally, if there's a request param, build that.
        topLevelTemplateInputs.push(
            FdrSnippetTemplate.TemplateInput.template(
                FdrSnippetTemplate.Template.generic({
                    imports: [],
                    templateString: `{\n\t\t${TEMPLATE_SENTINEL}\n\t}`,
                    isOptional: true,
                    inputDelimiter: ",\n\t\t",
                    templateInputs: this.getRequestParametersFromEndpoint()
                })
            )
        );
        return topLevelTemplateInputs;
    }

    private generateSnippetTemplate(): FdrSnippetTemplate.VersionedSnippetTemplate | undefined {
        const project = new Project({
            useInMemoryFileSystem: true
        });
        const clientInstantiationSourceFile = project.createSourceFile("snippet");
        const ciImportsManager = new ImportsManager();

        const context = this.generateSdkContext(
            { sourceFile: clientInstantiationSourceFile, importsManager: ciImportsManager },
            { isForSnippet: true }
        );
        const clientInstantiation = context.sdkClientClass
            .getGeneratedSdkClientClass(this.rootPackageId)
            .instantiateAsRoot({ context, npmPackage: this.npmPackage });
        const clientAssignment = ts.factory.createVariableStatement(
            undefined,
            ts.factory.createVariableDeclarationList(
                [
                    ts.factory.createVariableDeclaration(
                        context.sdkInstanceReferenceForSnippet,
                        undefined,
                        undefined,
                        clientInstantiation
                    )
                ],
                ts.NodeFlags.Const
            )
        );
        // Create the client instantiation snippet
        clientInstantiationSourceFile.addStatements([getTextOfTsNode(clientAssignment)]);
        ciImportsManager.writeImportsToSourceFile(clientInstantiationSourceFile);
        const clientInstantiationString = clientInstantiationSourceFile.getText();

        // Recurse over the parameters to the function
        const generatedEndpoint = context.sdkClientClass
            .getGeneratedSdkClientClass(this.packageId)
            .getEndpoint({ context, endpointId: this.endpoint.id });
        const parameters = generatedEndpoint?.getSignature(context).parameters;
        const topLevelTemplateInputs = this.generateTopLevelSnippetTemplateInput(parameters ?? []);

        // Create the outer function snippet
        const clientClass = context.sdkClientClass.getGeneratedSdkClientClass(this.packageId);
        const endpointClientAccess = clientClass.accessFromRootClient({
            referenceToRootClient: context.sdkInstanceReferenceForSnippet
        });
        const endpointClientAccessString = getTextOfTsNode(endpointClientAccess);
        return FdrSnippetTemplate.VersionedSnippetTemplate.v1({
            clientInstantiation: clientInstantiationString,
            functionInvocation: FdrSnippetTemplate.Template.generic({
                imports: [],
                templateString: `await ${endpointClientAccessString}.${this.getEndpointFunctionName(
                    endpoint
                )}(\n\t${TEMPLATE_SENTINEL}\n)`,
                // templateString: endpointInvocationString,
                isOptional: false,
                inputDelimiter: ",\n\t",
                templateInputs: topLevelTemplateInputs
            })
        });
    }
}
