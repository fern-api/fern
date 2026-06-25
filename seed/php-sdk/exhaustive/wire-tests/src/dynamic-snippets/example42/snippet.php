<?php

namespace Example;

use Seed\SeedClient;
use Seed\Endpoints\Params\Requests\CreateWithBodyAndQuery;
use Seed\Types\Object\Types\ObjectWithRequiredField;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->endpoints->params->createWithBodyAndQuery(
    new CreateWithBodyAndQuery([
        'fields' => '_fields',
        'body' => new ObjectWithRequiredField([
            'string' => 'string',
        ]),
    ]),
);
