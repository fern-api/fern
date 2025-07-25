# Seed Java Library

[![fern shield](https://img.shields.io/badge/%F0%9F%8C%BF-Built%20with%20Fern-brightgreen)](https://buildwithfern.com?utm_source=github&utm_medium=github&utm_campaign=readme&utm_source=Seed%2FJava)
[![Maven Central](https://img.shields.io/maven-central/v/com.fern/query-parameters-openapi-as-objects)](https://central.sonatype.com/artifact/com.fern/query-parameters-openapi-as-objects)

The Seed Java library provides convenient access to the Seed API from Java.

## Installation

### Gradle

Add the dependency in your `build.gradle` file:

```groovy
dependencies {
  implementation 'com.fern:query-parameters-openapi-as-objects'
}
```

### Maven

Add the dependency in your `pom.xml` file:

```xml
<dependency>
  <groupId>com.fern</groupId>
  <artifactId>query-parameters-openapi-as-objects</artifactId>
  <version>0.0.1</version>
</dependency>
```

## Usage

Instantiate and use the client with the following:

```java
package com.example.usage;

import com.seed.api.SeedApiClient;
import com.seed.api.requests.SearchRequest;
import com.seed.api.types.NestedUser;
import com.seed.api.types.SearchRequestNeighbor;
import com.seed.api.types.SearchRequestNeighborRequired;
import com.seed.api.types.User;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Optional;

public class Example {
    public static void main(String[] args) {
        SeedApiClient client = SeedApiClient
            .builder()
            .build();

        client.search(
            SearchRequest
                .builder()
                .limit(1)
                .id("id")
                .date("date")
                .deadline(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                .bytes("bytes")
                .user(
                    User
                        .builder()
                        .name("name")
                        .tags(
                            new ArrayList<String>(
                                Arrays.asList("tags", "tags")
                            )
                        )
                        .build()
                )
                .userList(
                    new ArrayList<Optional<User>>(
                        Arrays.asList(
                            User
                                .builder()
                                .name("name")
                                .tags(
                                    new ArrayList<String>(
                                        Arrays.asList("tags", "tags")
                                    )
                                )
                                .build()
                        )
                    )
                )
                .excludeUser(
                    new ArrayList<Optional<User>>(
                        Arrays.asList(
                            User
                                .builder()
                                .name("name")
                                .tags(
                                    new ArrayList<String>(
                                        Arrays.asList("tags", "tags")
                                    )
                                )
                                .build()
                        )
                    )
                )
                .filter(
                    new ArrayList<Optional<String>>(
                        Arrays.asList("filter")
                    )
                )
                .neighborRequired(
                    SearchRequestNeighborRequired.ofUser(
                        User
                            .builder()
                            .name("name")
                            .tags(
                                new ArrayList<String>(
                                    Arrays.asList("tags", "tags")
                                )
                            )
                            .build()
                    )
                )
                .optionalDeadline(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                .keyValue(
                    new HashMap<String, Optional<String>>() {{
                        put("keyValue", Optional.of("keyValue"));
                    }}
                )
                .optionalString("optionalString")
                .nestedUser(
                    NestedUser
                        .builder()
                        .name("name")
                        .user(
                            User
                                .builder()
                                .name("name")
                                .tags(
                                    new ArrayList<String>(
                                        Arrays.asList("tags", "tags")
                                    )
                                )
                                .build()
                        )
                        .build()
                )
                .optionalUser(
                    User
                        .builder()
                        .name("name")
                        .tags(
                            new ArrayList<String>(
                                Arrays.asList("tags", "tags")
                            )
                        )
                        .build()
                )
                .neighbor(
                    SearchRequestNeighbor.ofUser(
                        User
                            .builder()
                            .name("name")
                            .tags(
                                new ArrayList<String>(
                                    Arrays.asList("tags", "tags")
                                )
                            )
                            .build()
                    )
                )
                .build()
        );
    }
}
```

## Base Url

You can set a custom base URL when constructing the client.

```java
import com.seed.api.SeedApiClient;

SeedApiClient client = SeedApiClient
    .builder()
    .url("https://example.com")
    .build();
```

## Exception Handling

When the API returns a non-success status code (4xx or 5xx response), an API exception will be thrown.

```java
import com.seed.api.core.SeedApiApiException;

try {
    client.search(...);
} catch (SeedApiApiException e) {
    // Do something with the API exception...
}
```

## Advanced

### Custom Client

This SDK is built to work with any instance of `OkHttpClient`. By default, if no client is provided, the SDK will construct one. 
However, you can pass your own client like so:

```java
import com.seed.api.SeedApiClient;
import okhttp3.OkHttpClient;

OkHttpClient customClient = ...;

SeedApiClient client = SeedApiClient
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
import com.seed.api.SeedApiClient;

SeedApiClient client = SeedApiClient
    .builder()
    .maxRetries(1)
    .build();
```

### Timeouts

The SDK defaults to a 60 second timeout. You can configure this with a timeout option at the client or request level.

```java
import com.seed.api.SeedApiClient;
import com.seed.api.core.RequestOptions;

// Client level
SeedApiClient client = SeedApiClient
    .builder()
    .timeout(10)
    .build();

// Request level
client.search(
    ...,
    RequestOptions
        .builder()
        .timeout(10)
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