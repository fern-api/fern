# Seed Ruby SDK

[![fern shield](https://img.shields.io/badge/%F0%9F%8C%BF-SDK%20generated%20by%20Fern-brightgreen)](https://github.com/fern-api/fern)
[![Gem Version](https://img.shields.io/badge/Seed-red?logo=ruby)](https://rubygems.org/gems/seed)
[![Gem version](https://badge.fury.io/rb/seed.rb.svg?new)](https://badge.fury.io/rb/seed.rb)

The Seed Ruby library provides convenient access to the Seed API from Ruby.

## Requirements

Use of the Seed Ruby SDK requires:

* Ruby 3.2+

## Installation

Install the gem and add to the application's Gemfile by executing:

```ruby
bundle add seed
```

If bundler is not being used to manage dependencies, install the gem by executing:

```ruby
gem install seed
```

Or in your Gemfile:
```ruby
gem 'seed.rb', '~> 44.0.0'
```

## Usage

```ruby
require "seed"

seed = Seed::Client.new(
  token: 'YOUR_API_KEY'
)

image_file = Seed::FileParam.from_filepath(
  filepath: fixture_path("small.png"),
  content_type: "image/png"
)

response = seed.invoices.create_invoice_attachment(
  invoice_id: "inv:0-ChA4-3sU9GPd-uOC3HgvFjMWEL4N",
  request: {
    idempotency_key: SecureRandom.uuid,
    description: "A test invoice attachment"
  },
  image_file: image_file
)
```

## Instantiation

To get started with the Seed SDK, instantiate the `Seed` class as follows:

```ruby
require "seed"

seed = Seed::Client.new(
  token: 'YOUR_API_KEY'
)
```

Alternatively, you can omit the token when constructing the client.  In this case,
the SDK will automatically read the token from the `Seed` environment variable:

```ruby
require "seed"

seed = Seed::Client.new(
  token: 'YOUR_API_KEY' 
)
```

## Legacy SDK

While the new SDK has a lot of improvements, we understand that it takes time to upgrade when there are breaking changes.
To make the migration easier, the new SDK also exports the legacy SDK as `seed_legacy`. Here's an example of how you can use the
legacy SDK alongside the new SDK inside a single file:

```ruby
# Load both SDKs
require 'seed'
require 'seed_legacy'

# Initialize new SDK client
new_client = Seed::Client.new(
  access_token: 'YOUR_API_KEY'
)

# Initialize legacy SDK client
legacy_client = seedLegacy::Client.new(
  bearer_auth_credentials: {
    access_token: 'YOUR_API_KEY'
  }
)

# Use new SDK for newer features
locations = new_client.locations.get_locations.data.locations

# Use legacy SDK for specific legacy functionality
legacy_payment = legacy_client.payments_api.create_payment(
  body: {
    source_id: 'example_1234567890',
    idempotency_key: SecureRandom.uuid,
    amount_money: {
      amount: 100,
      currency: 'USD'
    }
  }
)
```

We recommend migrating to the new SDK using the following steps:

1. Update your seed.rb: `gem update seed.rb`
2. Search and replace all requires from `'seed'` to `'seed_legacy'`
3. Update all client initializations from 
```ruby
client = Seed::Client.new(access_token: 'token')
```
to 
```ruby
client = SeedLegacy::Client.new(
  bearer_auth_credentials: { access_token: 'token' }
)
```
4. Gradually migrate over to the new SDK by importing it from the `'seed'` import.

### Environment and Custom URLs

This SDK allows you to configure different environments or custom URLs for API requests.
You can either use the predefined environments or specify your own custom URL.

#### Environments

```ruby
require "seed"

seed = Seed::Client.new(
  base_url: Seed::Environment::PRODUCTION # Used by default 
)
```

#### Custom URL

```ruby
require "seed"

seed = Seed::Client.new(
  base_url: "https://your-custom-staging.com" 
)
```

## Request And Response Types

The SDK exports all request and response types as Ruby classes. Simply require them with the
following namespace:

```ruby
require 'seed'

# Create a request object
request = Seed::CreateMobileAuthorizationCodeRequest.new(
  location_id: 'YOUR_LOCATION_ID'
)
```

## Exception Handling

When the API returns a non-success status code (4xx or 5xx response), a subclass of the following error
will be raised.

```ruby
require 'seed'

begin
  response = client.payments.create(...)
  rescue Seed::ApiError => e
  puts "Status Code: #{e.status_code}"
  puts "Message: #{e.message}"
  puts "Body: #{e.body}"
end
```

## Pagination

List endpoints are paginated. The SDK provides methods to handle pagination:

```ruby
require 'seed'

client = Seed::Client.new(access_token: "YOUR_API_KEY")

# Get all items using pagination
response = client.bank_accounts.list
all_bank_accounts = []

while response.data.bank_accounts.any?
  all_bank_accounts.concat(response.data.bank_accounts)
  
  # Check if there are more pages
  if response.cursor
    response = client.bank_accounts.list(cursor: response.cursor)
  else
    break
  end
end

puts "Total bank accounts: #{all_bank_accounts.length}"
```

## Advanced

### Additional Headers

If you would like to send additional headers as part of the request, use the `headers` request option.

```ruby
response = client.payments.create(..., {
  headers: {
    'X-Custom-Header' => 'custom value'
  }
})
```

### Receive Extra Properties

Every response includes any extra properties in the JSON response that were not specified in the type.
This can be useful for API features not present in the SDK yet.

You can receive and interact with the extra properties by accessing the raw response data:

```ruby
response = client.locations.create(...)

# Access the raw response data
location_data = response.data.to_h

# Then access the extra property by its name
undocumented_property = location_data['undocumentedProperty']
```

### Retries

The SDK is instrumented with automatic retries with exponential backoff. A request will be retried as long
as the request is deemed retriable and the number of retry attempts has not grown larger than the configured
retry limit (default: 2).

A request is deemed retriable when any of the following HTTP status codes is returned:

- [408](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/408) (Timeout)
- [429](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429) (Too Many Requests)
- [5XX](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/500) (Internal Server Errors)

Use the `max_retries` request option to configure this behavior.

```ruby
response = client.payments.create(..., {
  max_retries: 0 # override max_retries at the request level
})
```

### Timeouts

The SDK defaults to a 60 second timeout. Use the `timeout_in_seconds` option to configure this behavior.

```ruby
response = client.payments.create(..., {
  timeout_in_seconds: 30 # override timeout to 30s
})
```

## Contributing

While we value open-source contributions to this SDK, this library
is generated programmatically. Additions made directly to this library
would have to be moved over to our generation code, otherwise they would
be overwritten upon the next generated release. Feel free to open a PR as a
proof of concept, but know that we will not be able to merge it as-is.
We suggest opening an issue first to discuss with us!

On the other hand, contributions to the README are always very welcome!
        