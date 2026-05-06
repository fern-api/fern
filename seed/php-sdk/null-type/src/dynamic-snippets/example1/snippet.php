<?php

namespace Example;

use Seed\SeedClient;
use Seed\Conversations\Requests\ConversationsOutboundCallRequest;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->conversations->outboundcall(
    new ConversationsOutboundCallRequest([
        'toPhoneNumber' => 'to_phone_number',
        'dryRun' => true,
    ]),
);
