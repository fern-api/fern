# Seed Ruby Library

[![fern shield](https://img.shields.io/badge/%F0%9F%8C%BF-Built%20with%20Fern-brightgreen)](https://buildwithfern.com?utm_source=github&utm_medium=github&utm_campaign=readme&utm_source=Seed%2FRuby)

The Seed Ruby library provides convenient access to the Seed APIs from Ruby.

## Reference

A full reference for this library is available [here](./reference.md).

## Usage

Instantiate and use the client with the following:

```ruby
require "seed"

client = seed::Client.new();

client.search({
  limit:1,
  id:'id',
  date:'date',
  deadline:'2024-01-15T09:30:00Z',
  bytes:'bytes',
  user:{
    name:'name',
    tags:['tags', 'tags']
  },
  optionalDeadline:'2024-01-15T09:30:00Z',
  keyValue:{
    keyValue:'keyValue'
  },
  optionalString:'optionalString',
  nestedUser:{
    name:'name',
    user:{
      name:'name',
      tags:['tags', 'tags']
    }
  },
  optionalUser:{
    name:'name',
    tags:['tags', 'tags']
  }
});
```

## Environments

You can choose between different environments by using the `base_url` option. You can configure any arbitrary base
URL, which is particularly useful in test environments.

```ruby
require "client"

client = client::Client.new(
    base_url: "https://example.com"
)
```

## Errors

Structured error types are returned from API calls that return non-success status codes. These errors are compatible
with the Ruby Core API, so you can access the error like so:

```ruby
require "client"

response = client.Search(...)
rescue => error
if error.is_a?(Core::APIError)
    # Do something with the API error ...
end
raise error
end
```

## Request Options

A variety of request options are included to adapt the behavior of the library, which includes configuring
authorization tokens, or providing your own instrumented `HTTP::Client`.

These request options can either be specified on the client so that they're applied on every request, 
or for an individual request, like so:

```ruby
require "client"

# Specify default options applied on every request.
client = client.new(
    token: "<YOUR_API_KEY>",
    http_client: HTTP::Client.new(
        timeout: 5
    )
)

# Specify options for an individual request.
response = client.Search(
    ...,
    token: "<YOUR_API_KEY>"
)
```

## Advanced

### Response Headers

You can access the raw HTTP response data by using the `WithRawResponse` field on the client. This is useful
when you need to examine the response headers received from the API call.

```ruby
require "client"

response = client.WithRawResponse.Search(...)
rescue => error
    raise error
end

puts "Got response headers: #{response.headers}"
```

### Retries

The SDK is instrumented with automatic retries with exponential backoff. A request will be retried as long
as the request is deemed retryable and the number of retry attempts has not grown larger than the configured
retry limit (default: 2).

A request is deemed retryable when any of the following HTTP status codes is returned:

- [408](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/408) (Timeout)
- [429](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429) (Too Many Requests)
- [5XX](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/500) (Internal Server Errors)

Use the `max_retries` option to configure this behavior for the entire client or an individual request:

```ruby
require "client"

client = client.new(
    max_retries: 1
)

response = client.foo.find(
    ...,
    max_retries: 1
)
```

### Timeouts

The SDK defaults to a 60 second timeout. Use the `timeout` option to configure this behavior.

```ruby
require "client"

response = client.Search(
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