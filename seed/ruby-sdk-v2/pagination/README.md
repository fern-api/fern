# Seed Ruby Library

[![fern shield](https://img.shields.io/badge/%F0%9F%8C%BF-Built%20with%20Fern-brightgreen)](https://buildwithfern.com?utm_source=github&utm_medium=github&utm_campaign=readme&utm_source=Seed%2FRuby)

The Seed Ruby library provides convenient access to the Seed APIs from Ruby.

## Table of Contents

- [Reference](#reference)
- [Usage](#usage)
- [Environments](#environments)
- [Pagination](#pagination)
- [Errors](#errors)
- [Advanced](#advanced)
  - [Retries](#retries)
  - [Timeouts](#timeouts)
  - [Additional Headers](#additional-headers)
  - [Additional Query Parameters](#additional-query-parameters)
- [Contributing](#contributing)

## Reference

A full reference for this library is available [here](./reference.md).

## Usage

Instantiate and use the client with the following:

```ruby
require "seed"

client = Seed::Client.new(token: '<token>');

client.complex.search(
  index: 'index',
  pagination: {
    per_page: 1,
    starting_after: 'starting_after'
  },
  query: {
    field: 'field',
    operator: '=',
    value: 'value'
  }
);
```

## Environments

This SDK allows you to configure different custom URLs for API requests. You can specify your own custom URL.

### Custom URL
```ruby
require "fern_pagination"

client = FernPagination::Client.new(
    base_url: "https://example.com"
)
```

## Pagination

List endpoints are paginated. The SDK provides an iterator so that you can simply loop over the items. You can also iterate page-by-page.

```ruby
require "fern_pagination"

# Loop over the items using the provided iterator.
    page = FernPagination.client.complex.search(
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
require "fern_pagination"

client = FernPagination::Client.new(
    base_url: "https://example.com"
)

begin
    result = client.complex.search
rescue FernPagination::Errors::TimeoutError
    puts "API didn't respond before our timeout elapsed"
rescue FernPagination::Errors::ServiceUnavailableError
    puts "API returned status 503, is probably overloaded, try again later"
rescue FernPagination::Errors::ServerError
    puts "API returned some other 5xx status, this is probably a bug"
rescue FernPagination::Errors::ResponseError => e
    puts "API returned an unexpected status other than 5xx: #{e.code} #{e.message}"
rescue FernPagination::Errors::ApiError => e
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
- [5XX](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/500) (Internal Server Errors)

Use the `max_retries` option to configure this behavior.

```ruby
require "fern_pagination"

client = FernPagination::Client.new(
    base_url: "https://example.com",
    max_retries: 3  # Configure max retries (default is 2)
)
```

### Timeouts

The SDK defaults to a 60 second timeout. Use the `timeout` option to configure this behavior.

```ruby
require "fern_pagination"

response = client.complex.search(
    ...,
    timeout: 30  # 30 second timeout
)
```

### Additional Headers

If you would like to send additional headers as part of the request, use the `additional_headers` request option.

```ruby
require "fern_pagination"

response = client.complex.search(
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
require "fern_pagination"

response = client.complex.search(
    ...,
    request_options: {
        additional_query_parameters: {
            "custom_param" => "custom-value"
        }
    }
)
```

## Contributing

While we value open-source contributions to this SDK, this library is generated programmatically.
Additions made directly to this library would have to be moved over to our generation code,
otherwise they would be overwritten upon the next generated release. Feel free to open a PR as
a proof of concept, but know that we will not be able to merge it as-is. We suggest opening
an issue first to discuss with us!

On the other hand, contributions to the README are always very welcome!