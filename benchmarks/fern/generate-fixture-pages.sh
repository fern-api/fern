#!/usr/bin/env bash
# Generates benchmark fixture markdown pages from a template at CI time.
# This avoids committing ~4800 lines of filler content to the repository.
#
# Usage: generate-fixture-pages.sh [page-count]
#   page-count: Number of pages to generate (default: 37)
#
# The generated pages exercise the same markdown processing code paths as
# real customer docs: frontmatter, headings, tables, code blocks, links, etc.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PAGES_DIR="${SCRIPT_DIR}/pages"
TEMPLATE="${PAGES_DIR}/template.md"
PAGE_COUNT="${1:-37}"

if [ ! -f "$TEMPLATE" ]; then
  echo "Error: Template not found at ${TEMPLATE}" >&2
  exit 1
fi

# Topics used to generate varied page content.
# Each entry: "slug|Title|Resource|Topic description|Example comment"
TOPICS=(
  "authentication|Authentication|auth|managing API keys and authentication|Authenticate with API key"
  "pagination|Pagination|pages|paginating through large result sets|Fetch a page of results"
  "rate-limiting|Rate Limiting|limits|understanding and handling rate limits|Check current rate limit status"
  "error-handling|Error Handling|errors|handling API errors gracefully|Handle common error scenarios"
  "webhooks|Webhooks|webhooks|receiving real-time event notifications|Register a webhook endpoint"
  "sdks|SDK Libraries|sdks|using official client libraries|Initialize the SDK client"
  "environments|Environments|environments|working with sandbox and production environments|Switch between environments"
  "configuration|Configuration|config|configuring API behavior and defaults|Update configuration settings"
  "versioning|API Versioning|versions|managing API version compatibility|Pin to a specific API version"
  "idempotency|Idempotency|requests|ensuring safe retries with idempotency keys|Send an idempotent request"
  "filtering|Filtering and Sorting|filters|querying and sorting API resources|Apply filters to a list request"
  "file-uploads|File Uploads|files|uploading and managing files|Upload a file to the API"
  "batch-operations|Batch Operations|batches|processing multiple items in one request|Create a batch of items"
  "realtime|Realtime Events|streams|subscribing to live event streams|Open a realtime event stream"
  "caching|Caching|cache|leveraging HTTP caching for performance|Set cache control headers"
  "search|Search|search|full-text and semantic search capabilities|Execute a search query"
  "subscriptions|Subscriptions|subscriptions|managing recurring billing and plans|Create a new subscription"
  "notifications|Notifications|notifications|configuring alerts and notification channels|Send a notification"
  "multi-tenancy|Multi-Tenancy|tenants|managing multiple organizations on one platform|Create a new tenant"
  "access-control|Access Control|roles|managing permissions and role-based access|Assign a role to a user"
  "security|Security|security|security best practices and features|Enable two-factor authentication"
  "metadata|Metadata|metadata|attaching custom data to API resources|Add metadata to a resource"
  "analytics|Analytics|analytics|tracking usage metrics and insights|Query analytics data"
  "audit-logs|Audit Logs|audit_logs|tracking all account actions and changes|Fetch recent audit log entries"
  "data-export|Data Export|exports|exporting data for analytics and compliance|Start a data export job"
  "localization|Localization|locales|serving content in multiple locales|Set the response locale"
  "oauth|OAuth 2.0|oauth|integrating with OAuth 2.0 authorization|Exchange authorization code for token"
  "quickstart|Quickstart|resources|getting started quickly with the API|Make your first API call"
  "migration-guide|Migration Guide|migrations|upgrading between API versions|Check migration compatibility"
  "best-practices|Best Practices|practices|recommended patterns for API integration|Follow recommended patterns"
  "testing|Testing|tests|testing your API integration|Run integration tests"
  "troubleshooting|Troubleshooting|diagnostics|diagnosing and resolving common issues|Run a diagnostic check"
  "changelog|Changelog|releases|tracking API changes and releases|Fetch the latest release notes"
  "introduction|Introduction|resources|getting an overview of the API platform|Explore the API"
  "getting-started|Getting Started|setup|setting up your development environment|Configure your environment"
  "api-overview|API Overview|api|understanding the API architecture|Inspect the API schema"
  "error-codes|Error Codes Reference|errors|looking up error codes and their meanings|Look up an error code"
)

TOPIC_COUNT=${#TOPICS[@]}
GENERATED=0

for i in $(seq 1 "$PAGE_COUNT"); do
  # Cycle through topics if page count exceeds topic list
  IDX=$(( (i - 1) % TOPIC_COUNT ))
  IFS='|' read -r SLUG TITLE RESOURCE TOPIC_DESC EXAMPLE_COMMENT <<< "${TOPICS[$IDX]}"

  # For pages beyond the first cycle, append a suffix to avoid duplicate slugs
  if [ "$i" -gt "$TOPIC_COUNT" ]; then
    SLUG="${SLUG}-${i}"
    TITLE="${TITLE} (Part ${i})"
  fi

  PAGE_NUM=$(printf "%02d" "$i")
  OUTPUT="${PAGES_DIR}/page-${PAGE_NUM}.md"

  DESCRIPTION="Learn about ${TOPIC_DESC} with the Acme API."
  INTRO="This guide covers ${TOPIC_DESC}. Follow the steps below to integrate this functionality into your application."

  sed \
    -e "s|{{TITLE}}|${TITLE}|g" \
    -e "s|{{SLUG}}|${SLUG}|g" \
    -e "s|{{DESCRIPTION}}|${DESCRIPTION}|g" \
    -e "s|{{INTRO}}|${INTRO}|g" \
    -e "s|{{TOPIC_LOWER}}|${TOPIC_DESC}|g" \
    -e "s|{{RESOURCE}}|${RESOURCE}|g" \
    -e "s|{{EXAMPLE_COMMENT}}|${EXAMPLE_COMMENT}|g" \
    "$TEMPLATE" > "$OUTPUT"

  GENERATED=$((GENERATED + 1))
done

echo "Generated ${GENERATED} fixture pages in ${PAGES_DIR}/"
