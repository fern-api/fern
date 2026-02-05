# Seed Java Library

[![fern shield](https://img.shields.io/badge/%F0%9F%8C%BF-Built%20with%20Fern-brightgreen)](https://buildwithfern.com?utm_source=github&utm_medium=github&utm_campaign=readme&utm_source=Seed%2FJava)
[![Maven Central](https://img.shields.io/maven-central/v/com.fern/pagination-custom)](https://central.sonatype.com/artifact/com.fern/pagination-custom)

The Seed Java library provides convenient access to the Seed APIs from Java.

## Table of Contents

- [Installation](#installation)
- [Reference](#reference)
- [Usage](#usage)
- [Base Url](#base-url)
- [Pagination](#pagination)
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
  implementation 'com.fern:pagination-custom'
}
```

### Maven

Add the dependency in your `pom.xml` file:

```xml
<dependency>
  <groupId>com.fern</groupId>
  <artifactId>pagination-custom</artifactId>
  <version>0.0.1</version>
</dependency>
```

## Reference

A full reference for this library is available [here](./reference.md).

## Usage

Instantiate and use the client with the following:

```java
package com.example.usage;

import com.seed.pagination.SeedPaginationClient;
import com.seed.pagination.resources.users.requests.ListUsernamesRequestCustom;

public class Example {
    public static void main(String[] args) {
        SeedPaginationClient client = SeedPaginationClient
            .builder()
            .token("<token>")
            .build();

        client.users().listUsernamesCustom(
            ListUsernamesRequestCustom
                .builder()
                .startingAfter("starting_after")
                .build()
        );
    }
}
```

## Base Url

You can set a custom base URL when constructing the client.

```java
import com.seed.pagination.SeedPaginationClient;

SeedPaginationClient client = SeedPaginationClient
    .builder()
    .url("https://example.com")
    .build();
```

## Pagination

Paginated requests will return an Iterable<T>, which can be used to loop through the underlying items, or stream them. You can also call
`nextPage` to perform the pagination manually

```java
import com.seed.pagination.SeedPaginationClient;

SeedPaginationClient client = SeedPaginationClient
    .builder()
    .build();

CustomPager<?> response = client.users().listUsernamesCustom(...);

// Iterate through pages using bidirectional navigation
while (response.hasNext()) {
    for (var item : response.getItems()) {
        // Process each item
    }
    response = response.nextPage();
}

// Navigate to previous page
if (response.hasPrevious()) {
    response = response.previousPage();
}

// Access the full response for metadata
response.getResponse().ifPresent(fullResponse -> {
    // Access custom pagination metadata from the response
});
```
## Custom Pagination Implementation

The SDK uses a custom bidirectional pagination implementation via the `CustomPager` class. This class is a skeleton implementation that you must complete based on your API's specific pagination structure (e.g., HATEOAS links).

### Implementation Steps

1. **Locate the skeleton class**: Find `core/pagination/CustomPager.java`
2. **Implement required methods**: Replace the `UnsupportedOperationException` with your logic
3. **Add to .fernignore**: Ensure the file is listed in `.fernignore` to preserve your changes

### Example Implementation

```java
public class CustomPager<T> implements BiDirectionalPage<T>, Iterable<T> {
    private final List<T> items;
    private final String nextUrl;
    private final String previousUrl;
    private final OkHttpClient client;

    @Override
    public boolean hasNext() {
        return nextUrl != null;
    }

    @Override
    public CustomPager<T> nextPage() throws IOException {
        if (!hasNext()) {
            throw new NoSuchElementException("No next page available");
        }
        // Make HTTP request to nextUrl
        // Parse response and return new CustomPager instance
    }

    @Override
    public List<T> getItems() {
        return items;
    }

    // ... implement other required methods
}
```

### Usage

Once implemented, the custom pager provides bidirectional navigation:

```java
CustomPager<Item> page = client.listItems();

// Navigate forward
while (page.hasNext()) {
    for (Item item : page.getItems()) {
        // Process item
    }
    page = page.nextPage();
}

// Navigate backward
if (page.hasPrevious()) {
    page = page.previousPage();
}
```

## Exception Handling

When the API returns a non-success status code (4xx or 5xx response), an API exception will be thrown.

```java
import com.seed.pagination.core.SeedPaginationApiException;

try{
    client.users().listUsernamesCustom(...);
} catch (SeedPaginationApiException e){
    // Do something with the API exception...
}
```

## Advanced

### Custom Client

This SDK is built to work with any instance of `OkHttpClient`. By default, if no client is provided, the SDK will construct one.
However, you can pass your own client like so:

```java
import com.seed.pagination.SeedPaginationClient;
import okhttp3.OkHttpClient;

OkHttpClient customClient = ...;

SeedPaginationClient client = SeedPaginationClient
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
import com.seed.pagination.SeedPaginationClient;

SeedPaginationClient client = SeedPaginationClient
    .builder()
    .maxRetries(1)
    .build();
```

### Timeouts

The SDK defaults to a 60 second timeout. You can configure this with a timeout option at the client or request level.

```java
import com.seed.pagination.SeedPaginationClient;
import com.seed.pagination.core.RequestOptions;

// Client level
SeedPaginationClient client = SeedPaginationClient
    .builder()
    .timeout(10)
    .build();

// Request level
client.users().listUsernamesCustom(
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
import com.seed.pagination.SeedPaginationClient;
import com.seed.pagination.core.RequestOptions;

// Client level
SeedPaginationClient client = SeedPaginationClient
    .builder()
    .addHeader("X-Custom-Header", "custom-value")
    .addHeader("X-Request-Id", "abc-123")
    .build();
;

// Request level
client.users().listUsernamesCustom(
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
ListUsernamesCustomHttpResponse response = client.users().withRawResponse().listUsernamesCustom(...);

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