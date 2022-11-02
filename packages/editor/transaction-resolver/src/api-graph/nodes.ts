import { FernApiEditor } from "@fern-fern/api-editor-sdk";

export interface PackageNode {
    packageId: FernApiEditor.PackageId;
    parent: FernApiEditor.PackageId | undefined;
    packages: Set<FernApiEditor.PackageId>;
    endpoints: Set<FernApiEditor.EndpointId>;
    types: Set<FernApiEditor.TypeId>;
    errors: Set<FernApiEditor.ErrorId>;
}

export interface EndpointNode {
    endpointId: FernApiEditor.EndpointId;
    parent: FernApiEditor.PackageId;
}

export interface TypeNode {
    typeId: FernApiEditor.TypeId;
    parent: FernApiEditor.PackageId;
}

export interface ErrorNode {
    errorId: FernApiEditor.ErrorId;
    parent: FernApiEditor.PackageId;
}
