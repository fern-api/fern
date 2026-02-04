import type { Logger } from "@fern-api/logger";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createSchemaCollisionTracker } from "../schemaCollision";

describe("Schema Collision", () => {
    let mockLogger: Partial<Logger>;

    beforeEach(() => {
        mockLogger = {
            warn: vi.fn(),
            debug: vi.fn(),
            error: vi.fn(),
            info: vi.fn()
        };
    });

    describe("getUniqueSchemaId", () => {
        it("should return original ID for first occurrence", () => {
            const tracker = createSchemaCollisionTracker();
            const uniqueId = tracker.getUniqueSchemaId("MessageSchema", mockLogger);

            expect(uniqueId).toBe("MessageSchema");
            expect(mockLogger.warn).not.toHaveBeenCalled();
        });

        it("should return numbered ID for collision and log warning", () => {
            const tracker = createSchemaCollisionTracker();

            // First occurrence
            const firstId = tracker.getUniqueSchemaId("MessageSchema", mockLogger);
            expect(firstId).toBe("MessageSchema");

            // Second occurrence (collision)
            const secondId = tracker.getUniqueSchemaId("MessageSchema", mockLogger);
            expect(secondId).toBe("MessageSchema2");
            expect(mockLogger.warn).toHaveBeenCalledWith(
                "Schema name collision detected: 'MessageSchema' already exists. Renaming to 'MessageSchema2' to avoid conflicts."
            );

            // Third occurrence
            const thirdId = tracker.getUniqueSchemaId("MessageSchema", mockLogger);
            expect(thirdId).toBe("MessageSchema3");
        });

        it("should handle multiple different schemas independently", () => {
            const tracker = createSchemaCollisionTracker();

            const id1 = tracker.getUniqueSchemaId("UserSchema", mockLogger);
            const id2 = tracker.getUniqueSchemaId("MessageSchema", mockLogger);
            const id3 = tracker.getUniqueSchemaId("UserSchema", mockLogger);

            expect(id1).toBe("UserSchema");
            expect(id2).toBe("MessageSchema");
            expect(id3).toBe("UserSchema2");
        });
    });

    describe("getUniqueTitleName", () => {
        it("should return original title for first occurrence", () => {
            const tracker = createSchemaCollisionTracker();
            const uniqueName = tracker.getUniqueTitleName("User", "user_schema", mockLogger);

            expect(uniqueName).toBe("User");
            expect(mockLogger.warn).not.toHaveBeenCalled();
        });

        it("should return numbered title for collision and log warning", () => {
            const tracker = createSchemaCollisionTracker();

            // First occurrence
            const firstName = tracker.getUniqueTitleName("User", "user_schema_1", mockLogger);
            expect(firstName).toBe("User");

            // Second occurrence (collision)
            const secondName = tracker.getUniqueTitleName("User", "user_schema_2", mockLogger);
            expect(secondName).toBe("User2");
            expect(mockLogger.warn).toHaveBeenCalledWith(
                "Schema title collision detected: Multiple schemas use title 'User'. Schema 'user_schema_2' retitled to 'User2' to avoid conflicts."
            );
        });

        it("should work without logger", () => {
            const tracker = createSchemaCollisionTracker();

            const firstName = tracker.getUniqueSchemaId("Test");
            const secondName = tracker.getUniqueSchemaId("Test");

            expect(firstName).toBe("Test");
            expect(secondName).toBe("Test2");
        });
    });

    describe("separate tracking", () => {
        it("should track schema IDs and title names separately", () => {
            const tracker = createSchemaCollisionTracker();

            // These should not interfere with each other
            const schemaId = tracker.getUniqueSchemaId("User", mockLogger);
            const titleName = tracker.getUniqueTitleName("User", "different_schema", mockLogger);
            const schemaId2 = tracker.getUniqueSchemaId("User", mockLogger);
            const titleName2 = tracker.getUniqueTitleName("User", "another_schema", mockLogger);

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
            const id1 = tracker.getUniqueSchemaId("Test", mockLogger);
            const id2 = tracker.getUniqueSchemaId("Test", mockLogger);
            const title1 = tracker.getUniqueTitleName("Example", "schema1", mockLogger);
            const title2 = tracker.getUniqueTitleName("Example", "schema2", mockLogger);

            expect(id1).toBe("Test");
            expect(id2).toBe("Test2");
            expect(title1).toBe("Example");
            expect(title2).toBe("Example2");
            expect(mockLogger.warn).toHaveBeenCalledTimes(2);

            // Reset the tracker
            tracker.reset();

            // After reset, should start from scratch (no collisions)
            const resetId = tracker.getUniqueSchemaId("Test", mockLogger);
            const resetTitle = tracker.getUniqueTitleName("Example", "schema3", mockLogger);

            expect(resetId).toBe("Test");
            expect(resetTitle).toBe("Example");
            // Should still be 2 warnings total (no new warnings after reset)
            expect(mockLogger.warn).toHaveBeenCalledTimes(2);
        });
    });
});
