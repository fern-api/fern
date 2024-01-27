import {
    AstNode,
    ClassReference,
    Class_,
    getLocationForServiceDeclaration,
    Import,
    Property
} from "@fern-api/ruby-codegen";
import { HttpService } from "@fern-fern/ir-sdk/api";

export declare namespace ServiceClass {
    export interface Init extends AstNode.Init {
        service: HttpService;
    }
}
export class ServiceClass extends Class_ {
    public service: HttpService;

    constructor({ service, ...rest }: ServiceClass.Init) {
        super({
            ...rest,
            properties: [new Property({ name: "client", type: new ClassReference({ name: "TODOMERGECLIENT" }) })],
            includeInitializer: true,
            functions: [],
            classReference: new ClassReference({
                name: service.name.fernFilepath.file!.pascalCase.safeName,
                import_: new Import({ from: getLocationForServiceDeclaration(service.name), isExternal: false })
            })
        });
        this.service = service;
    }
}
