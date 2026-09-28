import {
    DEFAULT_APT_BRANCH,
    DEFAULT_APT_SIGNING_KEY_ENV_VAR,
    type FernCliAptConfig,
    type ResolvedChannelAuth
} from "./customConfig.js";
import { appTokenExpression, CREDENTIAL_PREFLIGHT_JOB, constructAppTokenStep } from "./githubAppToken.js";

/**
 * Debian architecture → the cargo-dist target whose archive backs it.
 *
 * musl, not glibc: the static binaries install on every Debian/Ubuntu
 * release regardless of its libc version, so the package declares no
 * `Depends:` at all.
 */
const ARCH_TARGETS: ReadonlyArray<{ arch: string; target: string }> = [
    { arch: "amd64", target: "x86_64-unknown-linux-musl" },
    { arch: "arm64", target: "aarch64-unknown-linux-musl" }
];

/** Suite and component of the single distribution the repository serves. */
const SUITE = "stable";
const COMPONENT = "main";

/** Same bounded retry as the Scoop job; see `emitScoopWorkflow.ts`. */
const LOOKUP_ATTEMPTS = 6;
const LOOKUP_INTERVAL_SECONDS = 10;

export interface AptJobArgs {
    binaryName: string;
    apt: FernCliAptConfig;
    /** Repository URL, used for the package's `Homepage:` field. */
    repoUrl: string | undefined;
    /** Human-readable summary for the package's `Description:` field. */
    description: string;
}

/**
 * `AptJobArgs` plus what only the release-workflow composer knows; see
 * `ScoopJobYamlArgs` for why auth is resolved there rather than here.
 */
export interface AptJobYamlArgs extends AptJobArgs {
    auth: ResolvedChannelAuth;
    preflightJob: boolean;
}

/**
 * Debian package names are `[a-z0-9][a-z0-9+.-]+`. Binary names are
 * already kebab-case, so lowercasing is the only normalization needed.
 */
export function debianPackageName(binaryName: string): string {
    return binaryName.toLowerCase();
}

/**
 * Build the `publish-apt` job appended to the generated `release.yml`.
 *
 * The job packages the two released musl binaries as `.deb`s with
 * `dpkg-deb`, adds them to a `pool/` tree on a branch of the APT
 * repository, regenerates `Packages` and `Release` with `apt-ftparchive`,
 * and signs `Release` into `InRelease` and `Release.gpg`. The branch is a
 * complete static APT repository, so GitHub Pages (or any mirror of the
 * branch) serves it as-is.
 *
 * Every published version stays in `pool/`, so `apt install <pkg>=<ver>`
 * can pin and downgrade. A version already in the pool is never
 * repackaged, which keeps re-runs a no-op and the published checksums
 * stable.
 */
