# Seed Java Library

[![fern shield](https://img.shields.io/badge/%F0%9F%8C%BF-Built%20with%20Fern-brightgreen)](https://buildwithfern.com?utm_source=github&utm_medium=github&utm_campaign=readme&utm_source=Seed%2FJava)

The Seed Java library provides convenient access to the Seed API from Java.

## Usage

Instantiate and use the client with the following:

```java
package com.example.usage;

import com.seed.queryParameters.SeedQueryParametersClient;
import com.seed.queryParameters.resources.user.requests.GetUsersRequest;
import com.seed.queryParameters.resources.user.types.NestedUser;
import com.seed.queryParameters.resources.user.types.User;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.UUID;

public class Example {
    public static void main(String[] args) {
        SeedQueryParametersClient client = SeedQueryParametersClient
            .builder()
            .build();

        client.user().getUsername(
            GetUsersRequest
                .builder()
                .limit(1)
                .id(UUID.fromString("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"))
                .date("2023-01-15")
                .deadline(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                .bytes("SGVsbG8gd29ybGQh".getBytes())
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
                    new ArrayList<User>(
                        Arrays.asList(
                            User
                                .builder()
                                .name("name")
                                .tags(
                                    new ArrayList<String>(
                                        Arrays.asList("tags", "tags")
                                    )
                                )
                                .build(),
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
                .keyValue(
                    new HashMap<String, String>() {{
                        put("keyValue", "keyValue");
                    }}
                )
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
                .excludeUser(
                    new ArrayList<User>(
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
                    new ArrayList<String>(
                        Arrays.asList("filter")
                    )
                )
                .optionalDeadline(OffsetDateTime.parse("2024-01-15T09:30:00Z"))
                .optionalString("optionalString")
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
                .build()
        );
    }
}
```

## Base Url

You can set a custom base URL when constructing the client.

```java
import com.seed.queryParameters.SeedQueryParametersClient;

SeedQueryParametersClient client = SeedQueryParametersClient
    .builder()
    .url("https://example.com")
    .build();
```

## Exception Handling

When the API returns a non-success status code (4xx or 5xx response), an API exception will be thrown.

```java
import com.seed.queryParameters.core.SeedQueryParametersApiException;

try {
    client.user().getUsername(...);
} catch (SeedQueryParametersApiException e) {
    // Do something with the API exception...
}
```

## Advanced

### Custom Client

This SDK is built to work with any instance of `OkHttpClient`. By default, if no client is provided, the SDK will construct one. 
However, you can pass your own client like so:

```java
import com.seed.queryParameters.SeedQueryParametersClient;
import okhttp3.OkHttpClient;

OkHttpClient customClient = ...;

SeedQueryParametersClient client = SeedQueryParametersClient
    .builder()
    .httpClient(customClient)
    .build();
```

### Retries

The SDK is instrumented with automatic retries with exponential backoff. A request will be retried as long
as the request is deemed retriable and the number of retry attempts has not grown larger than the configured
retry limit (default: 2).

A request is deemed retriable when any of the following HTTP status codes is returned:

- [408](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/408) (Timeout)
- [429](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429) (Too Many Requests)
- [5XX](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/500) (Internal Server Errors)

Use the `maxRetries` request option to configure this behavior.

```java
import com.seed.queryParameters.core.RequestOptions;

client.user().getUsername(
    ...,
    RequestOptions
        .builder()
        .maxRetries(1)
        .build()
);
```

### Timeouts

The SDK defaults to a 60 second timeout. You can configure this with a timeout option at the client or request level.

```java
import com.seed.queryParameters.SeedQueryParametersClient;
import com.seed.queryParameters.core.RequestOptions;

// Client level
SeedQueryParametersClient client = SeedQueryParametersClient
    .builder()
    .tiemout(10)
    .build();

// Request level
client.user().getUsername(
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