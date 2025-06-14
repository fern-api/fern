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
use Seed\Complex\Types\SearchRequest;
use Seed\Complex\Types\StartingAfterPaging;
use Seed\Complex\Types\SingleFilterSearchRequest;
use Seed\Complex\Types\SingleFilterSearchRequestOperator;

$client = new SeedClient(
    token: '<token>',
);
$client->complex->search(
    'index',
    new SearchRequest([
        'pagination' => new StartingAfterPaging([
            'perPage' => 1,
            'startingAfter' => 'starting_after',
        ]),
        'query' => new SingleFilterSearchRequest([
            'field' => 'field',
            'operator' => SingleFilterSearchRequestOperator::Equals->value,
            'value' => 'value',
        ]),
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