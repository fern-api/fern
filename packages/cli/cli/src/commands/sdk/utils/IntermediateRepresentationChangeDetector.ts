import { assertNever } from "@fern-api/core-utils";
import { ContainerType, IntermediateRepresentation, Type, TypeDeclaration, TypeReference } from "@fern-api/ir-sdk";

import { CliContext } from "../../../cli-context/CliContext";

export declare namespace IntermediateRepresentationChangeDetector {
    export type Result = {
        bump: "major" | "minor";
        isBreaking: boolean;
    };
}

/**
 * Detects breaking changes between intermediate representations of APIs.
 */
export class IntermediateRepresentationChangeDetector {
    private context: CliContext;

    constructor(context: CliContext) {
        this.context = context;
    }

    public async detectChanges({
        from,
        to
    }: {
        from: IntermediateRepresentation;
        to: IntermediateRepresentation;
    }): Promise<IntermediateRepresentationChangeDetector.Result> {
        this.context.logger.debug("Running breaking change detector...");
        const isBreaking = this.isBreaking({ from, to });
        this.context.logger.debug("Successfully ran breaking change detector.");
        return {
            bump: isBreaking ? "major" : "minor",
            isBreaking
        };
    }

    private isBreaking({ from, to }: { from: IntermediateRepresentation; to: IntermediateRepresentation }): boolean {
        const typesBreakingChanges = this.detectTypeBreakingChanges({
            from: from.types,
            to: to.types
        });
        // TODO: Add support for errors, services, and webhooks.
        // const errorsBreakingChanges = this.detectErrorsBreakingChanges({
        //     from: from.errors,
        //     to: to.errors
        // });
        // const servicesBreakingChanges = this.detectServicesBreakingChanges({
        //     from: from.services,
        //     to: to.services
        // });
        // const webhooksBreakingChanges = this.detectWebhooksBreakingChanges({
        //     from: from.webhookGroups,
        //     to: to.webhookGroups
        // });
        return typesBreakingChanges; // || errorsBreakingChanges || servicesBreakingChanges || webhooksBreakingChanges;
    }

    private detectTypeBreakingChanges({
        from,
        to
    }: {
        from: Record<string, TypeDeclaration>;
        to: Record<string, TypeDeclaration>;
    }): boolean {
        if (Object.keys(from).length !== Object.keys(to).length) {
            return true;
        }
        return Object.entries(from).some(([typeId, fromType]) => {
            const toType = to[typeId];
            if (!toType) {
                return true;
            }
            return !this.areTypeDeclarationsCompatible({
                from: fromType,
                to: toType
            });
        });
    }

    private areTypeDeclarationsCompatible({ from, to }: { from: TypeDeclaration; to: TypeDeclaration }): boolean {
        if (from.name !== to.name) {
            return false;
        }
        return this.areTypeShapesCompatible({
            from: from.shape,
            to: to.shape
        });
    }

    private areTypeShapesCompatible({ from, to }: { from: Type; to: Type }): boolean {
        if (from.type === "alias" && to.type === "alias") {
            return this.areAliasTypesCompatible({
                from,
                to
            });
        }
        if (from.type === "enum" && to.type === "enum") {
            return this.areEnumTypesCompatible({
                from,
                to
            });
        }
        // TODO: Add support for object, union, and unknown types.
        return false;
    }

    private areAliasTypesCompatible({ from, to }: { from: Type.Alias; to: Type.Alias }): boolean {
        return this.areTypesCompatible({
            from: from.aliasOf,
            to: to.aliasOf
        });
    }

    private areEnumTypesCompatible({ from, to }: { from: Type.Enum; to: Type.Enum }): boolean {
        // TODO: Compare the enum name and wire values.
        return false;
    }

    private areTypesCompatible({ from, to }: { from: TypeReference; to: TypeReference }): boolean {
        if (from.type === "primitive" && to.type === "primitive") {
            return this.arePrimitiveTypesCompatible({
                from,
                to
            });
        }
        if (from.type === "container" && to.type === "container") {
            return this.areContainerTypesCompatible({
                from: from.container,
                to: to.container
            });
        }
        if (from.type === "named" && to.type === "named") {
            return this.areNamedTypesCompatible({
                from,
                to
            });
        }
        if (from.type === "unknown" && to.type === "unknown") {
            return true;
        }
        return false;
    }

    private arePrimitiveTypesCompatible({
        from,
        to
    }: {
        from: TypeReference.Primitive;
        to: TypeReference.Primitive;
    }): boolean {
        return from.primitive.v1 === to.primitive.v1;
    }

    private areContainerTypesCompatible({ from, to }: { from: ContainerType; to: ContainerType }): boolean {
        if (from.type !== to.type) {
            return false;
        }
        switch (from.type) {
            case "list":
                if (to.type !== "list") return false;
                return this.areTypesCompatible({
                    from: from.list,
                    to: to.list
                });
            case "set":
                if (to.type !== "set") return false;
                return this.areTypesCompatible({
                    from: from.set,
                    to: to.set
                });
            case "map":
                if (to.type !== "map") return false;
                return (
                    this.areTypesCompatible({
                        from: from.keyType,
                        to: to.keyType
                    }) &&
                    this.areTypesCompatible({
                        from: from.valueType,
                        to: to.valueType
                    })
                );
            case "optional":
                if (to.type !== "optional") return false;
                return this.areTypesCompatible({
                    from: from.optional,
                    to: to.optional
                });
            case "nullable":
                if (to.type !== "nullable") return false;
                return this.areTypesCompatible({
                    from: from.nullable,
                    to: to.nullable
                });
            case "literal":
                if (to.type !== "literal") return false;
                return from.literal === to.literal;
            default:
                assertNever(from);
        }
    }

    private areNamedTypesCompatible({ from, to }: { from: TypeReference.Named; to: TypeReference.Named }): boolean {
        // TODO: We also need to confirm that they have all the same properties.
        return from.typeId === to.typeId;
    }
}
