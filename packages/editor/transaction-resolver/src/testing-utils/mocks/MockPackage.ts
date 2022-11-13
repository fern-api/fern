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
    public packageId: string;
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
                packageId: package_.packageId,
                packageName: package_.packageName,
                parent: this.packageId,
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
                parent: this.packageId,
                endpointId: endpoint.endpointId,
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
                parent: this.packageId,
                typeId: type.typeId,
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

    public addError(name?: string): MockError {
        const error = new MockError({
            name,
            applyTransaction: this.applyTransaction.bind(this),
        });
        this.applyTransaction(
            TransactionGenerator.createError({
                parent: this.packageId,
                errorId: error.errorId,
                errorName: error.errorName,
            })
        );
        return error;
    }
}
