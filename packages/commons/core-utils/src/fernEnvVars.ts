/**
 * Environment variables that the Fern CLI forwards from the host into generator
 * containers, and that generators read at runtime. Declared here so the CLI, the
 * container runner, and the generators all agree on the spelling.
 */

/**
 * When truthy, Java generation skips the post-generation `./gradlew :spotlessApply`
 * pass. Generated code is still emitted (and the Spotless plugin is still wired into
 * the generated `build.gradle`), it is simply left unformatted. Useful on networks
 * that cannot reach the Gradle distribution or plugin repositories, and to cut
 * generation time.
 */
export const FERN_JAVA_SKIP_FORMATTING_ENV_VAR = "FERN_JAVA_SKIP_FORMATTING";
