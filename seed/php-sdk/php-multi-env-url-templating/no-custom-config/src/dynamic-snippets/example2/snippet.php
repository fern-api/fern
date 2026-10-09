<?php

namespace Example;

use Seed\SeedClient;
use Seed\Environments;

$client = new SeedClient(
    environment: Environments::Production(),
);
$client->core->listThings();
