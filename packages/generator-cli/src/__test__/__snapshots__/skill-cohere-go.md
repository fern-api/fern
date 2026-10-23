---
name: cohere-go-sdk
description: >-
  Use the Cohere Go SDK (`github.com/cohere-ai/cohere-go`) to call the Cohere API:
  installation, usage, errors, retries, timeouts.
  Use when writing Go code that talks to Cohere, or when a user asks how to
  do something with the Cohere Go SDK.
---

# Cohere Go SDK

The Cohere Go SDK allows access to Cohere models across many different platforms: the cohere platform,
AWS (Bedrock, Sagemaker), Azure, GCP and Oracle OCI. For a full list of support and snippets, please
take a look at the [SDK support docs](https://docs.cohere.com/docs/cohere-works-everywhere) page.

## When to use this skill

Use this skill whenever the task involves calling the Cohere API from Go. Prefer the SDK over hand-written HTTP requests: it handles authentication, serialization, errors, retries and timeouts for you.

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

## Retries

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

## Timeouts

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

## Resources

- API reference documentation: https://docs.cohere.com

## Rules

- Read credentials from environment variables or a secrets manager; never hard-code API keys or tokens in source code.
- Use the typed request and response objects exported by the SDK instead of building raw JSON.
- Catch the SDK's typed errors and inspect the status code and body instead of matching on error messages.
- Do not edit generated SDK files; configure behavior through client options (base URL, headers, timeouts, retries).
- If a method or type is missing from this skill, look it up in the reference before falling back to raw HTTP.