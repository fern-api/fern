import { mapValues } from "lodash-es";

import {
    ErrorDeclaration,
    ErrorId,
    FernFilepath,
    HttpService,
    IntermediateRepresentation,
    Package,
    ServiceId,
    Subpackage,
    SubpackageId,
    TypeDeclaration,
    TypeId,
    WebSocketChannelId,
    WebhookGroupId
} from "@fern-api/ir-sdk";

import { IdGenerator } from "./IdGenerator";
import { FilteredIr } from "./filtered-ir/FilteredIr";

type UnprocessedPackage = Omit<Package, "hasEndpointsInTree">;
type UnprocessedSubpackage = Omit<Subpackage, "hasEndpointsInTree">;

export class PackageTreeGenerator {
    private subpackages: Record<SubpackageId, UnprocessedSubpackage> = {};
    private rootPackage: UnprocessedPackage = {
        docs: undefined,
        fernFilepath: {
            allParts: [],
            packagePath: [],
            file: undefined
        },
        websocket: undefined,
        service: undefined,
        types: [],
        errors: [],
        subpackages: [],
        webhooks: undefined,
        navigationConfig: undefined
    };

    public addPackageRedirection({ from, to }: { from: FernFilepath; to: FernFilepath }): void {
        const package_ = this.getPackageForFernFilepath(from);
        if (package_.navigationConfig != null) {
            throw new Error("Found duplicate navigationConfig for package");
        }
        package_.navigationConfig = {
            pointsTo: IdGenerator.generateSubpackageId(to)
        };
    }

    public addDocs(fernFilepath: FernFilepath, docs: string): void {
        const package_ = this.getPackageForFernFilepath(fernFilepath);
        if (package_.docs != null) {
            throw new Error("Found duplicate docs for package");
        }
        package_.docs = docs;
    }

    public addSubpackage(fernFilepath: FernFilepath): void {
        this.getPackageForFernFilepath(fernFilepath);
    }

    public addType(typeId: TypeId, type: TypeDeclaration): void {
        this.getPackageForFernFilepath(type.name.fernFilepath).types.push(typeId);
    }

    public addError(errorId: ErrorId, error: ErrorDeclaration): void {
        this.getPackageForFernFilepath(error.name.fernFilepath).errors.push(errorId);
    }

    public addService(serviceId: ServiceId, service: HttpService): void {
        const package_ = this.getPackageForFernFilepath(service.name.fernFilepath);
        if (package_.service != null) {
            throw new Error("Found duplicate service for " + serviceId);
        }
        package_.service = serviceId;
    }

    public addWebhookGroup(webhookGroupId: WebhookGroupId, fernFilepath: FernFilepath): void {
        const package_ = this.getPackageForFernFilepath(fernFilepath);
        if (package_.webhooks != null) {
            throw new Error("Found duplicate webhook group for " + webhookGroupId);
        }
        package_.webhooks = webhookGroupId;
    }

    public addWebSocketChannel(websocketChannelId: WebSocketChannelId, fernFilepath: FernFilepath): void {
        const package_ = this.getPackageForFernFilepath(fernFilepath);
        if (package_.webhooks != null) {
            throw new Error("Found duplicate webhook group for " + websocketChannelId);
        }
        package_.websocket = websocketChannelId;
    }

    public build(filteredIr: FilteredIr | undefined): Pick<IntermediateRepresentation, "subpackages" | "rootPackage"> {
        if (filteredIr != null) {
            Object.entries(this.subpackages).forEach(([subpackageId, subpackage]) => {
                if (!filteredIr.hasSubpackageId(subpackageId)) {
                    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                    delete this.subpackages[subpackageId];
                } else {
                    this.subpackages[subpackageId] = {
                        ...subpackage,
                        types: subpackage.types.filter((typeId) => filteredIr.hasTypeId(typeId)),
                        errors: subpackage.errors.filter((errorId) => filteredIr.hasErrorId(errorId)),
                        service:
                            subpackage.service != null
                                ? filteredIr.hasServiceId(subpackage.service)
                                    ? subpackage.service
                                    : undefined
                                : undefined,
                        subpackages: subpackage.subpackages.filter((subpackageId) =>
                            filteredIr.hasSubpackageId(subpackageId)
                        )
                    };
                }
            });

            this.rootPackage = {
                ...this.rootPackage,
                types: this.rootPackage.types.filter((typeId) => filteredIr.hasTypeId(typeId)),
                errors: this.rootPackage.errors.filter((errorId) => filteredIr.hasErrorId(errorId)),
                service:
                    this.rootPackage.service != null
                        ? filteredIr.hasServiceId(this.rootPackage.service)
                            ? this.rootPackage.service
                            : undefined
                        : undefined,
                subpackages: this.rootPackage.subpackages.filter((subpackageId) =>
                    filteredIr.hasSubpackageId(subpackageId)
                ),
                webhooks: this.rootPackage.webhooks != null ? this.rootPackage.webhooks : undefined
            };
        }
        const allSubpackagesWithEndpoints = new Set(this.getAllChildrenWithEndpoints(this.rootPackage));
        return {
            subpackages: mapValues(this.subpackages, (subpackage, subpackageId) => ({
                ...subpackage,
                hasEndpointsInTree: allSubpackagesWithEndpoints.has(subpackageId)
            })),
            rootPackage: {
                ...this.rootPackage,
                hasEndpointsInTree: allSubpackagesWithEndpoints.size > 0 || this.rootPackage.service != null
            }
        };
    }

