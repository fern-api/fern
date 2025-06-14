# Seed PHP Library

[![fern shield](https://img.shields.io/badge/%F0%9F%8C%BF-Built%20with%20Fern-brightgreen)](https://buildwithfern.com?utm_source=github&utm_medium=github&utm_campaign=readme&utm_source=Seed%2FPHP)
[![php shield](https://img.shields.io/badge/php-packagist-pink)](https://packagist.org/packages/seed/seed)

The Seed PHP library provides convenient access to the Seed API from PHP.

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
use Seed\Nullable\Requests\CreateUserRequest;
use Seed\Nullable\Types\Metadata;
use DateTime;
use Seed\Nullable\Types\Status;

$client = new SeedClient();
$client->nullable->createUser(
    new CreateUserRequest([
        'username' => 'username',
        'tags' => [
            'tags',
            'tags',
        ],
        'metadata' => new Metadata([
            'createdAt' => new DateTime('2024-01-15T09:30:00Z'),
            'updatedAt' => new DateTime('2024-01-15T09:30:00Z'),
            'avatar' => 'avatar',
            'activated' => true,
            'status' => Status::active(),
            'values' => [
                'values' => 'values',
            ],
        ]),
        'avatar' => 'avatar',
    ]),
);

```

## Contributing

While we value open-source contributions to this SDK, this library is generated programmatically.
Additions made directly to this library would have to be moved over to our generation code,
otherwise they would be overwritten upon the next generated release. Feel free to open a PR as
a proof of concept, but know that we will not be able to merge it as-is. We suggest opening
an issue first to discuss with us!

On the other hand, contributions to the README are always very welcome!