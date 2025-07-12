# Seed Java Library

[![fern shield](https://img.shields.io/badge/%F0%9F%8C%BF-Built%20with%20Fern-brightgreen)](https://buildwithfern.com?utm_source=github&utm_medium=github&utm_campaign=readme&utm_source=Seed%2FJava)

The Seed Java library provides convenient access to the Seed API from Java.

## Usage

Instantiate and use the client with the following:

```java
package com.example.usage;

import com.seed.examples.SeedExamplesClient;

public class Example {
    public static void main(String[] args) {
        SeedExamplesClient client = SeedExamplesClient
            .builder()
            .token("<token>")
            .build();

        client.echo("string");
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

try {
    client.echo(...);
} catch (SeedExamplesApiException e) {
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
retry limit (default: 2).

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
client.echo(
    ...,
    RequestOptions
        .builder()
        .timeout(10)
        .build()
);
```

### Union Types

Union types represent values that can be one of several possible types.
- To consume an instance of a union type, use the `visit()` method with a visitor pattern to handle different union
  variants type-safely
- To create instances of a union type, use static factory methods like `Type.of(value)`

```java
import UnionPackage.UnionSubType1;
import UnionPackage.UnionSubType2;
import UnionPackage.UnionType;

// Instantiate instance of UnionSubType1
public UnionType unionTypeFromUnionSubType1(UnionSubType1 unionSubType1) {
    return UnionType.of(unionSubType1);
}
// Instantiate instance of UnionSubType2
public UnionType unionTypeFromUnionSubType2(UnionSubType2 unionSubType2) {
    return UnionType.of(unionSubType2);
}
// Operate on instance of UnionType
public String doSomethingWithUnionType(UnionType unionType) {
    String result = unionType.visit(new UnionType.Visitor<String>() {
        @Override
        public String visit(UnionSubType1 value) {
            // do something with instance of UnionSubType1
            return "Did something with UnionSubType1";
        }
        @Override
        public String visit(UnionSubType2 value) {
            // do something with instance of UnionSubType2
            return "Did something with UnionSubType2";
        }
    });
    return result;
}```

## Contributing

While we value open-source contributions to this SDK, this library is generated programmatically.
Additions made directly to this library would have to be moved over to our generation code,
otherwise they would be overwritten upon the next generated release. Feel free to open a PR as
a proof of concept, but know that we will not be able to merge it as-is. We suggest opening
an issue first to discuss with us!

On the other hand, contributions to the README are always very welcome!