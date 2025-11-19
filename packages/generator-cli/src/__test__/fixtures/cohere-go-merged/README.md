# Cohere Go Library

![](https://raw.githubusercontent.com/cohere-ai/cohere-typescript/5188b11a6e91727fdd4d46f4a690419ad204224d/banner.png)

[![fern shield](https://img.shields.io/badge/%F0%9F%8C%BF-SDK%20generated%20by%20Fern-brightgreen)](https://github.com/fern-api/fern)
[![go shield](https://img.shields.io/badge/go-docs-blue)](https://pkg.go.dev/github.com/cohere-ai/cohere-go)

The Cohere Go library provides convenient access to the Cohere API from Go.

## Documentation

Cohere documentation is available [here](https://docs.cohere.com).

## Installation

\`\`\`sh
go get github.com/cohere-ai/cohere-go/v2
\`\`\`

## Zero 

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

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

## Custom

This is a custom section that should ideally stay between the usage and timeout section.

## One

This is another custom section that should ideally stay between the usage and timeout section.

## Two

This is another custom section that should ideally stay between the usage and timeout section.

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

### Remove

This section is an h3, so it will be removed from the final output.

## Three

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

## Advanced

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

```go
ctx, cancel := context.WithTimeout(context.Background(), time.Second)
defer cancel()

response, err := client.Generate(
	ctx,
	&fern.GenerateRequest{
		Prompt: "Please explain to me how LLMs work",
	},
)
```

## Four

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

## Contributing

While we value open-source contributions to this SDK, this library is generated programmatically.
Additions made directly to this library would have to be moved over to our generation code,
otherwise they would be overwritten upon the next generated release. Feel free to open a PR as
a proof of concept, but know that we will not be able to merge it as-is. We suggest opening
an issue first to discuss with us!

On the other hand, contributions to the README are always very welcome!

## Five

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.