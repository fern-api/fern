import { EditorItemIdGenerator } from "@fern-api/editor-item-id-generator";
import { TransactionGenerator } from "@fern-api/transaction-generator";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { MockDefinitionItem } from "./MockDefinitionItem";
import { MockEndpoint } from "./MockEndpoint";
import { MockError } from "./MockError";
import { MockType } from "./MockType";

export declare namespace MockPackage {
    export interface Init extends MockDefinitionItem.Init {
        name?: string;
    }
}

export class MockPackage extends MockDefinitionItem {
    public packageId: FernApiEditor.PackageId;
    public packageName: string;

    constructor({ name = "Mock Package", ...superInit }: MockPackage.Init) {
        super(superInit);
        this.packageId = EditorItemIdGenerator.package();
        this.packageName = name;
    }

    public addPackage(name?: string): MockPackage {
        const package_ = new MockPackage({
            name,
            applyTransaction: this.applyTransaction.bind(this),
        });
        this.applyTransaction(
            TransactionGenerator.createPackage({
                packageId: package_.packageId as FernApiEditor.PackageId,
                packageName: package_.packageName,
                parent: this.packageId as FernApiEditor.PackageId,
            })
        );
        return package_;
    }

    public addEndpoint(name?: string): MockEndpoint {
        const endpoint = new MockEndpoint({
            name,
            applyTransaction: this.applyTransaction.bind(this),
        });
        this.applyTransaction(
            TransactionGenerator.createEndpoint({
                parent: this.packageId as FernApiEditor.PackageId,
                endpointId: endpoint.endpointId as FernApiEditor.EndpointId,
                endpointName: endpoint.endpointName,
            })
        );
        return endpoint;
    }

    public addType({ name, shape }: { name?: string; shape?: FernApiEditor.Shape } = {}): MockType {
        const type = new MockType({
            name,
            shape,
            applyTransaction: this.applyTransaction.bind(this),
        });
        this.applyTransaction(
            TransactionGenerator.createType({
                parent: this.packageId as FernApiEditor.PackageId,
                typeId: type.typeId as FernApiEditor.TypeId,
                typeName: type.typeName,
                shape: type.shape,
            })
        );
        return type;
    }

    public addObject({
        name,
        shape = { properties: [], extensions: [] },
    }: { name?: string; shape?: FernApiEditor.ObjectShape } = {}): MockType {
        return this.addType({ name, shape: FernApiEditor.Shape.object(shape) });
    }

    public addUnion({
        name,
        shape = { discriminant: "type", members: [] },
    }: { name?: string; shape?: FernApiEditor.UnionShape } = {}): MockType {
        return this.addType({ name, shape: FernApiEditor.Shape.union(shape) });
    }

    public addError(name?: string): MockError {
        const error = new MockError({
            name,
            applyTransaction: this.applyTransaction.bind(this),
        });
        this.applyTransaction(
            TransactionGenerator.createError({
                parent: this.packageId as FernApiEditor.PackageId,
                errorId: error.errorId as FernApiEditor.ErrorId,
                errorName: error.errorName,
            })
        );
        return error;
    }
}
