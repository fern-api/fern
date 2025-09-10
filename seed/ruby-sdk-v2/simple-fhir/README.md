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

client.get_account();
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

response = client.GetAccount(...)
rescue => error
if error.is_a?(Core::APIError)
    # Do something with the API error ...
end
raise error
end
```

## Advanced

### Timeouts

The SDK defaults to a 60 second timeout. Use the `timeout` option to configure this behavior.

```ruby
require "seed"

response = client.GetAccount(
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