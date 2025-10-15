# Claude instructions

The goal of this project is to update the way that local generation of a typescript sdk works so that its output matches the output of remote generation.

We've set up a test environment such that we already have the target we need to compare this against. that environment is here: /home/vscode/.frond/config-repos/anduril

We've already run remote generation, and the output is at this repo:
<https://github.com/fern-api/lattice-sdk-javascript/>
On this branch: fern-bot/2025-10-12T20-40Z
There's a local copy of this repo here:
/Users/jsklan/.frond/sdks/anduril/published/lattice-sdk-javascript
that you can use to fetch branches and run git diff operations between branches.

We've also run local generation already to show what our starting point is.
That output is available on the same repo, on branch: fern-bot/2025-10-12_20-47-52

Essentially, your goal will be to make changes to the typescript generator, whose source code is found at this path: /home/vscode/git/fern/generators/typescript

Once you've made changes, the way you will test them is by running the following commands in this order. Several of these commands are only required if you've made edits outside of the generator in the fern cli within packages/cli.

- cd /home/vscode/git/fern
- pnpm install
- pnpm compile --filter="!@fern-api/typescript-mcp-server"
- pnpm fern:build
  - Only required if Fern CLI Edits were made
- frond generator ts-sdk 99.99.99
- cd /home/vscode/.frond/config-repos/anduril
- export FERN_TOKEN=$ANDURIL_FERN_TOKEN
- export GITHUB_TOKEN=$MY_GITHUB_TOKEN
- fern generate --log-level debug --local --group ts-sdk-local
  - If Fern CLI edits were made, use fernlocal instead of fern.

This will create a new branch and a pull request in the remote repo fern-api/lattice-sdk-javascript
You'll be able to find this branch by running git fetch on our local copy of the repo and finding the branch with the most recent timestamp in its name.
The goal will be for this new branch, to match the original remote generation branch fern-bot/2025-10-12T20-40Z exactly.

One thing you'll notice at first is that the LICENSE file will be missing. In order for it to show up, you'll need to fix the generator so that when lines 160 and 161 of /home/vscode/.frond/config-repos/anduril/fern/generators.yml are no longer commented out, it succeeds. They are commented out for now because including them causes generation to fail.

Another helpful thing is that when you run the fern generate... command, the logs will point to various files that can help you debug. Here are some examples of what those log lines will look like:

- DEBUG 2025-10-12T20:47:06.054Z [api]: fernapi/fern-typescript-sdk Wrote IR to /tmp/fern-22078-fauraaoTt7ym/ir.json
- DEBUG 2025-10-12T20:47:06.056Z [api]: fernapi/fern-typescript-sdk Will write config.json to: /tmp/fern-22078-fauraaoTt7ym/config.json
- INFO  2025-10-12T20:47:06.069Z [api]: fernapi/fern-typescript-sdk Executing generator fernapi/fern-typescript-sdk using Docker image: fernapi/fern-typescript-sdk:3.7.2
- INFO  2025-10-12T20:47:57.826Z [api]: fernapi/fern-typescript-sdk Generator logs here: /tmp/tmp-22078-2P8RkJb9DBu9

Another helpful thing is that you can find the remote server code for the remote generation code path here:
/Users/jsklan/git/fiddle


## Important Development Guidelines

### Logging Rules

**NEVER use `console.log`, `console.warn`, `console.error`, or any other console methods in generator code.** This project uses proper logging infrastructure to ensure logs appear in the correct output streams and can be captured by the CLI.

Instead, always use the logger provided by the generator context:

- In generators: Use `generatorContext.logger` (available as a parameter in most generator methods)
- In CLI classes: Use the `logger` parameter passed to methods like `parseCustomConfig`
- Available methods: `logger.debug()`, `logger.info()`, `logger.warn()`, `logger.error()`

**Why this matters:** Console methods don't integrate with Fern's logging infrastructure, so their output may be lost or not appear where expected. Using the proper logger ensures your debug information and warnings will be visible in the generation output and can help with debugging issues.
