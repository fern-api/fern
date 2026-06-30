/**
 * Generators that emit `.fern/verify.sh` after generation. The seed runner wires
 * `PostGenerationPipeline` + `VerificationStep` only for these generators so seed
 * CI exercises the same validator-container code path that
 * `fern generate --local --verify` (and Fiddle) use end-to-end.
 *
 * Today only the TypeScript SDK generator emits the script (see PR #15718).
 * FER-9681 tracks extending self-verification to the remaining language SDK
 * generators - add each one to this set as they ship.
 */
const GENERATORS_EMITTING_VERIFY_SCRIPT = new Set<string>([
    "fernapi/fern-typescript-sdk",
    "fernapi/fern-typescript-node-sdk"
]);

/**
 * Returns true when the generator identified by `dockerImageName` is known to
 * emit `.fern/verify.sh` after generation. `dockerImageName` is the repository
 * portion of the docker reference (no tag), e.g. `"fernapi/fern-typescript-sdk"`.
 */
export function generatorEmitsVerifyScript(dockerImageName: string): boolean {
    return GENERATORS_EMITTING_VERIFY_SCRIPT.has(dockerImageName);
}
