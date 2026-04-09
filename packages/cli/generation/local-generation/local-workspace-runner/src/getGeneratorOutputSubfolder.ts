/**
 * Derives a filesystem-safe subfolder name from a generator name.
 * e.g. "fernapi/fern-typescript-sdk" → "fern-typescript-sdk"
 */
export function getGeneratorOutputSubfolder(generatorName: string): string {
    const baseName = generatorName.split("/").pop() || "sdk";
    return baseName.replace(/[^a-zA-Z0-9-_]/g, "_");
}
