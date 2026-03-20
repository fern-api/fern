<?php

namespace Example;

use Seed\SeedClient;
use Seed\Types\Object\Types\ObjectWithDatetimeLikeString;
use DateTime;

$client = new SeedClient(
    token: '<token>',
    options: [
        'baseUrl' => 'https://api.fern.com',
    ],
);
$client->endpoints->object->getAndReturnWithDatetimeLikeString(
    new ObjectWithDatetimeLikeString([
        'datetimeLikeString' => 'datetimeLikeString',
        'actualDatetime' => new DateTime('2024-01-15T09:30:00Z'),
    ]),
);
