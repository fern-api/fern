# Seed Ruby Library

[![fern shield](https://img.shields.io/badge/%F0%9F%8C%BF-Built%20with%20Fern-brightgreen)](https://buildwithfern.com?utm_source=github&utm_medium=github&utm_campaign=readme&utm_source=Seed%2FRuby)

The Seed Ruby library provides convenient access to the Seed APIs from Ruby.

## Reference

A full reference for this library is available [here](./reference.md).

## Usage

Instantiate and use the client with the following:

```ruby
require "seed"

client = Seed::Client.new();

client.service.just_file();
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

Failed API calls will raise errors that can be rescued from granularly.

```ruby
require "seed"

client = Seed::Client.new(
    base_url: "https://example.com"
)

begin
    result = client.service.just_file
rescue Seed::Errors::TimeoutError
    puts "API didn't respond before our timeout elapsed"
rescue Seed::Errors::ServiceUnavailableError
    puts "API returned status 503, is probably overloaded, try again later"
rescue Seed::Errors::ServerError
    puts "API returned some other 5xx status, this is probably a bug"
rescue Seed::Errors::ResponseError => e
    puts "API returned an unexpected status other than 5xx: #{e.code} {e.message}"
rescue Seed::Errors::ApiError => e
    puts "Some other error occurred when calling the API: {e.message}"
end
```

## Advanced

### Timeouts

The SDK defaults to a 60 second timeout. Use the `timeout` option to configure this behavior.

```ruby
require "seed"

response = client.service.just_file(
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