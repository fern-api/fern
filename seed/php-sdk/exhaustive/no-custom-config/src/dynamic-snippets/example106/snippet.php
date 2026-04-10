<?php

namespace Example;

use Seed\SeedClient;
use Seed\Inlinedrequests\Requests\InlinedRequestsPostWithObjectBodyandResponseRequest;
use Seed\Types\TypesObjectWithOptionalField;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->inlinedrequests->postwithobjectbodyandresponse(
    new InlinedRequestsPostWithObjectBodyandResponseRequest([
        'string' => 'string',
        'integer' => 1,
        'nestedObject' => new TypesObjectWithOptionalField([]),
    ]),
);
