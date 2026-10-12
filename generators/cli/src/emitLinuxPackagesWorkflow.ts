import {
    DEFAULT_LINUX_PACKAGES_BRANCH,
    DEFAULT_LINUX_PACKAGES_SIGNING_KEY_ENV_VAR,
    type FernCliLinuxPackagesConfig,
    linuxPackageFormats,
    linuxPackagesUrl,
    type ResolvedChannelAuth
} from "./customConfig.js";
import { appTokenExpression, CREDENTIAL_PREFLIGHT_JOB, constructAppTokenStep } from "./githubAppToken.js";

export const LINUX_PACKAGES_JOB = "publish-linux-packages";

/**
 * Debian and RPM architecture names → the cargo-dist target whose archive
 * backs them.
 *
 * musl, not glibc: the static binaries install on every distribution
 * release regardless of its libc version, so neither package declares
 * any dependencies.
 */
const ARCH_TARGETS: ReadonlyArray<{ deb: string; rpm: string; target: string }> = [
    { deb: "amd64", rpm: "x86_64", target: "x86_64-unknown-linux-musl" },
    { deb: "arm64", rpm: "aarch64", target: "aarch64-unknown-linux-musl" }
];

/** Suite and component of the single APT distribution the repository serves. */
const SUITE = "stable";
const COMPONENT = "main";

/** Same bounded retry as the Scoop job; see `emitScoopWorkflow.ts`. */
const LOOKUP_ATTEMPTS = 6;
const LOOKUP_INTERVAL_SECONDS = 10;

export interface LinuxPackagesJobArgs {
    binaryName: string;
    linuxPackages: FernCliLinuxPackagesConfig;
    /** Repository URL, used for the packages' homepage fields. */
    repoUrl: string | undefined;
    /** SPDX expression for the RPM `License:` field. */
    license: string | undefined;
    /** Human-readable summary for the packages' description fields. */
    description: string;
}

/**
 * `LinuxPackagesJobArgs` plus what only the release-workflow composer
 * knows; see `ScoopJobYamlArgs` for why auth is resolved there rather
 * than here.
 */
export interface LinuxPackagesJobYamlArgs extends LinuxPackagesJobArgs {
    auth: ResolvedChannelAuth;
    preflightJob: boolean;
}

/**
 * Debian names are `[a-z0-9][a-z0-9+.-]+` and RPM names are a superset.
 * Binary names are already kebab-case, so lowercasing is the only
 * normalization needed.
 */
export function linuxPackageName(binaryName: string): string {
    return binaryName.toLowerCase();
}

/**
 * Build the `publish-linux-packages` job appended to the generated
 * `release.yml`.
 *
 * The job packages the two released musl binaries as `.deb`s and/or
 * `.rpm`s and commits them to a branch of a GitHub repository, which
 * becomes a static package repository served by GitHub Pages (or any
 * mirror of the branch):
 *
 *   gpg.key                      public half of the signing key
 *   deb/dists/stable/…           `Packages`, signed `InRelease`/`Release.gpg`
 *   deb/pool/main/<l>/<pkg>/     every published `.deb`
 *   rpm/packages/                every published `.rpm`, each signed
 *   rpm/repodata/                `createrepo_c` metadata, signed `repomd.xml`
 *   rpm/<pkg>.repo               drop-in for `/etc/yum.repos.d`
 *
 * Every published version stays, so users can pin and downgrade. A
 * package file already published is never rebuilt, which keeps re-runs a
 * no-op and the published checksums stable.
 */
