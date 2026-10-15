import { TaskAbortSignal } from "@fern-api/task-context";
import { describe, expect, it } from "vitest";
import { toSdkPreviewError } from "../sdkPreview.js";

describe("toSdkPreviewError", () => {
    it("rethrows TaskAbortSignal after a nested task has logged the real error", () => {
        expect(() => toSdkPreviewError(new TaskAbortSignal())).toThrow(TaskAbortSignal);
    });

    it("returns the message from ordinary errors", () => {
        expect(toSdkPreviewError(new Error("preview failed"))).toEqual({
            status: "error",
            message: "preview failed"
        });
    });

    it("extracts messages from error-shaped objects", () => {
        expect(toSdkPreviewError({ message: "preview failed" })).toEqual({
            status: "error",
            message: "preview failed"
        });
    });
});
