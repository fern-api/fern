# Seed C# Library

[![fern shield](https://img.shields.io/badge/%F0%9F%8C%BF-Built%20with%20Fern-brightgreen)](https://buildwithfern.com?utm_source=github&utm_medium=github&utm_campaign=readme&utm_source=Seed%2FC%23)
[![nuget shield](https://img.shields.io/nuget/v/SeedExamples)](https://nuget.org/packages/SeedExamples)

The Seed C# library provides convenient access to the Seed APIs from C#.

## Requirements

This SDK requires:

## Installation

```sh
dotnet add package SeedExamples
```

## Reference

A full reference for this library is available [here](./reference.md).

## Usage

Instantiate and use the client with the following:

```csharp
using SeedExamples;

var client = new SeedExamplesClient("TOKEN");
await client.EchoAsync("Hello world!\\n\\nwith\\n\\tnewlines");
```

## Exception Handling

When the API returns a non-success status code (4xx or 5xx response), a subclass of the following error
will be thrown.

```csharp
using SeedExamples;

try {
    var response = await client.EchoAsync(...);
} catch (SeedExamplesApiException e) {
    System.Console.WriteLine(e.Body);
    System.Console.WriteLine(e.StatusCode);
}
```

## Advanced

### Retries

The SDK is instrumented with automatic retries with exponential backoff. A request will be retried as long
as the request is deemed retryable and the number of retry attempts has not grown larger than the configured
retry limit (default: 2).

A request is deemed retryable when any of the following HTTP status codes is returned:

- [408](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/408) (Timeout)
- [429](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429) (Too Many Requests)
- [5XX](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/500) (Internal Server Errors)

Use the `MaxRetries` request option to configure this behavior.

```csharp
var response = await client.EchoAsync(
    ...,
    new RequestOptions {
        MaxRetries: 0 // Override MaxRetries at the request level
    }
);
```

### Timeouts

The SDK defaults to a 30 second timeout. Use the `Timeout` option to configure this behavior.

```csharp
var response = await client.EchoAsync(
    ...,
    new RequestOptions {
        Timeout: TimeSpan.FromSeconds(3) // Override timeout to 3s
    }
);
```

### Forward Compatible Enums

This SDK uses forward-compatible enums that can handle unknown values gracefully.

```csharp
using SeedExamples;

// Using a built-in value
var basicType = BasicType.Primitive;

// Using a custom value
var customBasicType = BasicType.FromCustom("custom-value");

// Using in a switch statement
switch (basicType.Value)
{
    case BasicType.Values.Primitive:
        Console.WriteLine("Primitive");
        break;
    default:
        Console.WriteLine($"Unknown value: {basicType.Value}");
        break;
}

// Explicit casting
string basicTypeString = (string)BasicType.Primitive;
BasicType basicTypeFromString = (BasicType)"primitive";
```

## Contributing

While we value open-source contributions to this SDK, this library is generated programmatically.
Additions made directly to this library would have to be moved over to our generation code,
otherwise they would be overwritten upon the next generated release. Feel free to open a PR as
a proof of concept, but know that we will not be able to merge it as-is. We suggest opening
an issue first to discuss with us!

On the other hand, contributions to the README are always very welcome!