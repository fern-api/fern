# Seed Ruby Library

[![fern shield](https://img.shields.io/badge/%F0%9F%8C%BF-Built%20with%20Fern-brightgreen)](https://buildwithfern.com?utm_source=github&utm_medium=github&utm_campaign=readme&utm_source=Seed%2FRuby)

The Seed Ruby library provides convenient access to the Seed APIs from Ruby.

## Reference

A full reference for this library is available [here](./reference.md).

## Usage

Instantiate and use the client with the following:

```ruby
require "seed"

client = seed::Client.new(token: '<token>');

client.users.list_usernames_custom({
  startingAfter:'starting_after'
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

## Pagination

List endpoints are paginated. The SDK provides an iterator so that you can simply loop over the items. You can also iterate page-by-page.

```ruby
require "seed"

# Loop over the items using the provided iterator.
    page = Seed.client.users.list_usernames_custom(
    ...
)
page.each do |item|
    puts "Got item: #{item}"
end

# Alternatively, iterate page-by-page.
current_page = page
while current_page
    current_page.results.each do |item|
        puts "Got item: #{item}"
    end
    current_page = current_page.next_page
    break if current_page.nil?
end
```

## Errors

Failed API calls will raise errors that can be rescued from granularly.

```ruby
require "seed"

client = Seed::Client.new(
    base_url: "https://example.com"
)

begin
    result = client.users.list_usernames_custom
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

response = client.users.list_usernames_custom(
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