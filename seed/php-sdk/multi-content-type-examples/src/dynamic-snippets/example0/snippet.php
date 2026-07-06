<?php

namespace Example;

use Seed\SeedClient;
use Seed\Clients\Requests\ClientRequest;
use Seed\Types\Client;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->clients->create(
    new ClientRequest([
        'client' => new Client([
            'name' => 'Acme Corp',
            'email' => 'contact@acme.com',
        ]),
    ]),
);
