# Cohere Go Library

![](https://raw.githubusercontent.com/cohere-ai/cohere-typescript/5188b11a6e91727fdd4d46f4a690419ad204224d/banner.png)

[![fern shield](https://img.shields.io/badge/%F0%9F%8C%BF-Built%20with%20Fern-brightgreen)](https://buildwithfern.com?utm_source=github&utm_medium=github&utm_campaign=readme&utm_source=Cohere%2FGo)
[![go shield](https://img.shields.io/badge/go-docs-blue)](https://pkg.go.dev/github.com/cohere-ai/cohere-go)

The Cohere Go SDK allows access to Cohere models across many different platforms: the cohere platform,
AWS (Bedrock, Sagemaker), Azure, GCP and Oracle OCI. For a full list of support and snippets, please
take a look at the [SDK support docs](https://docs.cohere.com/docs/cohere-works-everywhere) page.

## Table of Contents

- [Documentation](#documentation)
- [Installation](#installation)
- [Usage](#usage)
- [Errors](#errors)
- [Advanced](#advanced)
  - [Retries](#retries)
  - [Timeouts](#timeouts)
- [Contributing](#contributing)

## Documentation

API reference documentation is available [here](https://docs.cohere.com).

## Installation

```sh
go get github.com/cohere-ai/cohere-go/v2
```

## Usage

Instantiate the client with the following:

```go
import (
	fern "github.com/custom/fern"
	fernclient "github.com/custom/fern/client"
	option "github.com/custom/fern/option"
)

client := fernclient.NewClient(
	option.WithToken(
		"<YOUR_AUTH_TOKEN>",
	),
)
response, err := client.Chat(
	ctx,
	&fern.ChatRequest{
		Message: "Can you give me a global market overview of solar panels?",
	},
)
```

## Errors

Structured error types are returned from API calls that return non-success status codes.
For example, you can check if the error was of a particular type with the following:

```go
response, err := client.Chat(
	ctx,
	&fern.ChatRequest{
		Message: "Can you give me a global market overview of solar panels?",
	},
)
if err != nil {
	var apiError *core.APIError
	if errors.As(err, &apiError) {
		// Handle the error.
	}
	return nil, err
}
```

## Advanced

### Retries

The SDK is instrumented with automatic retries with exponential backoff. A request will be retried as long as the request is deemed retriable and the number of retry attempts has not grown larger than the configured retry limit (default: 2).
```go
response, err := client.Chat(
	ctx,
	&fern.ChatRequest{
		Message: "Can you give me a global market overview of solar panels?",
	},
	option.WithMaxAttempts(1),
)
```

### Timeouts

Setting a timeout for each individual request is as simple as
using the standard `context` library. Setting a one second timeout
for an individual API call looks like the following:

```go
ctx, cancel := context.WithTimeout(context.Background(), time.Second)
defer cancel()

response, err := client.Chat(
	ctx,
	&fern.ChatRequest{
		Message: "Can you give me a global market overview of solar panels?",
	},
)
```

## Contributing

While we value open-source contributions to this SDK, this library is generated programmatically.
Additions made directly to this library would have to be moved over to our generation code,
otherwise they would be overwritten upon the next generated release. Feel free to open a PR as
a proof of concept, but know that we will not be able to merge it as-is. We suggest opening
an issue first to discuss with us!

On the other hand, contributions to the README are always very welcome!