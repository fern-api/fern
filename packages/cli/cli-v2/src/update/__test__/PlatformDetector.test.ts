import { describe, expect, it } from "vitest";
import { PlatformDetector } from "../PlatformDetector.js";

describe("PlatformDetector", () => {
    it("resolves darwin arm64 to fern-darwin-arm64", () => {
        const detector = new PlatformDetector({ platform: "darwin", arch: "arm64" });
        const target = detector.resolveTarget();
        expect(target).toEqual({ assetName: "fern-darwin-arm64", binaryName: "fern" });
    });

    it("resolves darwin x64 to fern-darwin-x64", () => {
        const detector = new PlatformDetector({ platform: "darwin", arch: "x64" });
        const target = detector.resolveTarget();
        expect(target).toEqual({ assetName: "fern-darwin-x64", binaryName: "fern" });
    });

    it("resolves linux x64 to fern-linux-x64", () => {
        const detector = new PlatformDetector({ platform: "linux", arch: "x64" });
        const target = detector.resolveTarget();
        expect(target).toEqual({ assetName: "fern-linux-x64", binaryName: "fern" });
    });

    it("resolves linux arm64 to fern-linux-arm64", () => {
        const detector = new PlatformDetector({ platform: "linux", arch: "arm64" });
        const target = detector.resolveTarget();
        expect(target).toEqual({ assetName: "fern-linux-arm64", binaryName: "fern" });
    });

    it("resolves win32 x64 to fern-windows-x64 with .exe binary", () => {
        const detector = new PlatformDetector({ platform: "win32", arch: "x64" });
        const target = detector.resolveTarget();
        expect(target).toEqual({ assetName: "fern-windows-x64.exe", binaryName: "fern.exe" });
    });

    it("throws on unsupported platform/arch combinations", () => {
        const detector = new PlatformDetector({ platform: "freebsd", arch: "ia32" });
        expect(() => detector.resolveTarget()).toThrow(/unsupported/i);
    });
});
