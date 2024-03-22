# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

## [0.3.3] - 2024-03-22

- Improvement: Remove cli dependency on generator-exec-sdk and use shared logic for generator config parsing and cli debug logging.

## [0.3.2] - 2024-03-18

- Improvement: type bytes requests to also take in IO types, indicating to users that they may pass in a stream of bytes

## [0.3.1] - 2024-03-12

- Fix: use strings instead of UUIDs, which are helper classes in Ruby

## [0.3.0] - 2024-02-27

- Fix: Ensure the name passed into the 'X-Fern-SDK-Name' header is the name of the gem, not the client class

- Fix: If an envvar is specified as a fallback for an auth header, the SDK will now mark that parameter as optional to allow fallback to actually happen

- Fix: Generated yardoc now appropriately reflects the typehint of the value type in maps

## [0.2.0] - 2024-02-20

- Improvement: Ruby enum construct now leverages class constants instead of hashes to support better autocomplete
  For example, previously enums would be constructed as:

  ```ruby
  # operand.rb
  module SeedEnumClient
    OPERAND = { greater_than: ">", equal_to: "=", less_than: "less_than" }.freeze
  end

  # main.rb
  ...
  SeedEnum::OPERAND[:equal_to]
  ```

  and are now constructed as:

  ```ruby
  # operand.rb
  module SeedEnumClient
    # Tests enum name and value can be
    # different.
    class Operand
      GREATER_THAN = ">"
      EQUAL_TO = "="
      LESS_THAN = "less_than"
    end
  end

  # main.rb
  ...
  SeedEnum::Operand::EQUAL_TO
  ```

- Improvement: Discriminated unions are no longer wrapped within a parent object, rather, any field or parameter that depends on a discriminated union now explicitly references the member types in support of better autocomplete.

- Improvement: Undiscriminated unions are no longer allowed as hashes as input to SDK functions, this is in support of better autocomplete as well.

- Feature: The generated Ruby SDKs now support idempotency headers, users may specify idempotency headers within the RequestOptions object:

  ```ruby
  imdb = Imdb::Client(api_key: "...")

  request_options = IdempotencyRequestOptions.new(
    idempotency_key: "key",
    idempotency_expiration: 60
  )

  resp = imbd.ticket.purchase(id: "", request_options: request_options)
  ```

## [0.1.1] - 2024-02-15

- Fix: ensure the Ruby generators do not have strict dependencies on the IR. The generators have been updated to allow non breaking changes for the IR and the Fern CLI to happen without issue.

## [0.1.0-rc0] - 2024-02-12

- Improvement: loosen the Faraday dependencies within the generated SDKs, now we are supporting Faraday 1.x, while continuing to support the same upperbound (specifically supporting the latest major version as well).
- Release a minor version as the Ruby generator is now being used in beta!

## [0.0.6] - 2024-02-09

- Improvement: license files are now specified within the gem config if they are provided

```
generators:
  - name: fernapi/fern-ruby-sdk
    version: 0.0.6
    github:
      repository: org/repo-name
      mode: pull-request
      license: MIT
```

- Improvement: we now create a Github workflow file for publishing the gem automatically, in the presence of a publishing configuration

```
generators:
  - name:
     output:  # <-- Publishing configuration
       location: rubygems
       api-key: ${API_KEY}
       package-name: "petstore"
```

## [0.0.5] - 2024-02-06

- This release contains no changes to the API.

- Bug fixes:
  - Syntactic error in block parameter usage: we now ensure block parameters are the final parameter for functions
  - Add properties to subpackages: previously properties on subpackages were not being exposed
  - Ensure optional properties in from_json are only parsed if present

## [0.0.4] - 2024-02-05

- This release contains no changes to the API.

- Bug fixes: ensures files are written at the gem name path over client name, and addresses string escaping on one of the Fern headers.

## [0.0.3] - 2024-02-05

- This release contains no changes to the API.

- Bug fixes: addresses a number of typos and other issues previously contained within the generation code.

## [0.0.2] - 2024-02-01

- Improvement: Consolidate imports into the main file for easier gem usage, as opposed to directly importing the specific file (e.g. `require "fern" vs. require "fern/types/folder_a/object"`)

- Improvement: Added `rubygems` output block to generators.yml. To publish your ruby gem, setup your generators.ym like this:

```yaml
# generators.yml

groups:
 - name: ...
    version: ...
    output:
       location: rubygems
       api-key: ${API_KEY}
       package-name: "petstore"
```

## [0.0.1] - 2024-02-01

- Improvement: Support client generation (async and async) as well as most endpoint types (except streaming)

## [0.0.0] - 2024-01-30

- Chore: Intialize this changelog