    public sortRootPackage(subpackagesInOrder: SubpackageId[]): void {
        if (!isEqualIgnoreOrder(this.rootPackage.subpackages, subpackagesInOrder)) {
            throw new Error("Sorted subpackages differ from unsorted packages in root");
        }
        this.rootPackage.subpackages = subpackagesInOrder;
    }

    public sortSubpackage(subpackageId: SubpackageId, subpackagesInOrder: SubpackageId[]): void {
        const subpackage = this.subpackages[subpackageId];
        if (subpackage == null) {
            throw new Error("Subpackage does not exist: " + subpackageId);
        }
        if (!isEqualIgnoreOrder(subpackage.subpackages, subpackagesInOrder)) {
            throw new Error("Sorted subpackages differ from unsorted packages");
        }
        subpackage.subpackages = subpackagesInOrder;
    }

    private getAllSubpackagesWithEndpoints(root: SubpackageId): SubpackageId[] {
        const subpackage = this.subpackages[root];
        if (subpackage == null) {
            throw new Error("Subpackage does not exist: " + root);
        }

        const subpackagesWithEndpoints = this.getAllChildrenWithEndpoints(subpackage);
        if (subpackagesWithEndpoints.length > 0 || subpackage.service != null) {
            subpackagesWithEndpoints.push(root);
        }

        return subpackagesWithEndpoints;
    }

    private getAllChildrenWithEndpoints(package_: UnprocessedPackage): SubpackageId[] {
        return package_.subpackages.flatMap((child) => {
            return [...this.getAllSubpackagesWithEndpoints(child)];
        });
    }

    private getPackageForFernFilepath(
        fernFilepath: FernFilepath,
        index = 0,
        parent = this.rootPackage
    ): UnprocessedPackage {
        const nextPart = fernFilepath.allParts[index];
        if (nextPart == null) {
            return parent;
        }
        const subpackagesInParent = parent.subpackages.map((subpackageId) => {
            const subpackage = this.subpackages[subpackageId];
            if (subpackage == null) {
                throw new Error("Subpackage ID is invalid: " + subpackageId);
            }
            return subpackage;
        });

        const nextIndex = index + 1;
        const fernFilepathForNextParent: FernFilepath = {
            allParts: fernFilepath.allParts.slice(0, nextIndex),
            packagePath: fernFilepath.packagePath.slice(0, nextIndex),
            file: nextIndex === fernFilepath.allParts.length ? fernFilepath.file : undefined
        };
        let nextParent = subpackagesInParent.find(
            (subpackage) => subpackage.name.originalName === nextPart.originalName
        );
        if (nextParent == null) {
            const newParentId = IdGenerator.generateSubpackageId(fernFilepathForNextParent);
            const newParent: UnprocessedSubpackage = {
                docs: undefined,
                fernFilepath: fernFilepathForNextParent,
                name: nextPart,
                service: undefined,
                types: [],
                errors: [],
                subpackages: [],
                navigationConfig: undefined,
                webhooks: undefined,
                websocket: undefined
            };
            this.subpackages[newParentId] = newParent;
            parent.subpackages.push(newParentId);
            nextParent = newParent;
        }

        return this.getPackageForFernFilepath(fernFilepath, nextIndex, nextParent);
    }
}

function isEqualIgnoreOrder(a: string[], b: string[]) {
    if (a.length !== b.length) {
        return false;
    }

    const aSet = new Set(a);
    for (const bElement of b) {
        if (!aSet.has(bElement)) {
            return false;
        }
    }

    return true;
}
