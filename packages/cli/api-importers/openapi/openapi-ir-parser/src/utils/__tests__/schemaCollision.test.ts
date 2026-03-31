import type { Logger } from "@fern-api/logger";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createSchemaCollisionTracker } from "../schemaCollision";

describe("Schema Collision", () => {
    let mockLogger: Logger;

    beforeEach(() => {
        mockLogger = {
            disable: vi.fn(),
            enable: vi.fn(),
            trace: vi.fn(),
            debug: vi.fn(),
            info: vi.fn(),
            warn: vi.fn(),
            error: vi.fn(),
            log: vi.fn()
        };
    });

    describe("getUniqueSchemaId", () => {
        it("should return original ID for first occurrence", () => {
            const tracker = createSchemaCollisionTracker();
            const uniqueId = tracker.getUniqueSchemaId("MessageSchema", mockLogger, true);

            expect(uniqueId).toBe("MessageSchema");
            expect(mockLogger.warn).not.toHaveBeenCalled();
        });

        it("should return numbered ID for collision and log warning", () => {
            const tracker = createSchemaCollisionTracker();

            // First occurrence
            const firstId = tracker.getUniqueSchemaId("MessageSchema", mockLogger, true);
            expect(firstId).toBe("MessageSchema");

            // Second occurrence (collision)
            const secondId = tracker.getUniqueSchemaId("MessageSchema", mockLogger, true);
            expect(secondId).toBe("MessageSchema2");
            expect(mockLogger.warn).toHaveBeenCalledWith(
                "Schema name collision detected: 'MessageSchema' already exists. Renaming to 'MessageSchema2' to avoid conflicts."
            );

            // Third occurrence
            const thirdId = tracker.getUniqueSchemaId("MessageSchema", mockLogger, true);
            expect(thirdId).toBe("MessageSchema3");
        });

        it("should handle multiple different schemas independently", () => {
            const tracker = createSchemaCollisionTracker();

            const id1 = tracker.getUniqueSchemaId("UserSchema", mockLogger, true);
            const id2 = tracker.getUniqueSchemaId("MessageSchema", mockLogger, true);
            const id3 = tracker.getUniqueSchemaId("UserSchema", mockLogger, true);

            expect(id1).toBe("UserSchema");
            expect(id2).toBe("MessageSchema");
            expect(id3).toBe("UserSchema2");
        });

        it("should return original ID without renaming when resolveCollisions is false", () => {
            const tracker = createSchemaCollisionTracker();

            const firstId = tracker.getUniqueSchemaId("Test", mockLogger, false);
            expect(firstId).toBe("Test");

            const secondId = tracker.getUniqueSchemaId("Test", mockLogger, false);
            expect(secondId).toBe("Test");
            expect(mockLogger.warn).not.toHaveBeenCalled();
        });

        it("should default to not resolving collisions", () => {
            const tracker = createSchemaCollisionTracker();

            const firstId = tracker.getUniqueSchemaId("Test", mockLogger);
            expect(firstId).toBe("Test");

            const secondId = tracker.getUniqueSchemaId("Test", mockLogger);
            expect(secondId).toBe("Test");
            expect(mockLogger.warn).not.toHaveBeenCalled();
        });
    });

    describe("getUniqueTitleName", () => {
        it("should return original title for first occurrence", () => {
            const tracker = createSchemaCollisionTracker();
            const uniqueName = tracker.getUniqueTitleName("User", "user_schema", mockLogger, true);

            expect(uniqueName).toBe("User");
            expect(mockLogger.warn).not.toHaveBeenCalled();
        });

        it("should return numbered title for collision and log warning", () => {
            const tracker = createSchemaCollisionTracker();

            // First occurrence
            const firstName = tracker.getUniqueTitleName("User", "user_schema_1", mockLogger, true);
            expect(firstName).toBe("User");

            // Second occurrence (collision)
            const secondName = tracker.getUniqueTitleName("User", "user_schema_2", mockLogger, true);
            expect(secondName).toBe("User2");
            expect(mockLogger.warn).toHaveBeenCalledWith(
                "Schema title collision detected: Multiple schemas use title 'User'. Schema 'user_schema_2' retitled to 'User2' to avoid conflicts."
            );
        });

        it("should work without logger", () => {
            const tracker = createSchemaCollisionTracker();

            const firstName = tracker.getUniqueSchemaId("Test", undefined, true);
            const secondName = tracker.getUniqueSchemaId("Test", undefined, true);

            expect(firstName).toBe("Test");
            expect(secondName).toBe("Test2");
        });

        it("should return original title without renaming when resolveCollisions is false", () => {
            const tracker = createSchemaCollisionTracker();

            const firstName = tracker.getUniqueTitleName("User", "user_schema_1", mockLogger, false);
            expect(firstName).toBe("User");

            const secondName = tracker.getUniqueTitleName("User", "user_schema_2", mockLogger, false);
            expect(secondName).toBe("User");
            expect(mockLogger.warn).not.toHaveBeenCalled();
        });

        it("should default to not resolving collisions", () => {
            const tracker = createSchemaCollisionTracker();

            const firstName = tracker.getUniqueTitleName("User", "user_schema_1", mockLogger);
            expect(firstName).toBe("User");

            const secondName = tracker.getUniqueTitleName("User", "user_schema_2", mockLogger);
            expect(secondName).toBe("User");
            expect(mockLogger.warn).not.toHaveBeenCalled();
        });
    });

    describe("separate tracking", () => {
        it("should track schema IDs and title names separately", () => {
            const tracker = createSchemaCollisionTracker();

            // These should not interfere with each other
            const schemaId = tracker.getUniqueSchemaId("User", mockLogger, true);
            const titleName = tracker.getUniqueTitleName("User", "different_schema", mockLogger, true);
            const schemaId2 = tracker.getUniqueSchemaId("User", mockLogger, true);
            const titleName2 = tracker.getUniqueTitleName("User", "another_schema", mockLogger, true);

            expect(schemaId).toBe("User");
            expect(titleName).toBe("User");
            expect(schemaId2).toBe("User2");
            expect(titleName2).toBe("User2");

            expect(mockLogger.warn).toHaveBeenCalledTimes(2);
        });
    });

    describe("reset", () => {
        it("should reset collision tracking state", () => {
            const tracker = createSchemaCollisionTracker();

            // First, create some collisions
            const id1 = tracker.getUniqueSchemaId("Test", mockLogger, true);
            const id2 = tracker.getUniqueSchemaId("Test", mockLogger, true);
            const title1 = tracker.getUniqueTitleName("Example", "schema1", mockLogger, true);
            const title2 = tracker.getUniqueTitleName("Example", "schema2", mockLogger, true);

            expect(id1).toBe("Test");
            expect(id2).toBe("Test2");
            expect(title1).toBe("Example");
            expect(title2).toBe("Example2");
            expect(mockLogger.warn).toHaveBeenCalledTimes(2);

            // Reset the tracker
            tracker.reset();

            // After reset, should start from scratch (no collisions)
            const resetId = tracker.getUniqueSchemaId("Test", mockLogger, true);
            const resetTitle = tracker.getUniqueTitleName("Example", "schema3", mockLogger, true);

            expect(resetId).toBe("Test");
            expect(resetTitle).toBe("Example");
            // Should still be 2 warnings total (no new warnings after reset)
            expect(mockLogger.warn).toHaveBeenCalledTimes(2);
        });
    });
});
