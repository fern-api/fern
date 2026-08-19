<?php

namespace Example;

use Seed\SeedClient;
use Seed\Contacts\Requests\CreateContactRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->contacts->create(
    new CreateContactRequest([
        'name' => 'name',
        'email' => 'email',
    ]),
);
