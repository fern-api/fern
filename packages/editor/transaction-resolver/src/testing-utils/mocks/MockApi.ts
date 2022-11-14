import { TransactionGenerator } from "@fern-api/transaction-generator";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { v4 as uuidv4 } from "uuid";
import { TransactionHandler } from "../../TransactionHandler";
import { Mock } from "./Mock";
import { MockPackage } from "./MockPackage";

export class MockApi extends Mock {
    public readonly definition: FernApiEditor.Api;
    private transactionHandler: TransactionHandler;

    constructor(name = "Mock API") {
        super();
        this.definition = {
            apiId: uuidv4() as FernApiEditor.ApiId,
            apiName: name,
            rootPackages: [],
            packages: {},
            endpoints: {},
            types: {},
            errors: {},
        };
        this.transactionHandler = new TransactionHandler(this.definition);
    }

    public addPackage(name?: string): MockPackage {
        const package_ = new MockPackage({
            name,
            applyTransaction: this.applyTransaction.bind(this),
        });
        this.transactionHandler.applyTransaction(
            this.definition,
            TransactionGenerator.createPackage({
                packageId: package_.packageId as FernApiEditor.PackageId,
                packageName: package_.packageName,
            })
        );
        return package_;
    }

    public applyTransaction(transaction: FernApiEditor.transactions.Transaction): void {
        return this.transactionHandler.applyTransaction(this.definition, transaction);
    }
}