export function constructAptJobYaml(args: AptJobYamlArgs): string {
    const { binaryName, apt, repoUrl, description, auth, preflightJob } = args;
    const packageName = debianPackageName(binaryName);
    const branch = apt.branch ?? DEFAULT_APT_BRANCH;
    const signingKeySecret = apt.signingKeyEnvironmentVariable ?? DEFAULT_APT_SIGNING_KEY_ENV_VAR;
    const passphraseEnv =
        apt.signingKeyPassphraseEnvironmentVariable != null
            ? `\n          SIGNING_KEY_PASSPHRASE: \${{ secrets.${apt.signingKeyPassphraseEnvironmentVariable} }}`
            : "";
    const archTargets = ARCH_TARGETS.map(({ arch, target }) => `${arch}:${target}`).join(" ");
    const poolDir = `pool/${COMPONENT}/${packageName.charAt(0)}/${packageName}`;
    const summary = description.replace(/\s+/g, " ").trim();
    const homepageLine = repoUrl != null ? `\n            echo ${shellQuote(`Homepage: ${repoUrl}`)}` : "";

    const tokenStep =
        auth.type === "githubApp"
            ? `${constructAppTokenStep({ name: "Mint an APT repository token", app: auth.app, repo: apt.repository })}\n`
            : "";
    const checkoutToken = auth.type === "githubApp" ? appTokenExpression() : `\${{ secrets.${auth.tokenSecret} }}`;
    const preflightNeed = preflightJob && auth.type === "githubApp" ? `      - ${CREDENTIAL_PREFLIGHT_JOB}\n` : "";

    return `
  publish-apt:
    needs:
      - plan
      - host
${preflightNeed}    runs-on: "ubuntu-22.04"
    # The same prerelease gate as the Homebrew and Scoop jobs: the repository
    # has a single \`${SUITE}\` suite, so an RC published here would be what
    # \`apt upgrade\` installs.
    if: \${{ !fromJson(needs.plan.outputs.val).announcement_is_prerelease || fromJson(needs.plan.outputs.val).publish_prereleases }}
    env:
      PACKAGE: "${packageName}"
      BRANCH: "${branch}"
    steps:
      - name: Import the signing key
        id: key
        env:
          SIGNING_KEY: \${{ secrets.${signingKeySecret} }}${passphraseEnv}
        shell: bash
        run: |
          set -euo pipefail

          if [ -z "\${SIGNING_KEY}" ]; then
            echo "::error::The ${signingKeySecret} secret is empty or unset. Store the ASCII-armored GPG private key that signs the APT repository under that name."
            exit 1
          fi
          printf '%s\\n' "\${SIGNING_KEY}" | gpg --batch --import
          FINGERPRINT=\$(gpg --batch --list-secret-keys --with-colons | awk -F: '/^fpr:/ { print \$10; exit }')
          MAINTAINER=\$(gpg --batch --list-secret-keys --with-colons | awk -F: '/^uid:/ { print \$10; exit }')
          if [ -z "\${FINGERPRINT}" ]; then
            echo "::error::${signingKeySecret} did not contain a GPG secret key."
            exit 1
          fi

          GPG_ARGS=(--batch --yes --local-user "\${FINGERPRINT}")
          if [ -n "\${SIGNING_KEY_PASSPHRASE:-}" ]; then
            PASSPHRASE_FILE="\${RUNNER_TEMP}/apt-signing-passphrase"
            (umask 077 && printf '%s' "\${SIGNING_KEY_PASSPHRASE}" > "\${PASSPHRASE_FILE}")
            GPG_ARGS+=(--pinentry-mode loopback --passphrase-file "\${PASSPHRASE_FILE}")
          fi
          # Fail here, not after packaging, if the key cannot sign.
          echo probe | gpg "\${GPG_ARGS[@]}" --clearsign > /dev/null

          {
            echo "fingerprint=\${FINGERPRINT}"
            echo "maintainer=\${MAINTAINER:-${packageName}}"
          } >> "\$GITHUB_OUTPUT"

      - name: Build the .deb packages from the musl release archives
        id: debs
        env:
          GH_TOKEN: \${{ secrets.GITHUB_TOKEN }}
          MAINTAINER: \${{ steps.key.outputs.maintainer }}
        shell: bash
        run: |
          set -euo pipefail

          TAG="\${GITHUB_REF_NAME}"
          # Tags may be prefixed (\`my-app/1.2.3\`, \`releases/v1.2.3\`). A
          # semver prerelease \`-rc.1\` becomes \`~rc.1\` so it sorts before
          # the final release, as Debian versioning requires.
          VERSION="\${TAG##*/}"
          VERSION="\${VERSION#v}"
          VERSION="\${VERSION//-/\\~}"
          if ! [[ "\${VERSION}" =~ ^[0-9][A-Za-z0-9.+~]*$ ]]; then
            echo "::error::Cannot derive a Debian version from tag \${TAG}."
            exit 1
          fi
          OUT="\${RUNNER_TEMP}/debs"
          mkdir -p "\${OUT}"

          for pair in ${archTargets}; do
            ARCH="\${pair%%:*}"
            SUFFIX="-\${pair#*:}.tar.gz"

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

            DOWNLOAD="\${RUNNER_TEMP}/apt-download/\${ARCH}"
            mkdir -p "\${DOWNLOAD}"
            gh release download "\${TAG}" --repo "\${GITHUB_REPOSITORY}" --pattern "\${ASSET_NAME}" --dir "\${DOWNLOAD}"
            tar -xzf "\${DOWNLOAD}/\${ASSET_NAME}" -C "\${DOWNLOAD}"
            BINARY=\$(find "\${DOWNLOAD}" -type f -perm -u+x -name "${binaryName}" | head -n1)
            if [ -z "\${BINARY}" ]; then
              echo "::error::\${ASSET_NAME} does not contain a ${binaryName} executable."
              exit 1
            fi

            ROOT="\${RUNNER_TEMP}/apt-root/\${ARCH}"
            mkdir -p "\${ROOT}/DEBIAN" "\${ROOT}/usr/bin"
            install -m 0755 "\${BINARY}" "\${ROOT}/usr/bin/${binaryName}"
            {
              echo "Package: \${PACKAGE}"
              echo "Version: \${VERSION}"
              echo "Architecture: \${ARCH}"
              echo "Maintainer: \${MAINTAINER}"
              echo "Installed-Size: \$(du -sk "\${ROOT}/usr" | cut -f1)"
              echo "Section: utils"
              echo "Priority: optional"${homepageLine}
              echo ${shellQuote(`Description: ${summary}`)}
            } > "\${ROOT}/DEBIAN/control"

            # xz, not dpkg's zstd default on Ubuntu: apt on Debian 11 and
            # older cannot unpack zstd members.
            dpkg-deb -Zxz --root-owner-group --build "\${ROOT}" "\${OUT}/\${PACKAGE}_\${VERSION}_\${ARCH}.deb"
          done

          echo "version=\${VERSION}" >> "\$GITHUB_OUTPUT"

${tokenStep}      - name: Check out the APT repository
        uses: actions/checkout@v6
        with:
          repository: "${apt.repository}"
          token: ${checkoutToken}
          path: apt-repo
          # Credentials must persist — the last step pushes the branch back.
          persist-credentials: true

      - name: Add the packages and sign the repository metadata
        env:
          VERSION: \${{ steps.debs.outputs.version }}
          FINGERPRINT: \${{ steps.key.outputs.fingerprint }}${passphraseEnv}
        shell: bash
        run: |
          set -euo pipefail

          if ! command -v apt-ftparchive > /dev/null 2>&1; then
            sudo apt-get update && sudo apt-get install -y apt-utils
          fi

          cd apt-repo
          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          # The branch is created on first publish, holding only the
          # repository tree.
          if git fetch --depth 1 origin "\${BRANCH}" 2>/dev/null; then
            git checkout -B "\${BRANCH}" FETCH_HEAD
          else
            git checkout --orphan "\${BRANCH}"
            git rm -rf --quiet . || true
          fi

          POOL="${poolDir}"
          mkdir -p "\${POOL}"
          ADDED=0
          for deb in "\${RUNNER_TEMP}"/debs/*.deb; do
            if [ -e "\${POOL}/\$(basename "\${deb}")" ]; then
              echo "\$(basename "\${deb}") is already in the pool; keeping the published file."
            else
              cp "\${deb}" "\${POOL}/"
              ADDED=1
            fi
          done
          if [ "\${ADDED}" = 0 ]; then
            echo "\${PACKAGE} \${VERSION} is already published; nothing to commit."
            exit 0
          fi

          DIST="dists/${SUITE}"
          for pair in ${archTargets}; do
            ARCH="\${pair%%:*}"
            mkdir -p "\${DIST}/${COMPONENT}/binary-\${ARCH}"
            apt-ftparchive --arch "\${ARCH}" packages "pool/${COMPONENT}" > "\${DIST}/${COMPONENT}/binary-\${ARCH}/Packages"
            gzip -9nkf "\${DIST}/${COMPONENT}/binary-\${ARCH}/Packages"
          done

          # Removed first so the new Release does not hash its own
          # predecessors.
          rm -f "\${DIST}/Release" "\${DIST}/InRelease" "\${DIST}/Release.gpg"
          apt-ftparchive \\
            -o APT::FTPArchive::Release::Origin="\${PACKAGE}" \\
            -o APT::FTPArchive::Release::Label="\${PACKAGE}" \\
            -o APT::FTPArchive::Release::Suite="${SUITE}" \\
            -o APT::FTPArchive::Release::Codename="${SUITE}" \\
            -o APT::FTPArchive::Release::Architectures="${ARCH_TARGETS.map(({ arch }) => arch).join(" ")}" \\
            -o APT::FTPArchive::Release::Components="${COMPONENT}" \\
            release "\${DIST}" > "\${RUNNER_TEMP}/Release"
          mv "\${RUNNER_TEMP}/Release" "\${DIST}/Release"

          GPG_ARGS=(--batch --yes --local-user "\${FINGERPRINT}")
          if [ -n "\${SIGNING_KEY_PASSPHRASE:-}" ]; then
            GPG_ARGS+=(--pinentry-mode loopback --passphrase-file "\${RUNNER_TEMP}/apt-signing-passphrase")
          fi
          gpg "\${GPG_ARGS[@]}" --clearsign --output "\${DIST}/InRelease" "\${DIST}/Release"
          gpg "\${GPG_ARGS[@]}" --armor --detach-sign --output "\${DIST}/Release.gpg" "\${DIST}/Release"
          gpg --batch --armor --export "\${FINGERPRINT}" > gpg.key
          # GitHub Pages must serve the tree verbatim.
          touch .nojekyll

          git add -A .
          git commit -m "\${PACKAGE} \${VERSION}"
          git push origin "HEAD:\${BRANCH}"
`;
}

/** Single-quote a value for safe interpolation into the generated bash. */
function shellQuote(value: string): string {
    return `'${value.replace(/'/g, `'\\''`)}'`;
}
