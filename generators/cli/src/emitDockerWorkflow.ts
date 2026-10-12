import { dockerRegistryHost, type FernCliDockerConfig } from "./customConfig.js";

/**
 * Docker platform → the cargo-dist target whose archive backs it.
 *
 * musl, not glibc: the binaries are static (rustls, see
 * `applyRustlsPatch`), so the image can sit on a minimal base with no
 * libc or OpenSSL to match.
 */
const PLATFORM_TARGETS: ReadonlyArray<{ platform: string; arch: string; target: string }> = [
    { platform: "linux/amd64", arch: "amd64", target: "x86_64-unknown-linux-musl" },
    { platform: "linux/arm64", arch: "arm64", target: "aarch64-unknown-linux-musl" }
];

/**
 * Alpine rather than `scratch` / distroless: CI systems that run steps
 * inside an image (GitLab `image:`, Jenkins, Tekton) need a shell, and
 * Alpine ships the CA bundle `rustls-tls-native-roots` reads.
 */
const BASE_IMAGE = "alpine:3.23";

/** Same bounded retry as the Scoop job; `needs: host` means the assets exist. */
const LOOKUP_ATTEMPTS = 6;
const LOOKUP_INTERVAL_SECONDS = 10;

export interface DockerJobArgs {
    binaryName: string;
    docker: FernCliDockerConfig;
    /** SPDX license, when the consumer pinned one via `packageIdentity`. */
    license: string | undefined;
    description: string;
}

/**
 * Build the `publish-docker` job appended to the generated `release.yml`.
 *
 * Every release pushes `<image>:<version>`. `latest` only moves for
 * non-prereleases — unlike a tap or bucket, a registry has version tags,
 * so an RC can ship without becoming what an unpinned `docker pull`
 * resolves to.
 *
 * The image is assembled from the release's musl archives rather than
 * compiled in the job, so it contains byte-for-byte the binaries every
 * other channel ships, and buildx needs no QEMU: the Dockerfile only
 * `COPY`s.
 */
