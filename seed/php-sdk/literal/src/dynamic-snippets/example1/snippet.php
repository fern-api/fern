<?php

namespace Example;

use Seed\SeedClient;
use Seed\Headers\Requests\HeadersSendRequest;
use Seed\Headers\Types\HeadersSendRequestXEndpointVersion;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->headers->send(
    new HeadersSendRequest([
        'endpointVersion' => HeadersSendRequestXEndpointVersion::Two122024->value,
        'async' => true,
        'query' => 'query',
    ]),
);
