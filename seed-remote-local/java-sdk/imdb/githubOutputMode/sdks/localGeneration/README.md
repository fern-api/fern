# Fern Java Library

[![fern shield](https://img.shields.io/badge/%F0%9F%8C%BF-Built%20with%20Fern-brightgreen)](https://buildwithfern.com?utm_source=github&utm_medium=github&utm_campaign=readme&utm_source=https%3A%2F%2Fgithub.com%2Ffern-api%2Fempty)
[![Maven Central](https://img.shields.io/maven-central/v/com.fern-api/test-remote-local-sdk)](https://central.sonatype.com/artifact/com.fern-api/test-remote-local-sdk)

The Fern Java library provides convenient access to the Fern APIs from Java.

## Table of Contents

- [Installation](#installation)
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

## Installation

### Gradle

Add the dependency in your `build.gradle` file:

```groovy
dependencies {
  implementation 'com.fern-api:test-remote-local-sdk'
}
```

### Maven

Add the dependency in your `pom.xml` file:

```xml
<dependency>
  <groupId>com.fern-api</groupId>
  <artifactId>test-remote-local-sdk</artifactId>
  <version>0.0.1</version>
</dependency>
```

## Reference

A full reference for this library is available [here](https://github.com/fern-api/empty/blob/HEAD/./reference.md).

## Usage

Instantiate and use the client with the following:

```java
package com.example.usage;

import com.fern.api.FernApiClient;
import com.fern.api.resources.imdb.types.CreateMovieRequest;

public class Example {
    public static void main(String[] args) {
        FernApiClient client = FernApiClient
            .builder()
            .token("<token>")
            .build();

        client.imdb().createMovie(
            CreateMovieRequest
                .builder()
                .title("title")
                .rating(1.1)
                .build()
        );
    }
}
```

## Base Url

You can set a custom base URL when constructing the client.

```java
import com.fern.api.FernApiClient;

FernApiClient client = FernApiClient
    .builder()
    .url("https://example.com")
    .build();
```

## Exception Handling

When the API returns a non-success status code (4xx or 5xx response), an API exception will be thrown.

```java
import com.fern.api.core.FernApiApiException;

try{
    client.imdb().createMovie(...);
} catch (FernApiApiException e){
    // Do something with the API exception...
}
```

## Advanced

### Custom Client

This SDK is built to work with any instance of `OkHttpClient`. By default, if no client is provided, the SDK will construct one.
However, you can pass your own client like so:

```java
import com.fern.api.FernApiClient;
import okhttp3.OkHttpClient;

OkHttpClient customClient = ...;

FernApiClient client = FernApiClient
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
import com.fern.api.FernApiClient;

FernApiClient client = FernApiClient
    .builder()
    .maxRetries(1)
    .build();
```

### Timeouts

The SDK defaults to a 60 second timeout. You can configure this with a timeout option at the client or request level.

```java
import com.fern.api.FernApiClient;
import com.fern.api.core.RequestOptions;

// Client level
FernApiClient client = FernApiClient
    .builder()
    .timeout(10)
    .build();

// Request level
client.imdb().createMovie(
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
import com.fern.api.FernApiClient;
import com.fern.api.core.RequestOptions;

// Client level
FernApiClient client = FernApiClient
    .builder()
    .addHeader("X-Custom-Header", "custom-value")
    .addHeader("X-Request-Id", "abc-123")
    .build();
;

// Request level
client.imdb().createMovie(
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
CreateMovieHttpResponse response = client.imdb().withRawResponse().createMovie(...);

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