<?php

namespace Example;

use Seed\SeedClient;
use Seed\InlinedRequests\Requests\PostWithObjectBodyandResponseInlinedRequestsRequest;
use Seed\Types\TypesObjectWithOptionalField;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->inlinedRequests->postWithObjectBodyandResponse(
    new PostWithObjectBodyandResponseInlinedRequestsRequest([
        'string' => 'string',
        'integer' => 1,
        'nestedObject' => new TypesObjectWithOptionalField([]),
    ]),
);
