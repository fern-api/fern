# Seed C# Library

[![fern shield](https://img.shields.io/badge/%F0%9F%8C%BF-Built%20with%20Fern-brightgreen)](https://buildwithfern.com?utm_source=github&utm_medium=github&utm_campaign=readme&utm_source=Seed%2FC%23)
[![nuget shield](https://img.shields.io/nuget/v/SeedPagination)](https://nuget.org/packages/SeedPagination)

The Seed C# library provides convenient access to the Seed APIs from C#.

## Requirements

This SDK requires:

## Installation

```sh
dotnet add package SeedPagination
```

## Reference

A full reference for this library is available [here](./reference.md).

## Usage

Instantiate and use the client with the following:

```csharp
using SeedPagination;

var client = new SeedPaginationClient("TOKEN");
var items = await client.Complex.SearchAsync(
    "index",
    new SearchRequest
    {
        Pagination = new StartingAfterPaging { PerPage = 1, StartingAfter = "starting_after" },
        Query = new SingleFilterSearchRequest
        {
            Field = "field",
            Operator = SingleFilterSearchRequestOperator.Equals_,
            Value = "value",
        },
    }
);

await foreach (var item in items)
{
    // do something with item
}
```

## Exception Handling

When the API returns a non-success status code (4xx or 5xx response), a subclass of the following error
will be thrown.

```csharp
using SeedPagination;

try {
    var response = await client.Complex.SearchAsync(...);
} catch (SeedPaginationApiException e) {
    System.Console.WriteLine(e.Body);
    System.Console.WriteLine(e.StatusCode);
}
```

## Pagination

List endpoints are paginated. The SDK provides an async enumerable so that you can simply loop over the items:

```csharp
using SeedPagination;

var client = new SeedPaginationClient("TOKEN");
var items = await client.Complex.SearchAsync(
    "index",
    new SearchRequest
    {
        Pagination = new StartingAfterPaging { PerPage = 1, StartingAfter = "starting_after" },
        Query = new SingleFilterSearchRequest
        {
            Field = "field",
            Operator = SingleFilterSearchRequestOperator.Equals_,
            Value = "value",
        },
    }
);

await foreach (var item in items)
{
    // do something with item
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
var response = await client.Complex.SearchAsync(
    ...,
    new RequestOptions {
        MaxRetries: 0 // Override MaxRetries at the request level
    }
);
```

### Timeouts

The SDK defaults to a 30 second timeout. Use the `Timeout` option to configure this behavior.

```csharp
var response = await client.Complex.SearchAsync(
    ...,
    new RequestOptions {
        Timeout: TimeSpan.FromSeconds(3) // Override timeout to 3s
    }
);
```

### Forward Compatible Enums

This SDK uses forward-compatible enums that can handle unknown values gracefully.

```csharp
using SeedPagination;

// Using a built-in value
var multipleFilterSearchRequestOperator = MultipleFilterSearchRequestOperator.And;

// Using a custom value
var customMultipleFilterSearchRequestOperator = MultipleFilterSearchRequestOperator.FromCustom("custom-value");

// Using in a switch statement
switch (multipleFilterSearchRequestOperator.Value)
{
    case MultipleFilterSearchRequestOperator.Values.And:
        Console.WriteLine("And");
        break;
    default:
        Console.WriteLine($"Unknown value: {multipleFilterSearchRequestOperator.Value}");
        break;
}

// Explicit casting
string multipleFilterSearchRequestOperatorString = (string)MultipleFilterSearchRequestOperator.And;
MultipleFilterSearchRequestOperator multipleFilterSearchRequestOperatorFromString = (MultipleFilterSearchRequestOperator)"AND";
```

## Contributing

While we value open-source contributions to this SDK, this library is generated programmatically.
Additions made directly to this library would have to be moved over to our generation code,
otherwise they would be overwritten upon the next generated release. Feel free to open a PR as
a proof of concept, but know that we will not be able to merge it as-is. We suggest opening
an issue first to discuss with us!

On the other hand, contributions to the README are always very welcome!