# Fern Java Library

[![fern shield](https://img.shields.io/badge/%F0%9F%8C%BF-Built%20with%20Fern-brightgreen)](https://buildwithfern.com?utm_source=github&utm_medium=github&utm_campaign=readme&utm_source=Fern%2FJava)

The Fern Java library provides convenient access to the Fern APIs from Java.

## Table of Contents

- [Reference](#reference)
- [Usage](#usage)
- [Base Url](#base-url)
- [Exception Handling](#exception-handling)
- [Advanced](#advanced)
  - [Custom Client](#custom-client)
  - [Retries](#retries)
  - [Timeouts](#timeouts)
  - [Custom Headers](#custom-headers)
  - [Access Raw Response Data](#access-raw-response-data)
- [Contributing](#contributing)

## Reference

A full reference for this library is available [here](./reference.md).

## Usage

Instantiate and use the client with the following:

```java
package com.example.usage;

import com.fern.exhaustive.FernExhaustiveClient;
import java.util.Arrays;

public class Example {
    public static void main(String[] args) {
        FernExhaustiveClient client = FernExhaustiveClient
            .builder()
            .token("<token>")
            .build();

        client.endpoints().container().getAndReturnListOfPrimitives(
            Arrays.asList("string", "string")
        );
    }
}
```

## Base Url

You can set a custom base URL when constructing the client.

```java
import com.fern.exhaustive.FernExhaustiveClient;

FernExhaustiveClient client = FernExhaustiveClient
    .builder()
    .url("https://example.com")
    .build();
```

## Exception Handling

When the API returns a non-success status code (4xx or 5xx response), an API exception will be thrown.

```java
import com.fern.exhaustive.core.FernExhaustiveApiException;

try{
    client.endpoints().container().getAndReturnListOfPrimitives(...);
} catch (FernExhaustiveApiException e){
    // Do something with the API exception...
}
```

## Advanced

### Custom Client

This SDK is built to work with any instance of `OkHttpClient`. By default, if no client is provided, the SDK will construct one.
However, you can pass your own client like so:

```java
import com.fern.exhaustive.FernExhaustiveClient;
import okhttp3.OkHttpClient;

OkHttpClient customClient = ...;

FernExhaustiveClient client = FernExhaustiveClient
    .builder()
    .httpClient(customClient)
    .build();
```

### Retries

The SDK is instrumented with automatic retries with exponential backoff. A request will be retried as long
as the request is deemed retryable and the number of retry attempts has not grown larger than the configured
retry limit (default: 2). Before defaulting to exponential backoff, the SDK will first attempt to respect
the `Retry-After` header (as either in seconds or as an HTTP date), and then the `X-RateLimit-Reset` header
(as a Unix timestamp in epoch seconds); failing both of those, it will fall back to exponential backoff.

A request is deemed retryable when any of the following HTTP status codes is returned:

- [408](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/408) (Timeout)
- [429](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429) (Too Many Requests)
- [5XX](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/500) (Internal Server Errors)

Use the `maxRetries` client option to configure this behavior.

```java
import com.fern.exhaustive.FernExhaustiveClient;

FernExhaustiveClient client = FernExhaustiveClient
    .builder()
    .maxRetries(1)
    .build();
```

### Timeouts

The SDK defaults to a 60 second timeout. You can configure this with a timeout option at the client or request level.

```java
import com.fern.exhaustive.FernExhaustiveClient;
import com.fern.exhaustive.core.RequestOptions;

// Client level
FernExhaustiveClient client = FernExhaustiveClient
    .builder()
    .timeout(10)
    .build();

// Request level
client.endpoints().container().getAndReturnListOfPrimitives(
    ...,
    RequestOptions
        .builder()
        .timeout(10)
        .build()
);
```

### Custom Headers

The SDK allows you to add custom headers to requests. You can configure headers at the client level or at the request level.

```java
import com.fern.exhaustive.FernExhaustiveClient;
import com.fern.exhaustive.core.RequestOptions;

// Client level
FernExhaustiveClient client = FernExhaustiveClient
    .builder()
    .addHeader("X-Custom-Header", "custom-value")
    .addHeader("X-Request-Id", "abc-123")
    .build();
;

// Request level
client.endpoints().container().getAndReturnListOfPrimitives(
    ...,
    RequestOptions
        .builder()
        .addHeader("X-Request-Header", "request-value")
        .build()
);
```

### Access Raw Response Data

The SDK provides access to raw response data, including headers, through the `withRawResponse()` method.
The `withRawResponse()` method returns a raw client that wraps all responses with `body()` and `headers()` methods.
(A normal client's `response` is identical to a raw client's `response.body()`.)

```java
GetAndReturnListOfPrimitivesHttpResponse response = client.endpoints().container().withRawResponse().getAndReturnListOfPrimitives(...);

System.out.println(response.body());
System.out.println(response.headers().get("X-My-Header"));
```

## Contributing

While we value open-source contributions to this SDK, this library is generated programmatically.
Additions made directly to this library would have to be moved over to our generation code,
otherwise they would be overwritten upon the next generated release. Feel free to open a PR as
a proof of concept, but know that we will not be able to merge it as-is. We suggest opening
an issue first to discuss with us!

On the other hand, contributions to the README are always very welcome!