import type { Logger } from "@fern-api/logger";

export interface SchemaCollisionTracker {
    getUniqueSchemaId(baseId: string, logger?: Logger, resolveCollisions?: boolean): string;
    getUniqueTitleName(
        baseTitle: string,
        originalSchemaId: string,
        logger?: Logger,
        resolveCollisions?: boolean
    ): string;
    reset(): void;
}

export function createSchemaCollisionTracker(): SchemaCollisionTracker {
    const schemaIdRegistry = new Map<string, number>();
    const titleNameRegistry = new Map<string, number>();

    return {
        getUniqueSchemaId(baseId: string, logger?: Logger, resolveCollisions = true): string {
            const existingCount = schemaIdRegistry.get(baseId) || 0;

            if (existingCount > 0) {
                if (!resolveCollisions) {
                    throw new Error(
                        `Schema name collision detected: '${baseId}' already exists. Use 'resolve-schema-collisions: true' to automatically resolve collisions.`
                    );
                }
                const uniqueId = `${baseId}${existingCount + 1}`;
                logger?.warn?.(
                    `Schema name collision detected: '${baseId}' already exists. Renaming to '${uniqueId}' to avoid conflicts.`
                );
                schemaIdRegistry.set(baseId, existingCount + 1);
                return uniqueId;
            }

            schemaIdRegistry.set(baseId, existingCount + 1);
            return baseId;
        },

        getUniqueTitleName(
            baseTitle: string,
            originalSchemaId: string,
            logger?: Logger,
            resolveCollisions = true
        ): string {
            const existingCount = titleNameRegistry.get(baseTitle) || 0;

            if (existingCount > 0) {
                if (!resolveCollisions) {
                    throw new Error(
                        `Schema title collision detected: Multiple schemas use title '${baseTitle}'. Use 'resolve-schema-collisions: true' to automatically resolve collisions.`
                    );
                }
                const uniqueName = `${baseTitle}${existingCount + 1}`;
                logger?.warn(
                    `Schema title collision detected: Multiple schemas use title '${baseTitle}'. ` +
                        `Schema '${originalSchemaId}' retitled to '${uniqueName}' to avoid conflicts.`
                );
                titleNameRegistry.set(baseTitle, existingCount + 1);
                return uniqueName;
            }

            titleNameRegistry.set(baseTitle, existingCount + 1);
            return baseTitle;
        },

        reset(): void {
            schemaIdRegistry.clear();
            titleNameRegistry.clear();
        }
    };
}
