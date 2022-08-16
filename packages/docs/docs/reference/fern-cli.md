---
sidebar_position: 9
title: Fern CLI
---

## Commands

<!-- commands -->

- [`matano autocomplete [SHELL]`](#matano-autocomplete-shell)
- [`matano bootstrap`](#matano-bootstrap)
- [`matano deploy`](#matano-deploy)
- [`matano generate:matano-dir DIRECTORY-NAME`](#matano-generatematano-dir-directory-name)
- [`matano help [COMMAND]`](#matano-help-command)
- [`matano refresh-context`](#matano-refresh-context)

## `matano autocomplete [SHELL]`

display autocomplete installation instructions

```
USAGE
  $ matano autocomplete [SHELL] [-r]

ARGUMENTS
  SHELL  shell type

FLAGS
  -r, --refresh-cache  Refresh cache (ignores displaying instructions)

DESCRIPTION
  display autocomplete installation instructions

EXAMPLES
  $ matano autocomplete

  $ matano autocomplete bash

  $ matano autocomplete zsh

  $ matano autocomplete --refresh-cache
```

_See code: [@oclif/plugin-autocomplete](https://github.com/oclif/plugin-autocomplete/blob/v1.3.0/src/commands/autocomplete/index.ts)_

## `matano bootstrap`

Creates initial resources for Matano deployment.

```
USAGE
  $ matano bootstrap [-p <value>] [--user-directory <value>]

FLAGS
  -p, --profile=<value>     AWS Profile to use for credentials.
  --user-directory=<value>  Matano user directory to use.

DESCRIPTION
  Creates initial resources for Matano deployment.

EXAMPLES
  $ matano bootstrap

  $ matano bootstrap --profile prod

  $ matano bootstrap --profile prod --user-directory my-matano-directory
```

_See code: [dist/commands/bootstrap.ts](https://github.com/matanolabs/matano/blob/main/cli/src/commands/bootstrap.ts)_

## `matano deploy`

Deploys matano.

```
USAGE
  $ matano deploy [-p <value>] [-a <value>] [-r <value>] [--user-directory <value>]

FLAGS
  -a, --account=<value>     AWS Account to deploy to.
  -p, --profile=<value>     AWS Profile to use for credentials.
  -r, --region=<value>      AWS Region to deploy to.
  --user-directory=<value>  Matano user directory to use.

DESCRIPTION
  Deploys matano.

EXAMPLES
  $ matano deploy

  $ matano deploy --profile prod

  $ matano deploy --profile prod --user-directory matano-directory

  $ matano deploy --profile prod --region eu-central-1 --account 12345678901
```

_See code: [dist/commands/deploy.ts](https://github.com/matanolabs/matano/blob/main/cli/src/commands/deploy.ts)_

## `matano generate:matano-dir DIRECTORY-NAME`

Generates a sample Matano directory to get started.

```
USAGE
  $ matano generate:matano-dir [DIRECTORY-NAME]

ARGUMENTS
  DIRECTORY-NAME  The name of the directory to create

DESCRIPTION
  Generates a sample Matano directory to get started.

EXAMPLES
  $ matano generate:matano-dir
```

_See code: [dist/commands/generate/matano-dir.ts](https://github.com/matanolabs/matano/blob/main/cli/src/commands/generate/matano-dir.ts)_

## `matano help [COMMAND]`

Display help for matano.

```
USAGE
  $ matano help [COMMAND] [-n]

ARGUMENTS
  COMMAND  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for matano.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.1.12/src/commands/help.ts)_

## `matano refresh-context`

Refreshes Matano context.

```
USAGE
  $ matano refresh-context [-p <value>] [-a <value>] [-r <value>] [--user-directory <value>]

FLAGS
  -a, --account=<value>     AWS Account to deploy to.
  -p, --profile=<value>     AWS Profile to use for credentials.
  -r, --region=<value>      AWS Region to deploy to.
  --user-directory=<value>  Matano user directory to use.

DESCRIPTION
  Refreshes Matano context.

EXAMPLES
  $ matano refresh-context

  $ matano refresh-context --profile prod

  $ matano refresh-context --profile prod --user-directory my-matano-directory

  $ matano refresh-context --profile prod --region eu-central-1 --account 12345678901
```

_See code: [dist/commands/refresh-context.ts](https://github.com/matanolabs/matano/blob/main/cli/src/commands/refresh-context.ts)_

<!-- commandsstop -->
