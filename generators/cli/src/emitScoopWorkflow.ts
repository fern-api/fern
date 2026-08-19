import { type FernCliScoopConfig, type ResolvedChannelAuth } from "./customConfig.js";
import { appTokenExpression, CREDENTIAL_PREFLIGHT_JOB, constructAppTokenStep } from "./githubAppToken.js";

/**
 * The Rust target whose cargo-dist archive backs Scoop's `64bit`
 * architecture key.
 *
 * `aarch64-pc-windows-msvc` is deliberately absent: it is not in the
 * `targets` list in `dist-workspace.toml`, so no ARM64 Windows archive
 * exists to point a manifest at. Adding it means adding a build target
 * to every release — a separate decision. Until then the emitted
 * manifest is x64-only, which Scoop runs fine on ARM64 Windows under
 * emulation.
 */
const WINDOWS_ARCHIVE_SUFFIX = "-x86_64-pc-windows-msvc.zip";

/**
 * Short retry around the asset lookup.
 *
 * This is *not* a race against the release pipeline — `needs: host`
 * means `gh release create` has already returned, so the archives are
 * uploaded. It only absorbs eventual consistency in the GitHub API
 * between a release existing and its assets being listable.
 */
const LOOKUP_ATTEMPTS = 6;
const LOOKUP_INTERVAL_SECONDS = 10;

export interface ScoopJobArgs {
    binaryName: string;
    scoop: FernCliScoopConfig;
    /** Repository URL, used for the manifest's `homepage` + `checkver`. */
    repoUrl: string | undefined;
    /** SPDX license, when the consumer pinned one via `packageIdentity`. */
    license: string | undefined;
    /** Human-readable API name for the manifest's `description`. */
    description: string;
}

/**
 * `ScoopJobArgs` plus the two things only the release-workflow composer
 * knows. Kept separate so `runPipeline` supplies just the config-derived
 * fields and never has to resolve auth itself — `resolveChannelAuth` has
 * exactly one evaluation site, in `constructReleaseWorkflowYaml`.
 */
export interface ScoopJobYamlArgs extends ScoopJobArgs {
    /** How the bucket push authenticates. */
    auth: ResolvedChannelAuth;
    /**
     * Whether a `preflight-distribution` job was emitted, in which case
     * this job waits on it.
     */
    preflightJob: boolean;
}

/**
 * Build the `publish-scoop` job appended to the generated `release.yml`.
 *
 * cargo-dist has no Scoop support (its installers are shell, powershell,
 * npm, homebrew, msi and pkg), so unlike Homebrew this channel is not a
 * `dist-workspace.toml` flag — we render the manifest ourselves from the
 * Windows archive cargo-dist publishes.
 *
 * It sits in `release.yml` beside `publish-homebrew-formula`, gated on
 * the same `host` job and the same prerelease expression. An earlier
 * revision put it in `ci.yml` to keep `release.yml` a verbatim
 * cargo-dist artifact; that was the wrong trade:
 *
 *  - **The channels could drift.** `ci.yml` gated it on `check` /
 *    `compile` / `test`, which `release.yml` knows nothing about. One
 *    flaky test meant Homebrew published a new version while the Scoop
 *    bucket silently stayed behind — with a green Release to look at.
 *  - **It needed a poll loop.** A job in `ci.yml` cannot `needs:` a job
 *    in `release.yml`, so it waited up to 30 minutes for the archive.
 *    `needs: host` removes that mechanism entirely.
 *  - **Re-running cost ~12 minutes** of unrelated build and test before
 *    retrying an 8-second publish.
 *
 * Exported separately from the emitters so the YAML is unit-testable
 * without touching disk.
 */
