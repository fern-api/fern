# Seed Java Library

[![fern shield](https://img.shields.io/badge/%F0%9F%8C%BF-Built%20with%20Fern-brightgreen)](https://buildwithfern.com?utm_source=github&utm_medium=github&utm_campaign=readme&utm_source=Seed%2FJava)
[![Maven Central](https://img.shields.io/maven-central/v/com.fern/mixed-file-directory)](https://central.sonatype.com/artifact/com.fern/mixed-file-directory)

The Seed Java library provides convenient access to the Seed APIs from Java.

## Installation

### Gradle

Add the dependency in your `build.gradle` file:

```groovy
dependencies {
  implementation 'com.fern:mixed-file-directory'
}
```

### Maven

Add the dependency in your `pom.xml` file:

```xml
<dependency>
  <groupId>com.fern</groupId>
  <artifactId>mixed-file-directory</artifactId>
  <version>0.0.1</version>
</dependency>
```

## Reference

A full reference for this library is available [here](./reference.md).

## Usage

Instantiate and use the client with the following:

```java
package com.example.usage;

import com.seed.mixedFileDirectory.SeedMixedFileDirectoryClient;
import com.seed.mixedFileDirectory.resources.organization.types.CreateOrganizationRequest;

public class Example {
    public static void main(String[] args) {
        SeedMixedFileDirectoryClient client = SeedMixedFileDirectoryClient
            .builder()
            .build();

        client.organization().create(
            CreateOrganizationRequest
                .builder()
                .name("name")
                .build()
        );
    }
}
```

## Base Url

You can set a custom base URL when constructing the client.

```java
import com.seed.mixedFileDirectory.SeedMixedFileDirectoryClient;

SeedMixedFileDirectoryClient client = SeedMixedFileDirectoryClient
    .builder()
    .url("https://example.com")
    .build();
```

## Exception Handling

When the API returns a non-success status code (4xx or 5xx response), an API exception will be thrown.

```java
import com.seed.mixedFileDirectory.core.SeedMixedFileDirectoryApiException;

try{
    client.organization().create(...);
} catch (SeedMixedFileDirectoryApiException e){
    // Do something with the API exception...
}
```

## Advanced

### Custom Client

This SDK is built to work with any instance of `OkHttpClient`. By default, if no client is provided, the SDK will construct one.
However, you can pass your own client like so:

```java
import com.seed.mixedFileDirectory.SeedMixedFileDirectoryClient;
import okhttp3.OkHttpClient;

OkHttpClient customClient = ...;

SeedMixedFileDirectoryClient client = SeedMixedFileDirectoryClient
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
import com.seed.mixedFileDirectory.SeedMixedFileDirectoryClient;

SeedMixedFileDirectoryClient client = SeedMixedFileDirectoryClient
    .builder()
    .maxRetries(1)
    .build();
```

### Timeouts

The SDK defaults to a 60 second timeout. You can configure this with a timeout option at the client or request level.

```java
import com.seed.mixedFileDirectory.SeedMixedFileDirectoryClient;
import com.seed.mixedFileDirectory.core.RequestOptions;

// Client level
SeedMixedFileDirectoryClient client = SeedMixedFileDirectoryClient
    .builder()
    .timeout(10)
    .build();

// Request level
client.organization().create(
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
import com.seed.mixedFileDirectory.SeedMixedFileDirectoryClient;
import com.seed.mixedFileDirectory.core.RequestOptions;

// Client level
SeedMixedFileDirectoryClient client = SeedMixedFileDirectoryClient
    .builder()
    .addHeader("X-Custom-Header", "custom-value")
    .addHeader("X-Request-Id", "abc-123")
    .build();
;

// Request level
client.organization().create(
    ...,
    RequestOptions
        .builder()
        .addHeader("X-Request-Header", "request-value")
        .build()
);
```

## Contributing

While we value open-source contributions to this SDK, this library is generated programmatically.
Additions made directly to this library would have to be moved over to our generation code,
otherwise they would be overwritten upon the next generated release. Feel free to open a PR as
a proof of concept, but know that we will not be able to merge it as-is. We suggest opening
an issue first to discuss with us!

On the other hand, contributions to the README are always very welcome!