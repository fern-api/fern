import type { FernCliGitHubAppConfig } from "./customConfig.js";

/**
 * The action that exchanges an App's private key for a short-lived
 * installation token. Pinned by major, matching how the rest of the
 * cargo-dist template pins `actions/checkout@v6` /
 * `actions/download-artifact@v7`.
 */
const CREATE_APP_TOKEN_ACTION = "actions/create-github-app-token@v2";

/**
 * Step id both publish jobs read their token back out of. Not exported —
 * callers go through `appTokenExpression()` so the id and the expression
 * that reads it cannot drift apart.
 */
const APP_TOKEN_STEP_ID = "app-token";

/**
 * Render the step that mints an installation token scoped to a single
 * repository.
 *
 * This is the **only** place `owner` / `repositories` are derived from a
 * repo slug. Both publish jobs call it, because hand-writing the block
 * twice is how the Scoop job ends up minting a token scoped to the
 * Homebrew tap: the credentials are legitimately identical across
 * channels, so the mistake is invisible on inspection and surfaces as
 * `remote: Repository not found` against a repo that plainly exists.
 *
 * `owner` is passed explicitly rather than left to default, so a tap and
 * a bucket living under different accounts each mint from that account's
 * installation of the same App.
 */
export function constructAppTokenStep(args: { name: string; app: FernCliGitHubAppConfig; repo: string }): string {
    const { name, app, repo } = args;
    const { owner, repository } = splitRepoSlug(repo);
    return `      - name: ${name}
        id: ${APP_TOKEN_STEP_ID}
        uses: ${CREATE_APP_TOKEN_ACTION}
        with:
          app-id: \${{ secrets.${app.appIdSecret} }}
          private-key: \${{ secrets.${app.privateKeySecret} }}
          owner: ${owner}
          repositories: ${repository}
`;
}

/** The expression a publish job reads its minted token back out of. */
export function appTokenExpression(): string {
    return `\${{ steps.${APP_TOKEN_STEP_ID}.outputs.token }}`;
}

/** Job name, referenced from the publish jobs' `needs` lists. */
export const CREDENTIAL_PREFLIGHT_JOB = "preflight-distribution";

/**
 * A ~20-second job that fails loudly when the App secrets are absent or
 * malformed.
 *
 * Whether a secret exists is a runtime fact, so the generator cannot
 * catch this at generation time. What it *can* do is control when the
 * failure lands. Without this job the first thing to touch the
 * credentials is `create-github-app-token` inside a job gated on
 * `needs: host` — i.e. after the full build matrix and after
 * `gh release create` has already published the release, roughly forty
 * minutes in, with a message (`appId is required`) that names neither the
 * secret nor the fix.
 *
 * Deliberately declares no `needs`, so it starts immediately and reports
 * before the build has finished planning.
 *
 * Only the publish jobs depend on it, not the build. A bad secret then
 * costs the formula and the manifest but still ships archives and
 * installers, and recovery is re-running two jobs once the secret is
 * fixed. Making the whole release depend on it would mean one wrong tap
 * secret also denies every `curl | bash` user their release.
 */
export function constructCredentialPreflightJob(args: { checks: readonly PreflightCheck[] }): string {
    const { checks } = args;
    const steps = checks.map((check) => constructPreflightStep(check)).join("");
    return `
  ${CREDENTIAL_PREFLIGHT_JOB}:
    runs-on: "ubuntu-22.04"
    # \`release.yml\` also runs \`dist plan\` on pull_request, where secrets are
    # unavailable to forks. Without this gate every contributor's PR would
    # fail on a secret they cannot be given. Mirrors how \`plan\` derives its
    # own \`publishing\` output.
    if: \${{ !github.event.pull_request }}
    steps:
${steps}`;
}

export interface PreflightCheck {
    /** Human-readable channel label, e.g. "Homebrew tap". */
    label: string;
    app: FernCliGitHubAppConfig;
}

/**
 * One channel's credential check.
 *
 * Notes on the emitted bash:
 *  - **Neither value is ever echoed.** GitHub masks known secrets in
 *    logs, but nothing here relies on that: a `case` test and a line
 *    count print nothing on either path.
 *  - **The App identifier is only checked for emptiness.**
 *    `create-github-app-token` accepts the numeric App ID *or* the App's
 *    Client ID (`Iv23…`), so a `^[0-9]+$` assertion would reject a valid
 *    configuration — a guardrail that causes the outage it exists to
 *    prevent.
 *  - **`case`, not `[[ =~ ]]`**, so there is no dependency on a bash
 *    version or on regex quoting inside a YAML scalar.
 *  - **The single-line PEM check is the valuable one.** A collapsed PEM
 *    still carries its BEGIN header, so the header test passes and the
 *    only signal left is the missing line breaks.
 */
function constructPreflightStep(check: PreflightCheck): string {
    const { label, app } = check;
    return `      - name: Verify the ${label} App credentials
        env:
          APP_ID: \${{ secrets.${app.appIdSecret} }}
          PRIVATE_KEY: \${{ secrets.${app.privateKeySecret} }}
        shell: bash
        run: |
          set -uo pipefail

          # Normalized through \`:-\` before anything reads them. \`set -u\` aborts
          # on an *unset* variable, and this job exists to explain a missing
          # secret — dying with "APP_ID: unbound variable" instead of the
          # message below would defeat the whole point.
          APP_ID="\${APP_ID:-}"
          PRIVATE_KEY="\${PRIVATE_KEY:-}"

          status=0

          if [ -z "\${APP_ID}" ]; then
            echo "::error title=Missing secret::secrets.${app.appIdSecret} is empty. Add it under Settings > Secrets and variables > Actions > Secrets. An Actions *variable* of the same name is not readable as secrets.${app.appIdSecret}. The value is the App ID (or Client ID) shown on your GitHub App's settings page."
            status=1
          fi

          if [ -z "\${PRIVATE_KEY}" ]; then
            echo "::error title=Missing secret::secrets.${app.privateKeySecret} is empty. Add it as an Actions secret containing the entire contents of the .pem file you downloaded when generating the App's private key."
            status=1
          else
            case "\${PRIVATE_KEY}" in
              *"BEGIN"*"PRIVATE KEY"*) ;;
              *)
                echo "::error title=Malformed private key::secrets.${app.privateKeySecret} does not contain a PEM header. Paste the whole .pem file, including its BEGIN and END lines."
                status=1
                ;;
            esac
            if [ "\$(printf '%s\\n' "\${PRIVATE_KEY}" | wc -l | tr -d ' ')" -lt 3 ]; then
              echo "::error title=Malformed private key::secrets.${app.privateKeySecret} is a single line. The PEM must keep its line breaks - re-paste it from the file without collapsing it. This is the most common cause of 'secretOrPrivateKey must be an asymmetric key'."
              status=1
            fi
          fi

          if [ "\${status}" -eq 0 ]; then
            echo "${label} App credentials are present and well-formed."
          fi
          exit "\${status}"
`;
}

function splitRepoSlug(repo: string): { owner: string; repository: string } {
    const [owner, repository] = repo.split("/");
    if (owner == null || repository == null || owner === "" || repository === "") {
        // Unreachable via config: `requireRepoSlug` in customConfig.ts has
        // already matched `<owner>/<repo>`. Guarded anyway so a future
        // caller that skips validation fails here rather than emitting a
        // workflow with an empty `owner:`.
        throw new Error(`Expected a "<owner>/<repo>" slug, got ${JSON.stringify(repo)}.`);
    }
    return { owner, repository };
}
