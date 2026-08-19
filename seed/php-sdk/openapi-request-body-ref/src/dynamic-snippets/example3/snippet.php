<?php

namespace Example;

use Seed\SeedClient;
use Seed\Vendor\Requests\CreateVendorRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->vendor->createVendor(
    new CreateVendorRequest([
        'idempotencyKey' => 'idempotencyKey',
        'name' => 'name',
        'address' => 'address',
    ]),
);
