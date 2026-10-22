<?php

namespace Example;

use Seed\SeedClient;
use Seed\Messages\Types\Message;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->messages->messages->createMessage(
    new Message([
        'sid' => 'sid',
        'body' => 'body',
    ]),
);