export function constructDockerJobYaml(args: DockerJobArgs): string {
    const { binaryName, docker, license, description } = args;
    const registry = dockerRegistryHost(docker.image);
    const usesBuiltInToken = docker.usernameEnvironmentVariable == null || docker.tokenEnvironmentVariable == null;
    // The built-in token can only push to ghcr.io, and only with
    // `packages: write` granted to this job.
    const permissions = usesBuiltInToken
        ? `    permissions:
      contents: read
      packages: write
`
        : "";
    const username = usesBuiltInToken ? "${{ github.actor }}" : `\${{ secrets.${docker.usernameEnvironmentVariable} }}`;
    const password = usesBuiltInToken
        ? "${{ secrets.GITHUB_TOKEN }}"
        : `\${{ secrets.${docker.tokenEnvironmentVariable} }}`;
    const platforms = PLATFORM_TARGETS.map(({ platform }) => platform).join(",");
    const archTargets = PLATFORM_TARGETS.map(({ arch, target }) => `${arch}:${target}`).join(" ");
    const labels = [
        "org.opencontainers.image.source=${{ github.server_url }}/${{ github.repository }}",
        "org.opencontainers.image.version=${{ steps.tags.outputs.version }}",
        `org.opencontainers.image.title=${binaryName}`,
        `org.opencontainers.image.description=${singleLine(description)}`,
        ...(license != null ? [`org.opencontainers.image.licenses=${singleLine(license)}`] : [])
    ]
        .map((label) => `            ${label}`)
        .join("\n");

    return `
  publish-docker:
    needs:
      - plan
      - host
    runs-on: "ubuntu-22.04"
${permissions}    env:
      IMAGE: "${docker.image}"
      IS_PRERELEASE: \${{ fromJson(needs.plan.outputs.val).announcement_is_prerelease }}
    steps:
      - name: Assemble the image context from the musl release archives
        env:
          GH_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        shell: bash
        run: |
          set -euo pipefail

          TAG="\${GITHUB_REF_NAME}"
          CONTEXT="\${RUNNER_TEMP}/docker-context"
          mkdir -p "\${CONTEXT}"

          for pair in ${archTargets}; do
            ARCH="\${pair%%:*}"
            SUFFIX="-\${pair#*:}.tar.gz"

            # Resolved by target-triple suffix: cargo-dist names archives
            # after the cargo *package*, which the generator does not always
            # control.
            ASSET_NAME=""
            for attempt in \$(seq 1 ${LOOKUP_ATTEMPTS}); do
              ASSET_NAME=\$(gh release view "\${TAG}" --repo "\${GITHUB_REPOSITORY}" --json assets \\
                --jq ".assets[].name | select(endswith(\\"\${SUFFIX}\\"))" 2>/dev/null | head -n1 || true)
              if [ -n "\${ASSET_NAME}" ]; then
                break
              fi
              if [ "\${attempt}" -lt ${LOOKUP_ATTEMPTS} ]; then
                echo "Release assets not listable yet (attempt \${attempt}/${LOOKUP_ATTEMPTS}); retrying..."
                sleep ${LOOKUP_INTERVAL_SECONDS}
              fi
            done
            if [ -z "\${ASSET_NAME}" ]; then
              echo "::error::No asset ending in \${SUFFIX} on release \${TAG}. Check the build-local-artifacts leg for that target."
              exit 1
            fi

            DOWNLOAD="\${RUNNER_TEMP}/docker-download/\${ARCH}"
            mkdir -p "\${DOWNLOAD}" "\${CONTEXT}/\${ARCH}"
            gh release download "\${TAG}" --repo "\${GITHUB_REPOSITORY}" --pattern "\${ASSET_NAME}" --dir "\${DOWNLOAD}"
            tar -xzf "\${DOWNLOAD}/\${ASSET_NAME}" -C "\${DOWNLOAD}"
            BINARY=\$(find "\${DOWNLOAD}" -type f -perm -u+x -name "${binaryName}" | head -n1)
            if [ -z "\${BINARY}" ]; then
              echo "::error::\${ASSET_NAME} does not contain a ${binaryName} executable."
              exit 1
            fi
            install -m 0755 "\${BINARY}" "\${CONTEXT}/\${ARCH}/${binaryName}"
          done

          cat > "\${CONTEXT}/Dockerfile" <<'DOCKERFILE'
          FROM ${BASE_IMAGE}
          ARG TARGETARCH
          COPY \${TARGETARCH}/${binaryName} /usr/local/bin/${binaryName}
          ENTRYPOINT ["/usr/local/bin/${binaryName}"]
          DOCKERFILE

      - name: Compute image tags
        id: tags
        shell: bash
        run: |
          set -euo pipefail

          # Tags may be prefixed (\`my-app/1.2.3\`, \`releases/v1.2.3\`), and an
          # image tag cannot contain \`/\` or \`+\`.
          VERSION="\${GITHUB_REF_NAME##*/}"
          VERSION="\${VERSION#v}"
          VERSION="\${VERSION//+/-}"
          TAGS="\${IMAGE}:\${VERSION}"
          if [ "\${IS_PRERELEASE}" != "true" ]; then
            TAGS="\${TAGS},\${IMAGE}:latest"
          fi
          {
            echo "version=\${VERSION}"
            echo "tags=\${TAGS}"
          } >> "\$GITHUB_OUTPUT"

      - uses: docker/setup-buildx-action@v4

      - uses: docker/login-action@v4
        with:
          registry: ${registry}
          username: ${username}
          password: ${password}

      - uses: docker/build-push-action@v7
        with:
          context: \${{ runner.temp }}/docker-context
          platforms: ${platforms}
          push: true
          tags: \${{ steps.tags.outputs.tags }}
          labels: |
${labels}
`;
}

/**
 * OCI labels are passed as one `key=value` per line, so a newline in a
 * user-authored description would split it into a bogus second label.
 */
function singleLine(value: string): string {
    return value.replace(/\s*\n\s*/g, " ");
}
