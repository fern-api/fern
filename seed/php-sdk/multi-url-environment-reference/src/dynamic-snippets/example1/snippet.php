<?php

namespace Example;

use Seed\SeedClient;
use Seed\Environments;

$client = new SeedClient(
    token: '<token>',
    environment: Environments::Production(),
);
$client->items->listItems();
