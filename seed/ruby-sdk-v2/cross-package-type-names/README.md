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

client.foo.find({
  optionalString:'optionalString',
  publicProperty:'publicProperty',
  privateProperty:1
});
```

## Environments

This SDK allows you to configure different custom URLs for API requests. You can specify your own custom URL.

### Custom URL
```ruby
require "seed"

client = Seed::Client.new(
    base_url: "https://example.com"
)
```

## Errors

Structured error types are returned from API calls that return non-success status codes. These errors are compatible
with the Ruby Core API, so you can access the error like so:

```ruby
require "seed"

response = client.Foo.Find(...)
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
require "seed"

# Specify default options applied on every request.
client = Seed.new(
    token: "<YOUR_API_KEY>",
    http_client: HTTP::Client.new(
        timeout: 5
    )
)

# Specify options for an individual request.
response = client.Foo.Find(
    ...,
    token: "<YOUR_API_KEY>"
)
```

## Advanced

### Timeouts

The SDK defaults to a 60 second timeout. Use the `timeout` option to configure this behavior.

```ruby
require "seed"

response = client.Foo.Find(
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