export function getGeneratorVersion(): string {
    const version = process.env.GENERATOR_VERSION;
    if (version == null) {
        throw new Error("GENERATOR_VERSION is not defined");
    }
    return version;
}
