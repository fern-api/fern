import type { Logger } from "@fern-api/logger";

export interface SchemaCollisionTracker {
    getUniqueSchemaId(baseId: string, logger?: Logger, resolveCollisions?: boolean): string;
    getUniqueTitleName(
        baseTitle: string,
        originalSchemaId: string,
        logger?: Logger,
        resolveCollisions?: boolean
    ): string;
    /** Pre-register an existing schema ID so future calls to getUniqueSchemaId detect collisions. */
    registerExistingId(id: string): void;
    reset(): void;
}

export function createSchemaCollisionTracker(): SchemaCollisionTracker {
    const schemaIdRegistry = new Map<string, number>();
    const titleNameRegistry = new Map<string, number>();

    return {
        getUniqueSchemaId(baseId: string, logger?: Logger, resolveCollisions = false): string {
            const existingCount = schemaIdRegistry.get(baseId) || 0;
            schemaIdRegistry.set(baseId, existingCount + 1);

            if (existingCount > 0 && resolveCollisions) {
                const uniqueId = `${baseId}${existingCount + 1}`;
                logger?.warn?.(
                    `Schema name collision detected: '${baseId}' already exists. Renaming to '${uniqueId}' to avoid conflicts.`
                );
                return uniqueId;
            }

            return baseId;
        },

        getUniqueTitleName(
            baseTitle: string,
            originalSchemaId: string,
            logger?: Logger,
            resolveCollisions = false
        ): string {
            const existingCount = titleNameRegistry.get(baseTitle) || 0;
            titleNameRegistry.set(baseTitle, existingCount + 1);

            if (existingCount > 0 && resolveCollisions) {
                const uniqueName = `${baseTitle}${existingCount + 1}`;
                logger?.warn(
                    `Schema title collision detected: Multiple schemas use title '${baseTitle}'. ` +
                        `Schema '${originalSchemaId}' retitled to '${uniqueName}' to avoid conflicts.`
                );
                return uniqueName;
            }

            return baseTitle;
        },

        registerExistingId(id: string): void {
            const existingCount = schemaIdRegistry.get(id) || 0;
            if (existingCount === 0) {
                schemaIdRegistry.set(id, 1);
            }
        },

        reset(): void {
            schemaIdRegistry.clear();
            titleNameRegistry.clear();
        }
    };
}
