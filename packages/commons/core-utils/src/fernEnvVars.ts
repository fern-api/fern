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

/**
 * Host path to a PEM CA bundle that `fern generate --local` mounts read-only into the
 * generator container and exposes via NODE_EXTRA_CA_CERTS, SSL_CERT_FILE and
 * GIT_SSL_CAINFO, so git, Node and OpenSSL-based tooling inside the container trust a
 * corporate TLS-interception CA. Because SSL_CERT_FILE / GIT_SSL_CAINFO replace (rather
 * than extend) the default trust store, the file must be a complete bundle that includes
 * the public roots as well as the corporate CA.
 */
export const FERN_CA_BUNDLE_ENV_VAR = "FERN_CA_BUNDLE";
