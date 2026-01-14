#!/usr/bin/env node

/**
 * Generate carapace auto-completion specification for Fern CLI
 *
 * Usage:
 *   node generate-carapace-completion.js > fern.yaml
 *
 * The output can be used with carapace:
 *   carapace --spec fern.yaml
 */

const fs = require("fs");
const path = require("path");

// Import the completion generator (compiled from TypeScript)
const completionPath = path.join(__dirname, "../dist/src/carapace-completion.js");

if (!fs.existsSync(completionPath)) {
    console.error('Error: Carapace completion module not found. Please run "pnpm compile" first.');
    process.exit(1);
}

try {
    const { generateCarapaceYAML } = require(completionPath);
    console.log(generateCarapaceYAML());
} catch (error) {
    // Fallback: generate minimal spec if the module fails to load
    console.error("Warning: Failed to load completion module, generating minimal spec:", error.message);

    const minimalSpec = `
name: fern
description: Fern CLI - API-first development platform
flags:
  log-level:
    description: Set the logging level
    completion:
      action: values
      values: [debug, info, warn, error]
  version:
    description: Print current version
    type: boolean
  v:
    description: Print current version (alias)
    type: boolean
commands:
  init:
    name: init
    description: Initialize a Fern API
    flags:
      api:
        description: Initialize an API
        type: boolean
      docs:
        description: Initialize a docs website
        type: boolean
      organization:
        description: Organization name
        type: string
  generate:
    name: generate
    description: Generate all generators in the specified group
    flags:
      api:
        description: Specify API name
        type: string
      docs:
        description: Specify docs name
        type: string
      group:
        description: The group to generate
        type: string
      local:
        description: Run generators locally using Docker
        type: boolean
  check:
    name: check
    description: Validates your Fern Definition
    flags:
      api:
        description: Only run on the provided API
        type: string
  format:
    name: format
    description: Formats your Fern Definition
    flags:
      api:
        description: Only run on the provided API
        type: string
  login:
    name: login
    description: Log in to Fern via GitHub
  logout:
    name: logout
    description: Log out of Fern
`.trim();

    console.log(minimalSpec);
}
