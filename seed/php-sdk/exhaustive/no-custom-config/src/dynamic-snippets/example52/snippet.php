<?php

namespace Example;

use Seed\SeedClient;
use Seed\Types\TypesObjectWithDatetimeLikeString;
use DateTime;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->endpointsObject->endpointsObjectGetAndReturnWithDatetimeLikeString(
    new TypesObjectWithDatetimeLikeString([
        'datetimeLikeString' => 'datetimeLikeString',
        'actualDatetime' => new DateTime('2024-01-15T09:30:00Z'),
    ]),
);