export function constructLinuxPackagesJobYaml(args: LinuxPackagesJobYamlArgs): string {
    const { binaryName, linuxPackages, repoUrl, license, description, auth, preflightJob } = args;
    const formats = linuxPackageFormats(linuxPackages);
    const deb = formats.includes("deb");
    const rpm = formats.includes("rpm");
    const packageName = linuxPackageName(binaryName);
    const branch = linuxPackages.branch ?? DEFAULT_LINUX_PACKAGES_BRANCH;
    const signingKeySecret = linuxPackages.signingKeyEnvironmentVariable ?? DEFAULT_LINUX_PACKAGES_SIGNING_KEY_ENV_VAR;
    const passphraseEnv =
        linuxPackages.signingKeyPassphraseEnvironmentVariable != null
            ? `\n          SIGNING_KEY_PASSPHRASE: \${{ secrets.${linuxPackages.signingKeyPassphraseEnvironmentVariable} }}`
            : "";
    const archTargets = ARCH_TARGETS.map(({ deb, rpm, target }) => `${deb}:${rpm}:${target}`).join(" ");
    const summary = description.replace(/\s+/g, " ").trim();

    const tokenStep =
        auth.type === "githubApp"
            ? `${constructAppTokenStep({ name: "Mint a package repository token", app: auth.app, repo: linuxPackages.repository })}\n`
            : "";
    const checkoutToken = auth.type === "githubApp" ? appTokenExpression() : `\${{ secrets.${auth.tokenSecret} }}`;
    const preflightNeed = preflightJob && auth.type === "githubApp" ? `      - ${CREDENTIAL_PREFLIGHT_JOB}\n` : "";
    const urlEnv = rpm ? `\n      REPOSITORY_URL: "${linuxPackagesUrl(linuxPackages)}"` : "";

    return `
  ${LINUX_PACKAGES_JOB}:
    needs:
      - plan
      - host
${preflightNeed}    runs-on: "ubuntu-22.04"
    # The same prerelease gate as the Homebrew and Scoop jobs: the repository
    # has a single release channel, so an RC published here would be what
    # \`apt upgrade\` / \`dnf upgrade\` installs.
    if: \${{ !fromJson(needs.plan.outputs.val).announcement_is_prerelease || fromJson(needs.plan.outputs.val).publish_prereleases }}
    env:
      PACKAGE: "${packageName}"
      BRANCH: "${branch}"${urlEnv}
    steps:
      - name: Import the signing key
        id: key
        env:
          SIGNING_KEY: \${{ secrets.${signingKeySecret} }}${passphraseEnv}
        shell: bash
        run: |
          set -euo pipefail

          if [ -z "\${SIGNING_KEY}" ]; then
            echo "::error::The ${signingKeySecret} secret is empty or unset. Store the ASCII-armored GPG private key that signs the package repository under that name."
            exit 1
          fi
          printf '%s\\n' "\${SIGNING_KEY}" | gpg --batch --import
          # Primary-key fingerprints only; subkey fpr lines follow ssb.
          FINGERPRINTS=\$(gpg --batch --list-secret-keys --with-colons | awk -F: '/^sec:/ { primary = 1; next } primary && /^fpr:/ { print \$10; primary = 0 }')
          if [ "\$(printf '%s' "\${FINGERPRINTS}" | grep -c .)" != 1 ]; then
            echo "::error::${signingKeySecret} must contain exactly one GPG secret key."
            exit 1
          fi
          FINGERPRINT="\${FINGERPRINTS}"
          MAINTAINER=\$(gpg --batch --list-secret-keys --with-colons "\${FINGERPRINT}" | awk -F: '/^uid:/ { print \$10; exit }')

          GPG_ARGS=(--batch --yes --local-user "\${FINGERPRINT}")
          if [ -n "\${SIGNING_KEY_PASSPHRASE:-}" ]; then
            PASSPHRASE_FILE="\${RUNNER_TEMP}/signing-passphrase"
            (umask 077 && printf '%s' "\${SIGNING_KEY_PASSPHRASE}" > "\${PASSPHRASE_FILE}")
            GPG_ARGS+=(--pinentry-mode loopback --passphrase-file "\${PASSPHRASE_FILE}")
          fi
          # Fail here, not after packaging, if the key cannot sign.
          echo probe | gpg "\${GPG_ARGS[@]}" --clearsign > /dev/null

          {
            echo "fingerprint=\${FINGERPRINT}"
            echo "maintainer=\${MAINTAINER:-${packageName}}"
          } >> "\$GITHUB_OUTPUT"

      - name: Build the packages from the musl release archives
        id: packages
        env:
          GH_TOKEN: \${{ secrets.GITHUB_TOKEN }}
          MAINTAINER: \${{ steps.key.outputs.maintainer }}
          FINGERPRINT: \${{ steps.key.outputs.fingerprint }}${passphraseEnv}
        shell: bash
        run: |
          set -euo pipefail

          TAG="\${GITHUB_REF_NAME}"
          # Tags may be prefixed (\`my-app/1.2.3\`, \`releases/v1.2.3\`). A
          # semver prerelease \`-rc.1\` becomes \`~rc.1\` so it sorts before
          # the final release, as both Debian and RPM versioning require.
          # Every \`-\` is read as semver, so Debian revisions (\`v1.2.3-1\`)
          # are unsupported.
          VERSION="\${TAG##*/}"
          VERSION="\${VERSION#v}"
          VERSION="\${VERSION//-/\\~}"
          if ! [[ "\${VERSION}" =~ ^[0-9][A-Za-z0-9.+~]*$ ]]; then
            echo "::error::Cannot derive a package version from tag \${TAG}."
            exit 1
          fi
          OUT="\${RUNNER_TEMP}/packages"
          mkdir -p "\${OUT}"
${
    rpm
        ? `          if ! command -v rpmbuild > /dev/null 2>&1; then
            sudo apt-get update && sudo apt-get install -y rpm
          fi
`
        : ""
}
          for triple in ${archTargets}; do
            DEB_ARCH="\${triple%%:*}"
            REST="\${triple#*:}"
            RPM_ARCH="\${REST%%:*}"
            SUFFIX="-\${REST#*:}.tar.gz"

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

            DOWNLOAD="\${RUNNER_TEMP}/download/\${DEB_ARCH}"
            mkdir -p "\${DOWNLOAD}"
            gh release download "\${TAG}" --repo "\${GITHUB_REPOSITORY}" --pattern "\${ASSET_NAME}" --dir "\${DOWNLOAD}"
            tar -xzf "\${DOWNLOAD}/\${ASSET_NAME}" -C "\${DOWNLOAD}"
            BINARY=\$(find "\${DOWNLOAD}" -type f -perm -u+x -name "${binaryName}" | head -n1)
            if [ -z "\${BINARY}" ]; then
              echo "::error::\${ASSET_NAME} does not contain a ${binaryName} executable."
              exit 1
            fi
${deb ? constructDebBuild({ binaryName, repoUrl, summary }) : ""}${rpm ? constructRpmBuild({ binaryName, repoUrl, license, summary }) : ""}          done
${rpm ? constructRpmSign({ passphrase: passphraseEnv !== "" }) : ""}
          echo "version=\${VERSION}" >> "\$GITHUB_OUTPUT"

${tokenStep}      - name: Check out the package repository
        uses: actions/checkout@v6
        with:
          repository: "${linuxPackages.repository}"
          token: ${checkoutToken}
          path: linux-repo
          # Credentials must persist — the last step pushes the branch back.
          persist-credentials: true

      - name: Add the packages and sign the repository metadata
        env:
          VERSION: \${{ steps.packages.outputs.version }}
          FINGERPRINT: \${{ steps.key.outputs.fingerprint }}${passphraseEnv}
        shell: bash
        run: |
          set -euo pipefail

          TOOLS=()
${deb ? "          command -v apt-ftparchive > /dev/null 2>&1 || TOOLS+=(apt-utils)\n" : ""}${rpm ? "          command -v createrepo_c > /dev/null 2>&1 || TOOLS+=(createrepo-c)\n" : ""}          if [ "\${#TOOLS[@]}" -gt 0 ]; then
            sudo apt-get update && sudo apt-get install -y "\${TOOLS[@]}"
          fi

          cd linux-repo
          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          # The branch is created on first publish, holding only the
          # repository tree.
          # Exit code 2 means the branch does not exist; anything else
          # non-zero is a transport or auth failure and must not orphan it.
          BRANCH_STATUS=0
          git ls-remote --exit-code --heads origin "\${BRANCH}" > /dev/null || BRANCH_STATUS=\$?
          if [ "\${BRANCH_STATUS}" = 0 ]; then
            git fetch --depth 1 origin "\${BRANCH}"
            git checkout -B "\${BRANCH}" FETCH_HEAD
          elif [ "\${BRANCH_STATUS}" = 2 ]; then
            git checkout --orphan "\${BRANCH}"
            git rm -rf --quiet . || true
          else
            echo "::error::Could not read \${BRANCH} from the package repository (git ls-remote exited \${BRANCH_STATUS})."
            exit 1
          fi

          PACKAGES="\${RUNNER_TEMP}/packages"
          ADDED=0
          # Skip only when the signed indexes already list every package, so
          # a pool that got ahead of its metadata is re-indexed.
          INDEXED=1
${deb ? constructDebPublish(packageName) : ""}${rpm ? constructRpmPublish() : ""}          if [ "\${ADDED}" = 0 ] && [ "\${INDEXED}" = 1 ]; then
            echo "\${PACKAGE} \${VERSION} is already published; nothing to commit."
            exit 0
          fi

          GPG_ARGS=(--batch --yes --local-user "\${FINGERPRINT}")
          if [ -n "\${SIGNING_KEY_PASSPHRASE:-}" ]; then
            GPG_ARGS+=(--pinentry-mode loopback --passphrase-file "\${RUNNER_TEMP}/signing-passphrase")
          fi
${deb ? constructDebIndex() : ""}${rpm ? constructRpmIndex() : ""}
          gpg --batch --armor --export "\${FINGERPRINT}" > gpg.key
          # GitHub Pages must serve the tree verbatim.
          touch .nojekyll

          git add -A .
          git commit -m "\${PACKAGE} \${VERSION}"
          git push origin "HEAD:\${BRANCH}"
`;
}

