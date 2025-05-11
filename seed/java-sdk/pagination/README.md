# Seed Java Library

[![fern shield](https://img.shields.io/badge/%F0%9F%8C%BF-Built%20with%20Fern-brightgreen)](https://buildwithfern.com?utm_source=github&utm_medium=github&utm_campaign=readme&utm_source=Seed%2FJava)

The Seed Java library provides convenient access to the Seed API from Java.

## Usage

Instantiate and use the client with the following:

```java
package com.example.usage;

import com.seed.pagination.SeedPaginationClient;
import com.seed.pagination.resources.complex.types.SearchRequest;
import com.seed.pagination.resources.complex.types.SearchRequestQuery;
import com.seed.pagination.resources.complex.types.SingleFilterSearchRequest;
import com.seed.pagination.resources.complex.types.SingleFilterSearchRequestOperator;
import com.seed.pagination.resources.complex.types.StartingAfterPaging;

public class Example {
    public static void main(String[] args) {
        SeedPaginationClient client = SeedPaginationClient
            .builder()
            .token("<token>")
            .build();

        client.complex().search(
            SearchRequest
                .builder()
                .query(
                    SearchRequestQuery.ofSingleFilterSearchRequest(
                        SingleFilterSearchRequest
                            .builder()
                            .field("field")
                            .operator(SingleFilterSearchRequestOperator.EQUALS)
                            .value("value")
                            .build()
                    )
                )
                .pagination(
                    StartingAfterPaging
                        .builder()
                        .perPage(1)
                        .startingAfter("starting_after")
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
import com.seed.pagination.core.pagination.SyncPagingIterable;
import com.seed.pagination.resources.complex.types.PaginatedConversationResponse;
import java.util.List;

SeedPaginationClient client = SeedPaginationClient
    .builder()
    .build();

SyncPagingIterable<PaginatedConversationResponse> response = client.complex().search(...);

// Iterator
for (item : response) {
    // Do something with item
}

// Streaming
response.streamItems().map(item -> ...);

// Manual pagination
for (
        List<PaginatedConversationResponse> items = response.getItems;
        response.hasNext();
        items = items.nextPage().getItems()) {
    // Do something with items
}
```

## Exception Handling

When the API returns a non-success status code (4xx or 5xx response), an API exception will be thrown.

```java
import com.seed.pagination.core.SeedPaginationApiException;

try {
    client.complex().search(...);
} catch (SeedPaginationApiException e) {
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
as the request is deemed retriable and the number of retry attempts has not grown larger than the configured
retry limit (default: 2).

A request is deemed retriable when any of the following HTTP status codes is returned:

- [408](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/408) (Timeout)
- [429](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429) (Too Many Requests)
- [5XX](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/500) (Internal Server Errors)

Use the `maxRetries` request option to configure this behavior.

```java
import com.seed.pagination.core.RequestOptions;

client.complex().search(
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
import com.seed.pagination.SeedPaginationClient;
import com.seed.pagination.core.RequestOptions;

// Client level
SeedPaginationClient client = SeedPaginationClient
    .builder()
    .timeout(10)
    .build();

// Request level
client.complex().search(
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