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
 * GIT_SSL_CAINFO, so network calls inside the container (pnpm install, go mod tidy, dotnet
 * restore) trust a corporate TLS-interception CA. The JVM ignores these variables.
 *
 * Because SSL_CERT_FILE / GIT_SSL_CAINFO *replace* rather than extend the default trust
 * store, this must be a complete bundle: the public roots plus the corporate CA. On Linux
 * the system already maintains one at /etc/ssl/certs/ca-certificates.crt. Elsewhere, build
 * one from the roots Node already ships:
 *
 *   node -e 'console.log(require("tls").rootCertificates.join("\n"))' > ~/certs/fern-ca-bundle.crt
 *   cat corp-root.pem >> ~/certs/fern-ca-bundle.crt
 *
 * The value is a bind-mount source resolved by the container runtime, not by the CLI, so it
 * must be a path that runtime can see. On macOS and Windows the runtime is a VM that shares
 * only some host directories (a home-directory path is the safe choice); with a remote
 * DOCKER_HOST or a Docker-in-Docker sidecar it must be a path on the daemon's own host. The
 * CLI probes the mount before generating and fails with platform-specific guidance if the
 * bundle is not visible inside the container.
 */
export const FERN_CA_BUNDLE_ENV_VAR = "FERN_CA_BUNDLE";