function constructDebBuild(args: { binaryName: string; repoUrl: string | undefined; summary: string }): string {
    const { binaryName, repoUrl, summary } = args;
    const homepageLine = repoUrl != null ? `\n              echo ${shellQuote(`Homepage: ${repoUrl}`)}` : "";
    return `
            ROOT="\${RUNNER_TEMP}/deb-root/\${DEB_ARCH}"
            mkdir -p "\${ROOT}/DEBIAN" "\${ROOT}/usr/bin"
            install -m 0755 "\${BINARY}" "\${ROOT}/usr/bin/${binaryName}"
            {
              echo "Package: \${PACKAGE}"
              echo "Version: \${VERSION}"
              echo "Architecture: \${DEB_ARCH}"
              echo "Maintainer: \${MAINTAINER}"
              echo "Installed-Size: \$(du -sk "\${ROOT}/usr" | cut -f1)"
              echo "Section: utils"
              echo "Priority: optional"${homepageLine}
              echo ${shellQuote(`Description: ${summary}`)}
            } > "\${ROOT}/DEBIAN/control"

            # xz, not dpkg's zstd default on Ubuntu: apt on Debian 11 and
            # older cannot unpack zstd members.
            dpkg-deb -Zxz --root-owner-group --build "\${ROOT}" "\${OUT}/\${PACKAGE}_\${VERSION}_\${DEB_ARCH}.deb"
`;
}

