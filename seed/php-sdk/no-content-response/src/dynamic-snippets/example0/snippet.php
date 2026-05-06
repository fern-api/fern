<?php

namespace Example;

use Seed\SeedClient;
use Seed\Contacts\Requests\ContactsCreateRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->contacts->create(
    new ContactsCreateRequest([
        'name' => 'name',
    ]),
);