export function constructScoopJobYaml(args: ScoopJobYamlArgs): string {
    const { binaryName, scoop, repoUrl, license, description, auth, preflightJob } = args;
    const homepage = repoUrl ?? "";

    // Only the cross-repo push needs the App. The two steps above it call
    // `gh release view` / `gh release download` against *this* repo's own
    // release, which the built-in token can do, so they keep their
    // step-level `secrets.GITHUB_TOKEN`.
    //
    // The mint step therefore sits immediately before the checkout it
    // feeds, not at the top of the job: placed first it reads as though it
    // covers the `gh` steps too, which invites deleting their `GH_TOKEN`.
    const tokenStep =
        auth.type === "githubApp"
            ? `${constructAppTokenStep({ name: "Mint a bucket token", app: auth.app, repo: scoop.bucket })}\n`
            : "";
    const checkoutToken = auth.type === "githubApp" ? appTokenExpression() : `\${{ secrets.${auth.tokenSecret} }}`;
    // Gated on *this* channel's auth, not merely on the job existing — a
    // PAT-authenticated bucket push must not be skipped because the other
    // channel's App credentials are malformed.
    const preflightNeed = preflightJob && auth.type === "githubApp" ? `      - ${CREDENTIAL_PREFLIGHT_JOB}\n` : "";

    // Assembled as a jq invocation rather than a heredoc so the manifest
    // is always valid JSON no matter what characters the description or
    // asset name carry.
    const jqArgs = [
        '--arg version "${VERSION}"',
        `--arg description ${shellQuote(description)}`,
        `--arg homepage ${shellQuote(homepage)}`,
        '--arg url "${URL}"',
        '--arg hash "${HASH}"',
        `--arg bin ${shellQuote(`${binaryName}.exe`)}`,
        '--arg autoupdate "${AUTOUPDATE_URL}"'
    ];
    const manifestFields = [
        "version: $version",
        "description: $description",
        "homepage: $homepage",
        'architecture: { "64bit": { url: $url, hash: $hash, bin: $bin } }',
        'autoupdate: { architecture: { "64bit": { url: $autoupdate } } }'
    ];
    if (license != null) {
        jqArgs.splice(3, 0, `--arg license ${shellQuote(license)}`);
        manifestFields.splice(3, 0, "license: $license");
    }
    if (repoUrl != null) {
        jqArgs.push(`--arg checkver ${shellQuote(repoUrl)}`);
        manifestFields.push("checkver: { github: $checkver }");
    }

    const jqArgLines = jqArgs.map((arg) => `            ${arg} \\`).join("\n");
    const jqFilter = manifestFields
        .map((field) => `              ${field},`)
        .join("\n")
        .replace(/,$/, "");

    return `
  publish-scoop:
    needs:
      - plan
      - host
${preflightNeed}    runs-on: "ubuntu-22.04"
    # The same expression cargo-dist uses for its own publish jobs. A Scoop
    # bucket has no prerelease channel — a manifest simply *is* the version
    # \`scoop install\` hands out — so an RC must not become what every user
    # installs. Deferring to cargo-dist's own semver determination instead of
    # re-parsing the tag keeps both channels in agreement by construction.
    if: \${{ !fromJson(needs.plan.outputs.val).announcement_is_prerelease || fromJson(needs.plan.outputs.val).publish_prereleases }}
    steps:
      - name: Resolve the Windows release archive
        id: archive
        env:
          GH_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        shell: bash
        run: |
          set -euo pipefail

          TAG="\${GITHUB_REF_NAME}"
          SUFFIX="${WINDOWS_ARCHIVE_SUFFIX}"

          # Resolved by target-triple suffix rather than full name: cargo-dist
          # names archives after the cargo *package*, which the generator does
          # not always control.
          ASSET_NAME=""
          for attempt in \$(seq 1 ${LOOKUP_ATTEMPTS}); do
            ASSET_NAME=\$(gh release view "\${TAG}" --repo "\${GITHUB_REPOSITORY}" --json assets \\
              --jq ".assets[].name | select(endswith(\\"\${SUFFIX}\\"))" 2>/dev/null | head -n1 || true)
            if [ -n "\${ASSET_NAME}" ]; then
              break
            fi
            echo "Release assets not listable yet (attempt \${attempt}/${LOOKUP_ATTEMPTS}); retrying..."
            sleep ${LOOKUP_INTERVAL_SECONDS}
          done

          if [ -z "\${ASSET_NAME}" ]; then
            echo "::error::No asset ending in \${SUFFIX} on release \${TAG}. The host job already created the release, so this means the Windows archive was never built — check the build-local-artifacts leg for x86_64-pc-windows-msvc."
            exit 1
          fi

          echo "asset-name=\${ASSET_NAME}" >> "\$GITHUB_OUTPUT"

      - name: Download the archive and hash it
        id: manifest
        env:
          GH_TOKEN: \${{ secrets.GITHUB_TOKEN }}
          ASSET_NAME: \${{ steps.archive.outputs.asset-name }}
        shell: bash
        run: |
          set -euo pipefail

          TAG="\${GITHUB_REF_NAME}"
          VERSION="\${TAG#v}"

          gh release download "\${TAG}" --repo "\${GITHUB_REPOSITORY}" \\
            --pattern "\${ASSET_NAME}" --dir "\${RUNNER_TEMP}/scoop"
          HASH=\$(sha256sum "\${RUNNER_TEMP}/scoop/\${ASSET_NAME}" | cut -d' ' -f1)

          # cargo-dist archive names carry no version, so the autoupdate URL
          # is the release URL with the tag replaced by Scoop's \$version
          # placeholder. Preserve whether the tag is v-prefixed.
          if [ "\${TAG}" = "v\${VERSION}" ]; then
            TAG_TEMPLATE='v\$version'
          else
            TAG_TEMPLATE='\$version'
          fi

          {
            echo "version=\${VERSION}"
            echo "hash=\${HASH}"
            echo "url=\${GITHUB_SERVER_URL}/\${GITHUB_REPOSITORY}/releases/download/\${TAG}/\${ASSET_NAME}"
            echo "autoupdate-url=\${GITHUB_SERVER_URL}/\${GITHUB_REPOSITORY}/releases/download/\${TAG_TEMPLATE}/\${ASSET_NAME}"
          } >> "\$GITHUB_OUTPUT"

${tokenStep}      - name: Check out the Scoop bucket
        uses: actions/checkout@v6
        with:
          repository: "${scoop.bucket}"
          token: ${checkoutToken}
          path: scoop-bucket
          # Credentials must persist — the next step pushes the manifest back.
          persist-credentials: true
          fetch-depth: 1

      - name: Write and push the manifest
        env:
          VERSION: \${{ steps.manifest.outputs.version }}
          URL: \${{ steps.manifest.outputs.url }}
          HASH: \${{ steps.manifest.outputs.hash }}
          AUTOUPDATE_URL: \${{ steps.manifest.outputs.autoupdate-url }}
        shell: bash
        run: |
          set -euo pipefail

          mkdir -p scoop-bucket/bucket
          jq -n \\
${jqArgLines}
            '{
${jqFilter}
            }' > "scoop-bucket/bucket/${binaryName}.json"

          cd scoop-bucket
          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git add "bucket/${binaryName}.json"

          # Re-running a release must be a no-op rather than an empty-commit
          # failure — unlike npm, this channel is idempotent.
          if git diff --cached --quiet; then
            echo "bucket/${binaryName}.json is already up to date; nothing to commit."
          else
            git commit -m "${binaryName} \${VERSION}"
            git push
          fi
`;
}

/**
 * Single-quote a value for safe interpolation into the generated bash.
 * Values reaching here are generator-controlled (a license, a repo URL,
 * the API display name), but they are user-authored strings and an
 * apostrophe in a description would otherwise break the script.
 */
function shellQuote(value: string): string {
    return `'${value.replace(/'/g, `'\\''`)}'`;
}
