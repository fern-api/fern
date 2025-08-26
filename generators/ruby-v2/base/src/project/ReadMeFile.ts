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
        const markdownCodeSnippet = "\`\`\`";
        const markdownHighlight = "\`";

        return `# ${moduleName} Ruby SDK

[![fern shield](https://img.shields.io/badge/%F0%9F%8C%BF-SDK%20generated%20by%20Fern-brightgreen)](https://github.com/fern-api/fern)
[![Gem Version](https://img.shields.io/badge/${moduleName}-red?logo=ruby)](https://rubygems.org/gems/${moduleFolderName})

## Installation

Install the gem and add to the application's Gemfile by executing:

${markdownCodeSnippet}
bundle add ${moduleFolderName}
${markdownCodeSnippet}

If bundler is not being used to manage dependencies, install the gem by executing:

${markdownCodeSnippet}
gem install ${moduleFolderName}
${markdownCodeSnippet}

## Usage

${markdownCodeSnippet}ruby
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
${markdownCodeSnippet}

## Instantiation

To get started with the ${moduleName} SDK, instantiate the ${markdownHighlight}${moduleName}${markdownHighlight} class as follows:

${markdownCodeSnippet}ruby
require "${moduleFolderName}"

${moduleFolderName} = ${moduleName}::Client.new(
  token: 'YOUR_API_KEY'
)
${markdownCodeSnippet}

Alternatively, you can omit the token when constructing the client.  In this case,
the SDK will automatically read the token from the ${markdownHighlight}${moduleName}${markdownHighlight} environment variable:

${markdownCodeSnippet}ruby
require "${moduleFolderName}"

${moduleFolderName} = ${moduleName}::Client.new(
  token: 'YOUR_API_KEY' 
)
${markdownCodeSnippet}

### Environment and Custom URLs

This SDK allows you to configure different environments or custom URLs for API requests.
You can either use the predefined environments or specify your own custom URL.

#### Environments

${markdownCodeSnippet}ruby
require "${moduleFolderName}"

${moduleFolderName} = ${moduleName}::Client.new(
  base_url: ${moduleName}::Environment::PRODUCTION # Used by default 
)
${markdownCodeSnippet}

#### Custom URL

${markdownCodeSnippet}ruby
require "${moduleFolderName}"

${moduleFolderName} = ${moduleName}::Client.new(
  base_url: "https://your-custom-staging.com" 
)
${markdownCodeSnippet}

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
