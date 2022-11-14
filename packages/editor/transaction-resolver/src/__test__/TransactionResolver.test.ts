import { EditorItemIdGenerator } from "@fern-api/editor-item-id-generator";
import { TransactionGenerator } from "@fern-api/transaction-generator";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { TransactionResolver } from "../TransactionResolver";

describe("TransactionResolver", () => {
    it("processes single transaction", () => {
        const resolver = new TransactionResolver({ definition: createEmptyDefinition() });
        const packageId = EditorItemIdGenerator.package();
        resolver.applyTransaction(
            TransactionGenerator.createPackage({
                packageId,
                packageName: "My package",
            })
        );
        const expectedPackage: FernApiEditor.Package = {
            packageId,
            packageName: "My package",
            packages: [],
            endpoints: [],
            errors: [],
            types: [],
        };
        expect(resolver.definition.packages).toEqual({
            [expectedPackage.packageId]: expectedPackage,
        });
    });

    it("processes bulk transactions", () => {
        const resolver = new TransactionResolver({ definition: createEmptyDefinition() });
        const packageId = EditorItemIdGenerator.package();
        const endpointId = EditorItemIdGenerator.endpoint();
        resolver.applyTransactions([
            TransactionGenerator.createPackage({
                packageId,
                packageName: "My package",
            }),
            TransactionGenerator.createEndpoint({
                parent: packageId,
                endpointId,
                endpointName: "My endpoint",
            }),
        ]);
        const expectedPackage: FernApiEditor.Package = {
            packageId,
            packageName: "My package",
            packages: [],
            endpoints: [endpointId],
            errors: [],
            types: [],
        };
        expect(resolver.definition.packages).toEqual({
            [expectedPackage.packageId]: expectedPackage,
        });
    });

    it("transformations are immutable", () => {
        const initialDefinition: FernApiEditor.Api = createEmptyDefinition();
        const resolver = new TransactionResolver({ definition: initialDefinition });
        resolver.applyTransaction(
            TransactionGenerator.createPackage({
                packageId: EditorItemIdGenerator.package(),
                packageName: "My package",
            })
        );

        expect(Object.keys(initialDefinition.packages)).toHaveLength(0);
    });

    it("listener called on updates", () => {
        let definition: FernApiEditor.Api = createEmptyDefinition();
        const listener: TransactionResolver.Listener = (newDefinition) => {
            definition = newDefinition;
        };
        const resolver = new TransactionResolver({ definition });
        resolver.watch(listener);
        resolver.applyTransaction(
            TransactionGenerator.createPackage({
                packageId: EditorItemIdGenerator.package(),
                packageName: "My package",
            })
        );
        expect(Object.keys(definition.packages)).toHaveLength(1);
    });

    it("listener not called after unsubscribe", () => {
        let definition: FernApiEditor.Api = createEmptyDefinition();
        const listener: TransactionResolver.Listener = (newDefinition) => {
            definition = newDefinition;
        };
        const resolver = new TransactionResolver({ definition });
        const unsubscribe = resolver.watch(listener);

        resolver.applyTransaction(
            TransactionGenerator.createPackage({
                packageId: EditorItemIdGenerator.package(),
                packageName: "My package",
            })
        );
        unsubscribe();
        resolver.applyTransaction(
            TransactionGenerator.createPackage({
                packageId: EditorItemIdGenerator.package(),
                packageName: "My package",
            })
        );

        expect(Object.keys(definition.packages)).toHaveLength(1);
    });

    it("listener only called once for bulk transactions", () => {
        let numTimesCalled = 0;
        const listener: TransactionResolver.Listener = () => {
            numTimesCalled++;
        };
        const resolver = new TransactionResolver({ definition: createEmptyDefinition() });
        resolver.watch(listener);
        resolver.applyTransactions([
            TransactionGenerator.createPackage({
                packageId: EditorItemIdGenerator.package(),
                packageName: "My package",
            }),
            TransactionGenerator.createPackage({
                packageId: EditorItemIdGenerator.package(),
                packageName: "My other package",
            }),
        ]);
        expect(numTimesCalled).toBe(1);
    });
});

function createEmptyDefinition(): FernApiEditor.Api {
    return {
        apiId: "my-api-id" as FernApiEditor.ApiId,
        apiName: "my-api-name",
        rootPackages: [],
        packages: {},
        endpoints: {},
        types: {},
        errors: {},
    };
}
