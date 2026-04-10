<?php

namespace Example;

use Seed\SeedClient;
use Seed\Query\Requests\QuerySendRequest;
use Seed\Query\Types\QuerySendRequestPrompt;
use Seed\Types\AliasToPrompt;

$client = new SeedClient(
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->query->send(
    new QuerySendRequest([
        'prompt' => QuerySendRequestPrompt::YouAreAHelpfulAssistant->value,
        'aliasPrompt' => AliasToPrompt::YouAreAHelpfulAssistant->value,
        'query' => 'query',
        'stream' => true,
        'aliasStream' => true,
    ]),
);
