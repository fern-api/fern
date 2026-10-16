import { TaskAbortSignal } from "@fern-api/task-context";
import { describe, expect, it } from "vitest";
import { toSdkPreviewError, toSerializableSdkPreviewResult } from "../sdkPreview.js";

describe("toSdkPreviewError", () => {
    it("returns the previously logged message from TaskAbortSignal for structured callers", () => {
        const result = toSdkPreviewError(new TaskAbortSignal("sdk-gen-api validation failed"));

        expect(result).toEqual({
            status: "error",
            message: "sdk-gen-api validation failed",
            messageAlreadyLogged: true
        });
        expect(toSerializableSdkPreviewResult(result)).toEqual({
            status: "error",
            message: "sdk-gen-api validation failed"
        });
    });

    it("returns a generic structured error when TaskAbortSignal has no failure message", () => {
        expect(toSdkPreviewError(new TaskAbortSignal())).toEqual({
            status: "error",
            message: "SDK preview failed"
        });
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
