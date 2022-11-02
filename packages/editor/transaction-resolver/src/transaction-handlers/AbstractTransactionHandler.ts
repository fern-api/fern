import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { Draft } from "immer";
import { ApiGraph } from "../api-graph/ApiGraph";

export declare namespace AbstractTransactionHandler {
    export interface Init {
        definition: Draft<FernApiEditor.Api>;
        graph: ApiGraph;
    }
}

export abstract class AbstractTransactionHandler<T> {
    protected definition: Draft<FernApiEditor.Api>;
    protected graph: ApiGraph;

    constructor({ definition, graph }: AbstractTransactionHandler.Init) {
        this.definition = definition;
        this.graph = graph;
    }

    public abstract applyTransaction(transaction: T): void;

    protected getPackageOrThrow(packageId: FernApiEditor.PackageId): Draft<FernApiEditor.Package> {
        const package_ = this.definition.packages[packageId];
        if (package_ == null) {
            throw new Error(`Package ${packageId} does not exist`);
        }
        return package_;
    }

    protected getEndpointOrThrow(endpointId: FernApiEditor.EndpointId): Draft<FernApiEditor.Endpoint> {
        const endpoint = this.definition.endpoints[endpointId];
        if (endpoint == null) {
            throw new Error(`Endpoint ${endpointId} does not exist`);
        }
        return endpoint;
    }

    protected getErrorOrThrow(errorId: FernApiEditor.ErrorId): Draft<FernApiEditor.Error> {
        const error = this.definition.errors[errorId];
        if (error == null) {
            throw new Error(`Error ${errorId} does not exist`);
        }
        return error;
    }

    protected getTypeOrThrow(typeId: FernApiEditor.TypeId): Draft<FernApiEditor.Type> {
        const type = this.definition.types[typeId];
        if (type == null) {
            throw new Error(`Type ${typeId} does not exist`);
        }
        return type;
    }
}
