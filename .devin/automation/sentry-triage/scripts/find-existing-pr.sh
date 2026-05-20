#!/usr/bin/env bash
# find-existing-pr.sh — deterministic existing-PR lookup for Sentry triage shortIds.
#
# Usage: find-existing-pr.sh CLI-44 CLI-4T ...
# Env:
#   FERN_REPO   GitHub repo (default: fern-api/fern)
#   LEDGER_DIR  Path to ledger directory (default: .devin/automation/sentry-triage/ledger)
#
# Requires: gh, jq
# Stdout: JSON array (one object per input shortId)
# Stderr: progress messages
# Exit: 0 on success; non-zero on missing tools or gh auth failure

set -euo pipefail

FERN_REPO="${FERN_REPO:-fern-api/fern}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LEDGER_DIR="${LEDGER_DIR:-${SCRIPT_DIR}/../ledger}"

if ! command -v gh >/dev/null 2>&1; then
  echo "error: gh is required but not found in PATH" >&2
  exit 1
fi
if ! command -v jq >/dev/null 2>&1; then
  echo "error: jq is required but not found in PATH" >&2
  exit 1
fi
if [[ $# -lt 1 ]]; then
  echo "usage: find-existing-pr.sh <shortId> [shortId ...]" >&2
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "error: gh is not authenticated (run: gh auth login)" >&2
  exit 1
fi

if [[ ! -d "${LEDGER_DIR}" ]]; then
  echo "error: ledger directory not found at ${LEDGER_DIR}" >&2
  exit 1
fi

# --- helpers -----------------------------------------------------------------

# Normalize shortId for branch matching (CLI-44 -> cli-44)
normalize_short_id_kebab() {
  echo "$1" | tr '[:upper:]' '[:lower:]'
}

# Fetch PR metadata by number or URL; prints JSON object or empty on failure
fetch_pr_metadata() {
  local ref="$1"
  local source="$2"
  gh pr view "${ref}" --repo "${FERN_REPO}" \
    --json state,isDraft,mergedAt,url,title,body,headRefName,baseRefName,number,files 2>/dev/null \
    | jq --arg source "${source}" '
        {
          source: $source,
          url: .url,
          number: .number,
          state: .state,
          isDraft: .isDraft,
          mergedAt: .mergedAt,
          headRefName: .headRefName,
          baseRefName: .baseRefName,
          title: .title,
          body: .body,
          files: [(.files // [])[] | .path]
        }
      ' 2>/dev/null || true
}

# Merge candidate into accumulator array (dedupe by url)
add_candidate() {
  local candidate="$1"
  if [[ -z "${candidate}" || "${candidate}" == "null" ]]; then
    return
  fi
  local url
  url="$(echo "${candidate}" | jq -r '.url // empty')"
  if [[ -z "${url}" ]]; then
    return
  fi
  # Skip if url already present
  if echo "${CANDIDATES_JSON}" | jq -e --arg url "${url}" 'map(select(.url == $url)) | length > 0' >/dev/null 2>&1; then
    return
  fi
  CANDIDATES_JSON="$(echo "${CANDIDATES_JSON}" | jq --argjson c "${candidate}" '. + [$c]')"
}

# --- branch search (one API call for all shortIds) ---------------------------

echo "fetching open PRs with fix/cli-sentry-triage/ branch prefix..." >&2
BRANCH_SEARCH_JSON="$(
  gh pr list --repo "${FERN_REPO}" --state open \
    --search "fix/cli-sentry-triage/ in:head" \
    --limit 100 \
    --json number,url,headRefName,title,body,state,isDraft,mergedAt,baseRefName 2>/dev/null \
    || echo '[]'
)"

# --- per shortId --------------------------------------------------------------

RESULTS="[]"

for SHORT_ID in "$@"; do
  echo "processing ${SHORT_ID}..." >&2
  CANDIDATES_JSON="[]"
  KEBAB_ID="$(normalize_short_id_kebab "${SHORT_ID}")"

  # 1. Ledger lookup (per-shortId file)
  LEDGER_FILE="${LEDGER_DIR}/${SHORT_ID}.json"
  if [[ -f "${LEDGER_FILE}" ]]; then
    LEDGER_ROW="$(
      jq '{
        prOrIssue: (.prOrIssue // null),
        disposition: (.disposition // null)
      }' "${LEDGER_FILE}"
    )"
  else
    LEDGER_ROW="null"
  fi

  PR_OR_ISSUE="$(echo "${LEDGER_ROW}" | jq -r '.prOrIssue // empty' 2>/dev/null || true)"
  if [[ -n "${PR_OR_ISSUE}" && "${PR_OR_ISSUE}" != "null" ]]; then
  if [[ "${PR_OR_ISSUE}" =~ ^https?:// ]]; then
    echo "  ledger prOrIssue: ${PR_OR_ISSUE}" >&2
    META="$(fetch_pr_metadata "${PR_OR_ISSUE}" "ledger")"
    add_candidate "${META}"
  fi
  fi

  # 2. Triage-branch search (open PRs with fix/cli-sentry-triage/ head only; match shortId in branch, title, or body)
  echo "  matching triage PRs for shortId ${SHORT_ID}..." >&2
  while IFS= read -r pr_number; do
    [[ -z "${pr_number}" ]] && continue
    META="$(fetch_pr_metadata "${pr_number}" "triageBranchSearch")"
    add_candidate "${META}"
  done < <(
    echo "${BRANCH_SEARCH_JSON}" \
      | jq -r --arg kebab "${KEBAB_ID}" '
          .[]
          | select(
              (.headRefName // "" | ascii_downcase | contains($kebab))
              or (.title // "" | test($kebab; "i"))
              or (.body // "" | test($kebab; "i"))
            )
          | .number
        ' 2>/dev/null || true
  )

  # 3. Verification metadata — already included in fetch_pr_metadata (files, state, etc.)

  ENTRY="$(
    jq -n \
      --arg shortId "${SHORT_ID}" \
      --argjson ledger "${LEDGER_ROW:-null}" \
      --argjson candidates "${CANDIDATES_JSON}" \
      '{ shortId: $shortId, ledger: $ledger, candidates: $candidates }'
  )"
  RESULTS="$(echo "${RESULTS}" | jq --argjson entry "${ENTRY}" '. + [$entry]')"
done

echo "${RESULTS}" | jq '.'