function constructRpmBuild(args: {
    binaryName: string;
    repoUrl: string | undefined;
    license: string | undefined;
    summary: string;
}): string {
    const { binaryName, repoUrl, license, summary } = args;
    const urlLine = repoUrl != null ? `\n              echo ${shellQuote(`URL: ${rpmEscape(repoUrl)}`)}` : "";
    return `
            TOP="\${RUNNER_TEMP}/rpmbuild/\${RPM_ARCH}"
            mkdir -p "\${TOP}/SOURCES" "\${TOP}/SPECS"
            install -m 0755 "\${BINARY}" "\${TOP}/SOURCES/${binaryName}"
            {
              echo "Name: \${PACKAGE}"
              echo "Version: \${VERSION}"
              echo "Release: 1"
              echo ${shellQuote(`Summary: ${rpmEscape(summary)}`)}
              echo ${shellQuote(`License: ${rpmEscape(license ?? "LicenseRef-Unspecified")}`)}${urlLine}
              echo "Packager: \${MAINTAINER//\\%/%%}"
              echo "Source0: ${binaryName}"
              echo "AutoReqProv: no"
              echo
              echo "%description"
              echo ${shellQuote(rpmEscape(summary))}
              echo
              echo "%install"
              echo "install -D -m 0755 %{SOURCE0} %{buildroot}/usr/bin/${binaryName}"
              echo
              echo "%files"
              echo "/usr/bin/${binaryName}"
            } > "\${TOP}/SPECS/\${PACKAGE}.spec"

            # The binary is prebuilt for the target, so skip the host's
            # strip/debuginfo passes. xz, not zstd, so yum on EL7 can read it.
            rpmbuild -bb --quiet --target "\${RPM_ARCH}" \\
              --define "_topdir \${TOP}" \\
              --define "debug_package %{nil}" \\
              --define "__os_install_post %{nil}" \\
              --define "_build_id_links none" \\
              --define "_binary_payload w9.xzdio" \\
              "\${TOP}/SPECS/\${PACKAGE}.spec"
            cp "\${TOP}/RPMS/\${RPM_ARCH}/\${PACKAGE}-\${VERSION}-1.\${RPM_ARCH}.rpm" "\${OUT}/"
`;
}

