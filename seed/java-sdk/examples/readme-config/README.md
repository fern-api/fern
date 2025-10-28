# CustomName Java Library

![](https://www.fernapi.com)

[![fern shield](https://img.shields.io/badge/%F0%9F%8C%BF-Built%20with%20Fern-brightgreen)](https://buildwithfern.com?utm_source=github&utm_medium=github&utm_campaign=readme&utm_source=Seed%2FJava)
[![Maven Central](https://img.shields.io/maven-central/v/com.fern/examples)](https://central.sonatype.com/artifact/com.fern/examples)

The CustomName Java library provides convenient access to the CustomName APIs from Java.

## Documentation

API reference documentation is available [here](https://www.docs.fernapi.com).

## Installation

### Gradle

Add the dependency in your `build.gradle` file:

```groovy
dependencies {
  implementation 'com.fern:examples'
}
```

### Maven

Add the dependency in your `pom.xml` file:

```xml
<dependency>
  <groupId>com.fern</groupId>
  <artifactId>examples</artifactId>
  <version>0.0.1</version>
</dependency>
```

## Reference

A full reference for this library is available [here](./reference.md).

## Custom Section

This is a custom section. Latest package info is com.fern:examples:0.0.1


## Generator Invocation Custom Section

Generator Invocation Custom Content for com.fern:examples:0.0.1

## Override Section

Override Content

## Usage

Instantiate and use the client with the following:

```java
package com.example.usage;

import com.seed.examples.SeedExamplesClient;
import com.seed.examples.resources.types.types.Movie;
import java.util.HashMap;

public class Example {
    public static void main(String[] args) {
        SeedExamplesClient client = SeedExamplesClient
            .builder()
            .token("<token>")
            .build();

        client.service().createMovie(
            Movie
                .builder()
                .id("id")
                .title("title")
                .from("from")
                .rating(1.1)
                .type("movie")
                .tag("tag")
                .metadata(
                    new HashMap<String, Object>() {{
                        put("metadata", new 
                        HashMap<String, Object>() {{put("key", "value");
                        }});
                    }}
                )
                .revenue(1000000L)
                .build()
        );
    }
}
```

## Environments

This SDK allows you to configure different environments for API requests.

```java
import com.seed.examples.SeedExamplesClient;
import com.seed.examples.core.Environment;

SeedExamplesClient client = SeedExamplesClient
    .builder()
    .environment(Environment.Production)
    .build();
```

## Base Url

You can set a custom base URL when constructing the client.

```java
import com.seed.examples.SeedExamplesClient;

SeedExamplesClient client = SeedExamplesClient
    .builder()
    .url("https://example.com")
    .build();
```

## Exception Handling

When the API returns a non-success status code (4xx or 5xx response), an API exception will be thrown.

```java
import com.seed.examples.core.SeedExamplesApiException;

try{
    client.service().createMovie(...);
} catch (SeedExamplesApiException e){
    // Do something with the API exception...
}
```

## Advanced

### Custom Client

This SDK is built to work with any instance of `OkHttpClient`. By default, if no client is provided, the SDK will construct one.
However, you can pass your own client like so:

```java
import com.seed.examples.SeedExamplesClient;
import okhttp3.OkHttpClient;

OkHttpClient customClient = ...;

SeedExamplesClient client = SeedExamplesClient
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
import com.seed.examples.SeedExamplesClient;

SeedExamplesClient client = SeedExamplesClient
    .builder()
    .maxRetries(1)
    .build();
```

### Timeouts

The SDK defaults to a 60 second timeout. You can configure this with a timeout option at the client or request level.

```java
import com.seed.examples.SeedExamplesClient;
import com.seed.examples.core.RequestOptions;

// Client level
SeedExamplesClient client = SeedExamplesClient
    .builder()
    .timeout(10)
    .build();

// Request level
client.service().getMovie(
    ...,
    RequestOptions
        .builder()
        .timeout(10)
        .build()
);
```

```java
import com.seed.examples.SeedExamplesClient;
import com.seed.examples.core.RequestOptions;

// Client level
SeedExamplesClient client = SeedExamplesClient
    .builder()
    .timeout(10)
    .build();

// Request level
client.service().createMovie(
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
import com.seed.examples.SeedExamplesClient;
import com.seed.examples.core.RequestOptions;

// Client level
SeedExamplesClient client = SeedExamplesClient
    .builder()
    .addHeader("X-Custom-Header", "custom-value")
    .addHeader("X-Request-Id", "abc-123")
    .build();
;

// Request level
client.service().createMovie(
    ...,
    RequestOptions
        .builder()
        .addHeader("X-Request-Header", "request-value")
        .build()
);
```
