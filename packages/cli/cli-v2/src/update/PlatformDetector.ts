/**
 * Platform-specific binary naming used by the Bun cross-compile pipeline
 * in `build.compile.mjs`.
 *
 * Targets must stay in sync with that file:
 * - bun-darwin-arm64  -> fern-darwin-arm64
 * - bun-darwin-x64    -> fern-darwin-x64
 * - bun-linux-x64     -> fern-linux-x64
 * - bun-linux-arm64   -> fern-linux-arm64
 * - bun-windows-x64   -> fern-windows-x64.exe
 */
export declare namespace PlatformDetector {
    interface Target {
        /** Asset filename uploaded to GitHub Releases (e.g. `fern-darwin-arm64`). */
        assetName: string;
        /** Local binary filename to write inside the version directory. */
        binaryName: string;
    }
}

export class PlatformDetector {
    private readonly platform: NodeJS.Platform;
    private readonly arch: string;

    constructor({ platform, arch }: { platform?: NodeJS.Platform; arch?: string } = {}) {
        this.platform = platform ?? process.platform;
        this.arch = arch ?? process.arch;
    }

    /**
     * Resolve the asset name + binary filename for the current platform.
     * Throws a friendly error when the platform isn't supported.
     */
    public resolveTarget(): PlatformDetector.Target {
        switch (this.platform) {
            case "darwin": {
                const archSuffix = this.normalizeArch();
                return {
                    assetName: `fern-darwin-${archSuffix}`,
                    binaryName: "fern"
                };
            }
            case "linux": {
                const archSuffix = this.normalizeArch();
                return {
                    assetName: `fern-linux-${archSuffix}`,
                    binaryName: "fern"
                };
            }
            case "win32": {
                if (this.arch !== "x64") {
                    throw new Error(
                        `Unsupported Windows architecture: ${this.arch}. Only x64 is supported for Windows.`
                    );
                }
                return {
                    assetName: "fern-windows-x64.exe",
                    binaryName: "fern.exe"
                };
            }
            default:
                throw new Error(
                    `Unsupported platform: ${this.platform}. Supported platforms are darwin, linux, and win32.`
                );
        }
    }

    private normalizeArch(): "arm64" | "x64" {
        if (this.arch === "arm64") {
            return "arm64";
        }
        if (this.arch === "x64") {
            return "x64";
        }
        throw new Error(
            `Unsupported architecture: ${this.arch}. Supported architectures are x64 and arm64 on ${this.platform}.`
        );
    }
}
