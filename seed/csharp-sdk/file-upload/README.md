# Seed C# Library

[![fern shield](https://img.shields.io/badge/%F0%9F%8C%BF-Built%20with%20Fern-brightgreen)](https://buildwithfern.com?utm_source=github&utm_medium=github&utm_campaign=readme&utm_source=Seed%2FC%23)
[![nuget shield](https://img.shields.io/nuget/v/SeedFileUpload)](https://nuget.org/packages/SeedFileUpload)

The Seed C# library provides convenient access to the Seed APIs from C#.

## Table of Contents

- [Requirements](#requirements)
- [Installation](#installation)
- [Reference](#reference)
- [Usage](#usage)
- [Exception Handling](#exception-handling)
- [Advanced](#advanced)
  - [Retries](#retries)
  - [Timeouts](#timeouts)
  - [Forward Compatible Enums](#forward-compatible-enums)
- [Contributing](#contributing)

## Requirements

This SDK requires:

## Installation

```sh
dotnet add package SeedFileUpload
```

## Reference

A full reference for this library is available [here](./reference.md).

## Usage

Instantiate and use the client with the following:

```csharp
using SeedFileUpload;

var client = new SeedFileUploadClient();
await client.Service.JustFileAsync(new JustFileRequest());
```

## Exception Handling

When the API returns a non-success status code (4xx or 5xx response), a subclass of the following error
will be thrown.

```csharp
using SeedFileUpload;

try {
    var response = await client.Service.JustFileAsync(...);
} catch (SeedFileUploadApiException e) {
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
var response = await client.Service.JustFileAsync(
    ...,
    new RequestOptions {
        MaxRetries: 0 // Override MaxRetries at the request level
    }
);
```

### Timeouts

The SDK defaults to a 30 second timeout. Use the `Timeout` option to configure this behavior.

```csharp
var response = await client.Service.JustFileAsync(
    ...,
    new RequestOptions {
        Timeout: TimeSpan.FromSeconds(3) // Override timeout to 3s
    }
);
```

### Forward Compatible Enums

This SDK uses forward-compatible enums that can handle unknown values gracefully.

```csharp
using SeedFileUpload;

// Using a built-in value
var objectType = ObjectType.Foo;

// Using a custom value
var customObjectType = ObjectType.FromCustom("custom-value");

// Using in a switch statement
switch (objectType.Value)
{
    case ObjectType.Values.Foo:
        Console.WriteLine("Foo");
        break;
    default:
        Console.WriteLine($"Unknown value: {objectType.Value}");
        break;
}

// Explicit casting
string objectTypeString = (string)ObjectType.Foo;
ObjectType objectTypeFromString = (ObjectType)"FOO";
```

## Contributing

While we value open-source contributions to this SDK, this library is generated programmatically.
Additions made directly to this library would have to be moved over to our generation code,
otherwise they would be overwritten upon the next generated release. Feel free to open a PR as
a proof of concept, but know that we will not be able to merge it as-is. We suggest opening
an issue first to discuss with us!

On the other hand, contributions to the README are always very welcome!