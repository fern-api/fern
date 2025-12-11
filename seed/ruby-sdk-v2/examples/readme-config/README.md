# Seed Ruby Library

![](https://www.fernapi.com)

[![fern shield](https://img.shields.io/badge/%F0%9F%8C%BF-Built%20with%20Fern-brightgreen)](https://buildwithfern.com?utm_source=github&utm_medium=github&utm_campaign=readme&utm_source=Seed%2FRuby)

The Seed Ruby library provides convenient access to the Seed APIs from Ruby.

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
  - [Timeouts](#timeouts)
- [Contributing](#contributing)

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

client = Seed::Client.new(token: '<token>');

client.service.create_big_entity(
  cast_member: {
    name: 'name',
    id: 'id'
  },
  extended_movie: {
    cast: ['cast', 'cast'],
    id: 'id',
    prequel: 'prequel',
    title: 'title',
    from: 'from',
    rating: 1.1,
    type: 'movie',
    tag: 'tag',
    book: 'book',
    metadata: {},
    revenue: 1000000
  },
  entity: {
    type: 'primitive',
    name: 'name'
  },
  metadata: {},
  common_metadata: {
    id: 'id',
    data: {
      data: 'data'
    },
    json_string: 'jsonString'
  },
  data: {},
  migration: {
    name: 'name',
    status: 'RUNNING'
  },
  test: {},
  node: {
    name: 'name',
    nodes: [{
      name: 'name',
      nodes: [{
        name: 'name',
        nodes: [],
        trees: []
      }, {
        name: 'name',
        nodes: [],
        trees: []
      }],
      trees: [{
        nodes: []
      }, {
        nodes: []
      }]
    }, {
      name: 'name',
      nodes: [{
        name: 'name',
        nodes: [],
        trees: []
      }, {
        name: 'name',
        nodes: [],
        trees: []
      }],
      trees: [{
        nodes: []
      }, {
        nodes: []
      }]
    }],
    trees: [{
      nodes: [{
        name: 'name',
        nodes: [],
        trees: []
      }, {
        name: 'name',
        nodes: [],
        trees: []
      }]
    }, {
      nodes: [{
        name: 'name',
        nodes: [],
        trees: []
      }, {
        name: 'name',
        nodes: [],
        trees: []
      }]
    }]
  },
  directory: {
    name: 'name',
    files: [{
      name: 'name',
      contents: 'contents'
    }, {
      name: 'name',
      contents: 'contents'
    }],
    directories: [{
      name: 'name',
      files: [{
        name: 'name',
        contents: 'contents'
      }, {
        name: 'name',
        contents: 'contents'
      }],
      directories: [{
        name: 'name',
        files: [],
        directories: []
      }, {
        name: 'name',
        files: [],
        directories: []
      }]
    }, {
      name: 'name',
      files: [{
        name: 'name',
        contents: 'contents'
      }, {
        name: 'name',
        contents: 'contents'
      }],
      directories: [{
        name: 'name',
        files: [],
        directories: []
      }, {
        name: 'name',
        files: [],
        directories: []
      }]
    }]
  },
  moment: {
    id: 'd5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32',
    date: '2023-01-15',
    datetime: '2024-01-15T09:30:00Z'
  }
);
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

## Contributing

While we value open-source contributions to this SDK, this library is generated programmatically.
Additions made directly to this library would have to be moved over to our generation code,
otherwise they would be overwritten upon the next generated release. Feel free to open a PR as
a proof of concept, but know that we will not be able to merge it as-is. We suggest opening
an issue first to discuss with us!

On the other hand, contributions to the README are always very welcome!