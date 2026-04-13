<?php

namespace Example;

use Seed\SeedClient;
use Seed\Conversations\Requests\OutboundCallConversationsRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->conversations->outboundCall(
    new OutboundCallConversationsRequest([
        'toPhoneNumber' => 'to_phone_number',
        'dryRun' => true,
    ]),
);
