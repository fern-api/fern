import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { createBaseTransaction } from "../testing-utils/createBaseTransaction";
import { generateEndpointId, generatePackageId } from "../testing-utils/ids";
import { MockApi } from "../testing-utils/mocks/MockApi";
import { TransactionResolver } from "../TransactionResolver";

describe("TransactionResolver", () => {
    it("processes single transaction", () => {
        const resolver = new TransactionResolver({ api: new MockApi() });
        const packageId = generatePackageId();
        resolver.applyTransaction(
            FernApiEditor.transactions.Transaction.createPackage({
                ...createBaseTransaction(),
                packageId,
                packageName: "My package",
            })
        );
        const expectedPackage: FernApiEditor.Package = {
            packageId,
            packageName: "My package",
            endpoints: [],
            errors: [],
            types: [],
        };
        expect(resolver.api.packages).toEqual([expectedPackage]);
    });

    it("processes bulk transactions", () => {
        const resolver = new TransactionResolver({ api: new MockApi() });
        const packageId = generatePackageId();
        const endpointId = generateEndpointId();
        resolver.applyTransactions([
            FernApiEditor.transactions.Transaction.createPackage({
                ...createBaseTransaction(),
                packageId,
                packageName: "My package",
            }),
            FernApiEditor.transactions.Transaction.createEndpoint({
                ...createBaseTransaction(),
                packageId,
                endpointId,
                endpointName: "My endpoint",
            }),
        ]);
        const expectedPackage: FernApiEditor.Package = {
            packageId,
            packageName: "My package",
            endpoints: [
                {
                    endpointId,
                    endpointName: "My endpoiny",
                },
            ],
            errors: [],
            types: [],
        };
        expect(resolver.api.packages).toEqual([expectedPackage]);
    });

    it("transformations are immutable", () => {
        const initialApi: FernApiEditor.Api = {
            apiId: "my-api-id",
            apiName: "My API",
            packages: [],
        };
        const resolver = new TransactionResolver({ api: initialApi });
        resolver.applyTransaction(
            FernApiEditor.transactions.Transaction.createPackage({
                ...createBaseTransaction(),
                packageId: generatePackageId(),
                packageName: "My package",
            })
        );

        expect(initialApi.packages).toHaveLength(0);
    });

    it("listener called on updates", () => {
        let api: FernApiEditor.Api = { apiId: "my-api-id", apiName: "My API", packages: [] };
        const listener: TransactionResolver.Listener = (newApi) => {
            api = newApi;
        };
        const resolver = new TransactionResolver({ api });
        resolver.watch(listener);
        resolver.applyTransaction(
            FernApiEditor.transactions.Transaction.createPackage({
                ...createBaseTransaction(),
                packageId: generatePackageId(),
                packageName: "My package",
            })
        );
        expect(api.packages).toHaveLength(1);
    });

    it("listener not called after unsubscribe", () => {
        let api: FernApiEditor.Api = { apiId: "my-api-id", apiName: "My API", packages: [] };
        const listener: TransactionResolver.Listener = (newApi) => {
            api = newApi;
        };
        const resolver = new TransactionResolver({ api });
        const unsubscribe = resolver.watch(listener);

        resolver.applyTransaction(
            FernApiEditor.transactions.Transaction.createPackage({
                ...createBaseTransaction(),
                packageId: generatePackageId(),
                packageName: "My package",
            })
        );
        unsubscribe();
        resolver.applyTransaction(
            FernApiEditor.transactions.Transaction.createPackage({
                ...createBaseTransaction(),
                packageId: generatePackageId(),
                packageName: "My package",
            })
        );

        expect(api.packages).toHaveLength(1);
    });

    it("listener only called once for bulk transactions", () => {
        let numTimesCalled = 0;
        const listener: TransactionResolver.Listener = () => {
            numTimesCalled++;
        };
        const resolver = new TransactionResolver({ api: new MockApi() });
        resolver.watch(listener);
        resolver.applyTransactions([
            FernApiEditor.transactions.Transaction.createPackage({
                ...createBaseTransaction(),
                packageId: generatePackageId(),
                packageName: "My package",
            }),
            FernApiEditor.transactions.Transaction.createEndpoint({
                ...createBaseTransaction(),
                packageId: generatePackageId(),
                endpointId: generateEndpointId(),
                endpointName: "My endpoint",
            }),
        ]);
        expect(numTimesCalled).toBe(1);
    });
});
