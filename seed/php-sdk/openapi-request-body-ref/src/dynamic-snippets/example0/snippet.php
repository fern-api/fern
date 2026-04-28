<?php

namespace Example;

use Seed\SeedClient;
use Seed\Vendor\Requests\UpdateVendorBody;
use Seed\Types\UpdateVendorRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->vendor->updateVendor(
    'vendor_id',
    new UpdateVendorBody([
        'body' => new UpdateVendorRequest([
            'name' => 'name',
        ]),
    ]),
);
