# CustomName Ruby Library

![](https://www.fernapi.com)

[![fern shield](https://img.shields.io/badge/%F0%9F%8C%BF-Built%20with%20Fern-brightgreen)](https://buildwithfern.com?utm_source=github&utm_medium=github&utm_campaign=readme&utm_source=Seed%2FRuby)

The CustomName Ruby library provides convenient access to the CustomName APIs from Ruby.

## Table of Contents

- [Documentation](#documentation)
- [Reference](#reference)
- [Base Readme Custom Section](#base-readme-custom-section)
- [Override Section](#override-section)
- [Generator Invocation Custom Section](#generator-invocation-custom-section)
- [Usage](#usage)
- [Environments](#environments)
- [Errors](#errors)
- [Advanced](#advanced)
  - [Retries](#retries)
  - [Timeouts](#timeouts)
  - [Additional Headers](#additional-headers)
  - [Additional Query Parameters](#additional-query-parameters)
  - [Additional Body Properties](#additional-body-properties)

## Documentation

API reference documentation is available [here](https://www.docs.fernapi.com).

## Reference

A full reference for this library is available [here](./reference.md).

## Base Readme Custom Section

Base Readme Custom Content for {{ packageName }}

## Override Section

Override Content

## Generator Invocation Custom Section

Generator Invocation Custom Content for {{ packageName }}

## Usage

Instantiate and use the client with the following:

```ruby
require "seed"

client = Seed::Client.new(token: "<token>")

client.service.create_big_entity(
  cast_member: {
    name: "name",
    id: "id"
  },
  extended_movie: {
    cast: %w[cast cast],
    id: "id",
    prequel: "prequel",
    title: "title",
    from: "from",
    rating: 1.1,
    type: "movie",
    tag: "tag",
    book: "book",
    metadata: {
      metadata: {
        key: "value"
      }
    },
    revenue: 1000000
  },
  entity: {
    type: "primitive",
    name: "name"
  },
  metadata: {},
  common_metadata: {
    id: "id",
    data: {
      data: "data"
    },
    json_string: "jsonString"
  },
  data: {},
  migration: {
    name: "name",
    status: "RUNNING"
  },
  test: {},
  node: {
    name: "name",
    nodes: [{
      name: "name",
      nodes: [{
        name: "name"
      }, {
        name: "name"
      }],
      trees: [{
        nodes: []
      }, {
        nodes: []
      }]
    }, {
      name: "name",
      nodes: [{
        name: "name"
      }, {
        name: "name"
      }],
      trees: [{
        nodes: []
      }, {
        nodes: []
      }]
    }],
    trees: [{
      nodes: [{
        name: "name",
        nodes: [],
        trees: []
      }, {
        name: "name",
        nodes: [],
        trees: []
      }]
    }, {
      nodes: [{
        name: "name",
        nodes: [],
        trees: []
      }, {
        name: "name",
        nodes: [],
        trees: []
      }]
    }]
  },
  directory: {
    name: "name",
    files: [{
      name: "name",
      contents: "contents"
    }, {
      name: "name",
      contents: "contents"
    }],
    directories: [{
      name: "name",
      files: [{
        name: "name",
        contents: "contents"
      }, {
        name: "name",
        contents: "contents"
      }],
      directories: [{
        name: "name"
      }, {
        name: "name"
      }]
    }, {
      name: "name",
      files: [{
        name: "name",
        contents: "contents"
      }, {
        name: "name",
        contents: "contents"
      }],
      directories: [{
        name: "name"
      }, {
        name: "name"
      }]
    }]
  },
  moment: {
    id: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    date: "2023-01-15",
    datetime: "2024-01-15T09:30:00Z"
  }
)
```

## Environments

This SDK allows you to configure different environments or custom URLs for API requests. You can either use the predefined environments or specify your own custom URL.
### Environments
```ruby
require "seed"

seed = Seed::Client.new(
    base_url: Seed::Environment::PRODUCTION
)
```

### Custom URL
```ruby
require "seed"

client = Seed::Client.new(
    base_url: "https://example.com"
)
```

## Errors

Failed API calls will raise errors that can be rescued from granularly.

```ruby
require "seed"

client = Seed::Client.new(
    base_url: "https://example.com"
)

begin
    result = client.service.create_big_entity
rescue Seed::Errors::TimeoutError
    puts "API didn't respond before our timeout elapsed"
rescue Seed::Errors::ServiceUnavailableError
    puts "API returned status 503, is probably overloaded, try again later"
rescue Seed::Errors::ServerError
    puts "API returned some other 5xx status, this is probably a bug"
rescue Seed::Errors::ResponseError => e
    puts "API returned an unexpected status other than 5xx: #{e.code} #{e.message}"
rescue Seed::Errors::ApiError => e
    puts "Some other error occurred when calling the API: #{e.message}"
end
```

## Advanced

### Retries

The SDK is instrumented with automatic retries. A request will be retried as long as the request is deemed
retryable and the number of retry attempts has not grown larger than the configured retry limit (default: 2).

A request is deemed retryable when any of the following HTTP status codes is returned:

- [408](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/408) (Timeout)
- [429](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429) (Too Many Requests)
- [5XX](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#server_error_responses) (Internal Server Error)

The `retryStatusCodes` configuration controls which [5XX](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#server_error_responses) status codes are retried:

- `legacy` (default): Retries `408`, `429`, `500`, `502`, `503`, `504`, `521`, `522`, `524`
- `recommended`: Retries `408`, `429`, `502`, `503`, `504` only (excludes `500 Internal Server Error` to avoid retrying non-idempotent failures)

Use the `max_retries` option to configure this behavior.

```ruby
require "seed"

client = Seed::Client.new(
    base_url: "https://example.com",
    max_retries: 3  # Configure max retries (default is 2)
)
```

### Timeouts

The SDK defaults to a 60 second timeout. Use the `timeout` option to configure this behavior.

```ruby
require "seed"

response = client.service.get_movie(
    ...,
    timeout: 30  # 30 second timeout
)
```

```ruby
require "seed"

response = client.service.create_movie(
    ...,
    timeout: 30  # 30 second timeout
)
```

### Additional Headers

If you would like to send additional headers as part of the request, use the `additional_headers` request option.

```ruby
require "seed"

response = client.service.create_big_entity(
    ...,
    request_options: {
        additional_headers: {
            "X-Custom-Header" => "custom-value"
        }
    }
)
```

### Additional Query Parameters

If you would like to send additional query parameters as part of the request, use the `additional_query_parameters` request option.

```ruby
require "seed"

response = client.service.create_big_entity(
    ...,
    request_options: {
        additional_query_parameters: {
            "custom_param" => "custom-value"
        }
    }
)
```

### Additional Body Properties

If you would like to send additional body properties as part of the request, use the `additional_body_parameters` request option.
Properties are merged into the serialized request body using their API (wire-format) names and override any field the SDK sets with the same name. If the endpoint has no body, one is created from these properties, except for GET and HEAD requests, which are always sent without a body (the properties are ignored).
This applies to JSON and form-urlencoded requests; it is not applied to multipart (file upload) requests.

```ruby
require "seed"

response = client.service.create_big_entity(
    ...,
    request_options: {
        additional_body_parameters: {
            "custom_field" => "custom-value"
        }
    }
)
```

