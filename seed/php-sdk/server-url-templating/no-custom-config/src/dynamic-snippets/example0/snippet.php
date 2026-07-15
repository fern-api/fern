<?php

namespace Example;

use Seed\SeedClient;
use Seed\Environments;

$client = new SeedClient(
    environment: Environments::RegionalApiServer(),
);
$client->getUsers();