function constructRpmSign(args: { passphrase: boolean }): string {
    const extraArgs = args.passphrase
        ? `
            --define "_gpg_sign_cmd_extra_args --pinentry-mode loopback --passphrase-file \${RUNNER_TEMP}/signing-passphrase" \\`
        : "";
    return `
          # dnf checks each package's own signature (gpgcheck) as well as
          # the signed repository metadata (repo_gpgcheck).
          # Ubuntu's rpm macros point %__gpg at a gpg2 binary it does not ship.
          rpmsign --addsign \\
            --define "__gpg \$(command -v gpg)" \\
            --define "_gpg_name \${FINGERPRINT}" \\${extraArgs}
            "\${OUT}"/*.rpm
`;
}

function constructDebPublish(packageName: string): string {
    const pool = `pool/${COMPONENT}/${packageName.charAt(0)}/${packageName}`;
    return `
          DEB_POOL="${pool}"
          mkdir -p "deb/\${DEB_POOL}"
          for deb in "\${PACKAGES}"/*.deb; do
            NAME="\$(basename "\${deb}" .deb)"
            if [ -e "deb/\${DEB_POOL}/\${NAME}.deb" ]; then
              echo "\${NAME}.deb is already in the pool; keeping the published file."
            else
              cp "\${deb}" "deb/\${DEB_POOL}/"
              ADDED=1
            fi
            ARCH="\${NAME##*_}"
            grep -qxF "Filename: \${DEB_POOL}/\${NAME}.deb" "deb/dists/${SUITE}/${COMPONENT}/binary-\${ARCH}/Packages" 2>/dev/null || INDEXED=0
          done
          [ -f "deb/dists/${SUITE}/InRelease" ] || INDEXED=0
`;
}

function constructRpmPublish(): string {
    return `
          mkdir -p rpm/packages
          PRIMARY=\$(find rpm/repodata -name '*-primary.xml.gz' 2> /dev/null | head -n1 || true)
          for rpm in "\${PACKAGES}"/*.rpm; do
            NAME="\$(basename "\${rpm}")"
            if [ -e "rpm/packages/\${NAME}" ]; then
              echo "\${NAME} is already published; keeping the published file."
            else
              cp "\${rpm}" rpm/packages/
              ADDED=1
            fi
            # Not \`grep -q\`: exiting early would fail the pipe under pipefail.
            if [ -z "\${PRIMARY}" ] || ! gzip -dc "\${PRIMARY}" | grep -F "href=\\"packages/\${NAME}\\"" > /dev/null; then
              INDEXED=0
            fi
          done
          [ -f rpm/repodata/repomd.xml.asc ] || INDEXED=0
`;
}

function constructDebIndex(): string {
    return `
          (
            cd deb
            DIST="dists/${SUITE}"
            for ARCH in ${ARCH_TARGETS.map(({ deb }) => deb).join(" ")}; do
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
              -o APT::FTPArchive::Release::Architectures="${ARCH_TARGETS.map(({ deb }) => deb).join(" ")}" \\
              -o APT::FTPArchive::Release::Components="${COMPONENT}" \\
              release "\${DIST}" > "\${RUNNER_TEMP}/Release"
            mv "\${RUNNER_TEMP}/Release" "\${DIST}/Release"
            gpg "\${GPG_ARGS[@]}" --clearsign --output "\${DIST}/InRelease" "\${DIST}/Release"
            gpg "\${GPG_ARGS[@]}" --armor --detach-sign --output "\${DIST}/Release.gpg" "\${DIST}/Release"
          )
`;
}

function constructRpmIndex(): string {
    return `
          # gzip, not zstd: yum on EL7 cannot read zstd repodata.
          createrepo_c --quiet --update --general-compress-type gz rpm
          rm -f rpm/repodata/repomd.xml.asc
          gpg "\${GPG_ARGS[@]}" --armor --detach-sign --output rpm/repodata/repomd.xml.asc rpm/repodata/repomd.xml
          {
            echo "[\${PACKAGE}]"
            echo "name=\${PACKAGE}"
            echo "baseurl=\${REPOSITORY_URL}/rpm"
            echo "enabled=1"
            echo "gpgcheck=1"
            echo "repo_gpgcheck=1"
            echo "gpgkey=\${REPOSITORY_URL}/gpg.key"
          } > "rpm/\${PACKAGE}.repo"
`;
}

/** Keep `%` literal in an RPM spec, where it would start a macro. */
function rpmEscape(value: string): string {
    return value.replace(/%/g, "%%");
}

/** Single-quote a value for safe interpolation into the generated bash. */
function shellQuote(value: string): string {
    return `'${value.replace(/'/g, `'\\''`)}'`;
}
