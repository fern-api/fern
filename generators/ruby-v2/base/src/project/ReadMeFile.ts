import { AbstractRubyGeneratorContext } from "../context/AbstractRubyGeneratorContext";

export declare namespace ReadmeFile {
    interface Args {
        context: AbstractRubyGeneratorContext<object>;
    }
}

export class ReadmeFile {
    private context: AbstractRubyGeneratorContext<object>;

    constructor({ context }: ReadmeFile.Args) {
        this.context = context;
    }

    public async toString(): Promise<string> {
        const moduleFolderName = this.context.getRootFolderName();
        const moduleName = this.context.getRootModule().name;
        const markdownOpenCodeSnippet = "\`\`\`ruby";
        const markdownCloseCodeSnippet = "\`\`\`";
        const markdownHighlight = "\`";

        return `# ${moduleName} Ruby SDK

[![fern shield](https://img.shields.io/badge/%F0%9F%8C%BF-SDK%20generated%20by%20Fern-brightgreen)](https://github.com/fern-api/fern)
[![Gem Version](https://img.shields.io/badge/${moduleName}-red?logo=ruby)](https://rubygems.org/gems/${moduleFolderName})
[![Gem version](https://badge.fury.io/rb/${moduleFolderName}.rb.svg?new)](https://badge.fury.io/rb/${moduleFolderName}.rb)

The ${moduleName} Ruby library provides convenient access to the ${moduleName} API from Ruby.

## Requirements

Use of the ${moduleName} Ruby SDK requires:

* Ruby 3.2+

## Installation

Install the gem and add to the application's Gemfile by executing:

${markdownOpenCodeSnippet}
bundle add ${moduleFolderName}
${markdownCloseCodeSnippet}

If bundler is not being used to manage dependencies, install the gem by executing:

${markdownOpenCodeSnippet}
gem install ${moduleFolderName}
${markdownCloseCodeSnippet}

Or in your Gemfile:
${markdownOpenCodeSnippet}
gem '${moduleFolderName}.rb', '~> 44.0.0'
${markdownCloseCodeSnippet}

## Usage

${markdownOpenCodeSnippet}
require "${moduleFolderName}"

${moduleFolderName} = ${moduleName}::Client.new(
  token: 'YOUR_API_KEY'
)

image_file = ${moduleName}::FileParam.from_filepath(
  filepath: fixture_path("small.png"),
  content_type: "image/png"
)

response = ${moduleFolderName}.invoices.create_invoice_attachment(
  invoice_id: "inv:0-ChA4-3sU9GPd-uOC3HgvFjMWEL4N",
  request: {
    idempotency_key: SecureRandom.uuid,
    description: "A test invoice attachment"
  },
  image_file: image_file
)
${markdownCloseCodeSnippet}

## Instantiation

To get started with the ${moduleName} SDK, instantiate the ${markdownHighlight}${moduleName}${markdownHighlight} class as follows:

${markdownOpenCodeSnippet}
require "${moduleFolderName}"

${moduleFolderName} = ${moduleName}::Client.new(
  token: 'YOUR_API_KEY'
)
${markdownCloseCodeSnippet}

Alternatively, you can omit the token when constructing the client.  In this case,
the SDK will automatically read the token from the ${markdownHighlight}${moduleName}${markdownHighlight} environment variable:

${markdownOpenCodeSnippet}
require "${moduleFolderName}"

${moduleFolderName} = ${moduleName}::Client.new(
  token: 'YOUR_API_KEY' 
)
${markdownCloseCodeSnippet}

## Legacy SDK

While the new SDK has a lot of improvements, we understand that it takes time to upgrade when there are breaking changes.
To make the migration easier, the new SDK also exports the legacy SDK as ${markdownHighlight}${moduleFolderName}_legacy${markdownHighlight}. Here's an example of how you can use the
legacy SDK alongside the new SDK inside a single file:

${markdownOpenCodeSnippet}
# Load both SDKs
require '${moduleFolderName}'
require '${moduleFolderName}_legacy'

# Initialize new SDK client
new_client = ${moduleName}::Client.new(
  access_token: 'YOUR_API_KEY'
)

# Initialize legacy SDK client
legacy_client = ${moduleFolderName}Legacy::Client.new(
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
${markdownCloseCodeSnippet}

We recommend migrating to the new SDK using the following steps:

1. Update your ${moduleFolderName}.rb: ${markdownHighlight}gem update ${moduleFolderName}.rb${markdownHighlight}
2. Search and replace all requires from ${markdownHighlight}'${moduleFolderName}'${markdownHighlight} to ${markdownHighlight}'${moduleFolderName}_legacy'${markdownHighlight}
3. Update all client initializations from 
${markdownOpenCodeSnippet}
client = ${moduleName}::Client.new(access_token: 'token')
${markdownCloseCodeSnippet}
to 
${markdownOpenCodeSnippet}
client = ${moduleName}Legacy::Client.new(
  bearer_auth_credentials: { access_token: 'token' }
)
${markdownCloseCodeSnippet}
4. Gradually migrate over to the new SDK by importing it from the ${markdownHighlight}'${moduleFolderName}'${markdownHighlight} import.

### Environment and Custom URLs

This SDK allows you to configure different environments or custom URLs for API requests.
You can either use the predefined environments or specify your own custom URL.

#### Environments

${markdownOpenCodeSnippet}
require "${moduleFolderName}"

${moduleFolderName} = ${moduleName}::Client.new(
  base_url: ${moduleName}::Environment::PRODUCTION # Used by default 
)
${markdownCloseCodeSnippet}

#### Custom URL

${markdownOpenCodeSnippet}
require "${moduleFolderName}"

${moduleFolderName} = ${moduleName}::Client.new(
  base_url: "https://your-custom-staging.com" 
)
${markdownCloseCodeSnippet}

## Request And Response Types

The SDK exports all request and response types as Ruby classes. Simply require them with the
following namespace:

${markdownOpenCodeSnippet}
require '${moduleFolderName}'

# Create a request object
request = ${moduleName}::CreateMobileAuthorizationCodeRequest.new(
  location_id: 'YOUR_LOCATION_ID'
)
${markdownCloseCodeSnippet}

## Exception Handling

When the API returns a non-success status code (4xx or 5xx response), a subclass of the following error
will be raised.

${markdownOpenCodeSnippet}
require '${moduleFolderName}'

begin
  response = client.payments.create(...)
  rescue ${moduleName}::ApiError => e
  puts "Status Code: #{e.status_code}"
  puts "Message: #{e.message}"
  puts "Body: #{e.body}"
end
${markdownCloseCodeSnippet}

## Pagination

List endpoints are paginated. The SDK provides methods to handle pagination:

${markdownOpenCodeSnippet}
require '${moduleFolderName}'

client = ${moduleName}::Client.new(access_token: "YOUR_API_KEY")

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
${markdownCloseCodeSnippet}

## Advanced

### Additional Headers

If you would like to send additional headers as part of the request, use the ${markdownHighlight}headers${markdownHighlight} request option.

${markdownOpenCodeSnippet}
response = client.payments.create(..., {
  headers: {
    'X-Custom-Header' => 'custom value'
  }
})
${markdownCloseCodeSnippet}

### Receive Extra Properties

Every response includes any extra properties in the JSON response that were not specified in the type.
This can be useful for API features not present in the SDK yet.

You can receive and interact with the extra properties by accessing the raw response data:

${markdownOpenCodeSnippet}
response = client.locations.create(...)

# Access the raw response data
location_data = response.data.to_h

# Then access the extra property by its name
undocumented_property = location_data['undocumentedProperty']
${markdownCloseCodeSnippet}

### Retries

The SDK is instrumented with automatic retries with exponential backoff. A request will be retried as long
as the request is deemed retriable and the number of retry attempts has not grown larger than the configured
retry limit (default: 2).

A request is deemed retriable when any of the following HTTP status codes is returned:

- [408](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/408) (Timeout)
- [429](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429) (Too Many Requests)
- [5XX](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/500) (Internal Server Errors)

Use the ${markdownHighlight}max_retries${markdownHighlight} request option to configure this behavior.

${markdownOpenCodeSnippet}
response = client.payments.create(..., {
  max_retries: 0 # override max_retries at the request level
})
${markdownCloseCodeSnippet}

### Timeouts

The SDK defaults to a 60 second timeout. Use the ${markdownHighlight}timeout_in_seconds${markdownHighlight} option to configure this behavior.

${markdownOpenCodeSnippet}
response = client.payments.create(..., {
  timeout_in_seconds: 30 # override timeout to 30s
})
${markdownCloseCodeSnippet}

## Contributing

While we value open-source contributions to this SDK, this library
is generated programmatically. Additions made directly to this library
would have to be moved over to our generation code, otherwise they would
be overwritten upon the next generated release. Feel free to open a PR as a
proof of concept, but know that we will not be able to merge it as-is.
We suggest opening an issue first to discuss with us!

On the other hand, contributions to the README are always very welcome!
        `;
    }
}
