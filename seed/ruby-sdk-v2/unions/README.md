# Seed Ruby SDK

[![fern shield](https://img.shields.io/badge/%F0%9F%8C%BF-SDK%20generated%20by%20Fern-brightgreen)](https://github.com/fern-api/fern)
[![Gem Version](https://img.shields.io/badge/Seed-red?logo=ruby)](https://rubygems.org/gems/seed)

## Installation

Install the gem and add to the application's Gemfile by executing:

```
bundle add seed
```

If bundler is not being used to manage dependencies, install the gem by executing:

```
gem install seed
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

## Contributing

While we value open-source contributions to this SDK, this library
is generated programmatically. Additions made directly to this library
would have to be moved over to our generation code, otherwise they would
be overwritten upon the next generated release. Feel free to open a PR as a
proof of concept, but know that we will not be able to merge it as-is.
We suggest opening an issue first to discuss with us!

On the other hand, contributions to the README are always very welcome!
        