# Seed Java Library

[![fern shield](https://img.shields.io/badge/%F0%9F%8C%BF-Built%20with%20Fern-brightgreen)](https://buildwithfern.com?utm_source=github&utm_medium=github&utm_campaign=readme&utm_source=Seed%2FJava)

The Seed Java library provides convenient access to the Seed API from Java.

## Usage

Instantiate and use the client with the following:

```java
package com.example.usage;

import com.seed.api.SeedApiClient;
import com.seed.api.types.CreateMovieRequest;

public class Example {
    public static void run() {
        SeedApiClient client = SeedApiClient
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

## Authentication

You can omit the token when constructing the client. In this case, the SDK will automatically read the token from the environment variable:

```java
```

## Base Url

You can set a custom base URL when constructing the client.

```java
package com.example.usage;

import com.seed.api.SeedApiClient;

SeedApiClient client = SeedApiClient.builder().url("https://example.com").build();
```

## Errors

When the API returns a non-success status code (4xx or 5xx response), an API exception will be thrown.

```java
package com.example.usage;

import com.seed.api.core.SeedApiApiException;

try {
    client.imdb().createMovie(...);
} catch (SeedApiApiException e) {
    // Do something with the API exception...
}
```

## Advanced

### Custom Client

This SDK is built to work with any instance of `OkHttpClient`. By default, if no client is provided, the SDK will construct one. 
However, you can pass your own client like so:

```java
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
package com.example.usage;

import com.seed.api.core.RequestOptions;

client.imdb().createMovie(..., RequestOptions.builder().maxRetries(1).build());
```

### Timeouts

Setting a timeout for each individual request is as simple as using the standard context library. Setting a one second timeout for an individual API call looks like the following:

```java
package com.example.usage;

import com.seed.api.core.RequestOptions;

client.imdb().createMovie(..., RequestOptions.builder().timeout(10).build());
```

## Contributing

While we value open-source contributions to this SDK, this library is generated programmatically.
Additions made directly to this library would have to be moved over to our generation code,
otherwise they would be overwritten upon the next generated release. Feel free to open a PR as
a proof of concept, but know that we will not be able to merge it as-is. We suggest opening
an issue first to discuss with us!

On the other hand, contributions to the README are always very welcome!