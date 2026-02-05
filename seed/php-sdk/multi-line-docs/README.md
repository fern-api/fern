# Seed PHP Library

[![fern shield](https://img.shields.io/badge/%F0%9F%8C%BF-Built%20with%20Fern-brightgreen)](https://buildwithfern.com?utm_source=github&utm_medium=github&utm_campaign=readme&utm_source=Seed%2FPHP)
[![php shield](https://img.shields.io/badge/php-packagist-pink)](https://packagist.org/packages/seed/seed)

The Seed PHP library provides convenient access to the Seed APIs from PHP.

## Table of Contents

- [Requirements](#requirements)
- [Installation](#installation)
- [Usage](#usage)
- [Exception Handling](#exception-handling)
- [Advanced](#advanced)
  - [Custom Client](#custom-client)
  - [Retries](#retries)
  - [Timeouts](#timeouts)
- [Contributing](#contributing)

## Requirements

This SDK requires PHP ^8.1.

## Installation

```sh
composer require seed/seed
```

## Usage

Instantiate and use the client with the following:

```php
<?php

namespace Example;

use Seed\SeedClient;
use Seed\User\Requests\CreateUserRequest;

$client = new SeedClient();
$client->user->createUser(
    new CreateUserRequest([
        'name' => 'name',
        'age' => 1,
    ]),
);

```

## Exception Handling

When the API returns a non-success status code (4xx or 5xx response), an exception will be thrown.

```php
use Seed\Exceptions\SeedApiException;
use Seed\Exceptions\SeedException;

try {
    $response = $client->user->createUser(...);
} catch (SeedApiException $e) {
    echo 'API Exception occurred: ' . $e->getMessage() . "\n";
    echo 'Status Code: ' . $e->getCode() . "\n";
    echo 'Response Body: ' . $e->getBody() . "\n";
    // Optionally, rethrow the exception or handle accordingly.
}
```

## Advanced

### Custom Client

This SDK is built to work with any HTTP client that implements Guzzle's `ClientInterface`.
By default, if no client is provided, the SDK will use Guzzle's default HTTP client.
However, you can pass your own client that adheres to `ClientInterface`:

```php
use Seed\SeedClient;

// Create a custom Guzzle client with specific configuration.
$customClient = new \GuzzleHttp\Client([
    'timeout' => 5.0,
]);

// Pass the custom client when creating an instance of the class.
$client = new SeedClient(options: [
    'client' => $customClient
]);

// You can also utilize the same technique to leverage advanced customizations to the client such as adding middleware
$handlerStack = \GuzzleHttp\HandlerStack::create();
$handlerStack->push(MyCustomMiddleware::create());
$customClient = new \GuzzleHttp\Client(['handler' => $handlerStack]);

// Pass the custom client when creating an instance of the class.
$client = new SeedClient(options: [
    'client' => $customClient
]);
```

### Retries

The SDK is instrumented with automatic retries with exponential backoff. A request will be retried as long
as the request is deemed retryable and the number of retry attempts has not grown larger than the configured
retry limit (default: 2).

A request is deemed retryable when any of the following HTTP status codes is returned:

- [408](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/408) (Timeout)
- [429](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429) (Too Many Requests)
- [5XX](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/500) (Internal Server Errors)

Use the `maxRetries` request option to configure this behavior.

```php
$response = $client->user->createUser(
    ...,
    options: [
        'maxRetries' => 0 // Override maxRetries at the request level
    ]
);
```

### Timeouts

The SDK defaults to a 30 second timeout. Use the `timeout` option to configure this behavior.

```php
$response = $client->user->createUser(
    ...,
    options: [
        'timeout' => 3.0 // Override timeout to 3 seconds
    ]
);
```

## Contributing

While we value open-source contributions to this SDK, this library is generated programmatically.
Additions made directly to this library would have to be moved over to our generation code,
otherwise they would be overwritten upon the next generated release. Feel free to open a PR as
a proof of concept, but know that we will not be able to merge it as-is. We suggest opening
an issue first to discuss with us!

On the other hand, contributions to the README are always very welcome!